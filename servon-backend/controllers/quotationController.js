const Quotation = require('../models/Quotation');
const ServiceRequest = require('../models/ServiceRequest');
const Wallet = require('../models/Wallet');
const { QUOTATION_FEE } = require('../utils/constants');

// @desc    Send quotation (₹1 deducted)
// @route   POST /api/quotations/send
// @access  Private (Vendor)
const sendQuotation = async (req, res, next) => {
    try {
        const { requestId, price, message, estimatedDuration } = req.body;

        // Validate input
        if (!requestId || !price || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please provide requestId, price, and message'
            });
        }

        // Check if service request exists and is open
        const serviceRequest = await ServiceRequest.findById(requestId);
        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                error: 'Service request not found'
            });
        }

        if (serviceRequest.status !== 'open') {
            return res.status(400).json({
                success: false,
                error: 'This service request is no longer accepting quotations'
            });
        }

        // Check if vendor already sent quotation
        const existingQuotation = await Quotation.findOne({
            requestId,
            vendorId: req.user._id
        });

        if (existingQuotation) {
            return res.status(400).json({
                success: false,
                error: 'You have already sent a quotation for this request'
            });
        }

        // Get or create vendor wallet
        const wallet = await Wallet.getOrCreateWallet(req.user._id);

        // Check if vendor has sufficient balance
        if (wallet.balance < QUOTATION_FEE) {
            return res.status(400).json({
                success: false,
                error: `Insufficient wallet balance. You need at least ₹${QUOTATION_FEE} to send a quotation. Current balance: ₹${wallet.balance}`
            });
        }

        // Create quotation
        const quotation = await Quotation.create({
            requestId,
            vendorId: req.user._id,
            customerId: serviceRequest.customerId,
            price,
            message,
            estimatedDuration,
            status: 'sent',
            paymentStatus: 'paid'
        });

        // Deduct ₹1 from wallet
        await wallet.deductFunds(
            QUOTATION_FEE,
            `Quotation fee for request: ${serviceRequest.title}`,
            quotation._id,
            'Quotation'
        );

        // Increment quotations count on service request
        await ServiceRequest.findByIdAndUpdate(requestId, {
            $inc: { quotationsCount: 1 }
        });

        // Populate vendor info for response
        await quotation.populate('vendorId', 'name email phone businessName businessCategory');

        res.status(201).json({
            success: true,
            data: quotation,
            message: `Quotation sent successfully! ₹${QUOTATION_FEE} deducted from wallet.`,
            newBalance: wallet.balance
        });
    } catch (error) {
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            // Log detailed info about the duplicate key error
            console.error('Duplicate key error details:', {
                keyPattern: error.keyPattern,
                keyValue: error.keyValue,
                requestId: req.body.requestId,
                vendorId: req.user._id
            });

            return res.status(400).json({
                success: false,
                error: 'You have already sent a quotation for this request'
            });
        }
        next(error);
    }
};

// @desc    Get quotations received for a request (for customers)
// @route   GET /api/quotations/received/:requestId
// @access  Private (Customer)
const getReceivedQuotations = async (req, res, next) => {
    try {
        const { requestId } = req.params;

        // Verify the request belongs to the customer
        const serviceRequest = await ServiceRequest.findById(requestId);
        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                error: 'Service request not found'
            });
        }

        if (serviceRequest.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view quotations for this request'
            });
        }

        const quotations = await Quotation.find({ requestId })
            .populate('vendorId', 'name businessName phone email')
            .populate('customerId', 'name phone email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: quotations.length,
            data: quotations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my sent quotations (for vendors)
// @route   GET /api/quotations/my
// @access  Private (Vendor)
const getMyQuotations = async (req, res, next) => {
    try {
        const quotations = await Quotation.find({ vendorId: req.user._id })
            .populate('requestId', 'title category location status')
            .populate('customerId', 'name phone email')
            .populate('vendorId', 'name businessName')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: quotations.length,
            data: quotations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single quotation
// @route   GET /api/quotations/:id
// @access  Private
const getQuotation = async (req, res, next) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('requestId')
            .populate('customerId', 'name email phone');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                error: 'Quotation not found'
            });
        }

        // Only vendor or customer can view
        if (
            quotation.vendorId._id.toString() !== req.user._id.toString() &&
            quotation.customerId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this quotation'
            });
        }

        res.status(200).json({
            success: true,
            data: quotation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept quotation
// @route   PUT /api/quotations/:id/accept
// @access  Private (Customer)
const acceptQuotation = async (req, res, next) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                error: 'Quotation not found'
            });
        }

        // Verify customer owns the related request
        if (quotation.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to accept this quotation'
            });
        }

        if (quotation.status !== 'sent') {
            return res.status(400).json({
                success: false,
                error: 'This quotation has already been processed'
            });
        }

        // Accept this quotation
        quotation.status = 'accepted';
        await quotation.save();

        // Update service request status
        await ServiceRequest.findByIdAndUpdate(quotation.requestId, {
            status: 'in_progress'
        });

        // Reject other quotations for this request
        await Quotation.updateMany(
            {
                requestId: quotation.requestId,
                _id: { $ne: quotation._id },
                status: 'sent'
            },
            { status: 'rejected' }
        );

        res.status(200).json({
            success: true,
            data: quotation,
            message: 'Quotation accepted successfully!'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject quotation
// @route   PUT /api/quotations/:id/reject
// @access  Private (Customer)
const rejectQuotation = async (req, res, next) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                error: 'Quotation not found'
            });
        }

        // Verify customer owns the related request
        if (quotation.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to reject this quotation'
            });
        }

        if (quotation.status !== 'sent') {
            return res.status(400).json({
                success: false,
                error: 'This quotation has already been processed'
            });
        }

        quotation.status = 'rejected';
        await quotation.save();

        res.status(200).json({
            success: true,
            data: quotation,
            message: 'Quotation rejected'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendQuotation,
    getReceivedQuotations,
    getMyQuotations,
    getQuotation,
    acceptQuotation,
    rejectQuotation
};
