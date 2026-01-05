const AdRequest = require('../models/AdRequest');
const Advertisement = require('../models/Advertisement');
const User = require('../models/User');

// @desc    Send an ad request/inquiry
// @route   POST /api/ad-requests/send
// @access  Private (Customer)
const sendAdRequest = async (req, res, next) => {
    try {
        const { advertisementId, message } = req.body;
        const customerId = req.user._id;

        // Validate input
        if (!advertisementId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please provide advertisementId and message'
            });
        }

        // Check if advertisement exists
        const ad = await Advertisement.findById(advertisementId);
        if (!ad) {
            return res.status(404).json({
                success: false,
                error: 'Advertisement not found'
            });
        }

        // Prevent customer from sending request to their own ad (if they're also a vendor)
        if (ad.vendorId.toString() === customerId.toString()) {
            return res.status(400).json({
                success: false,
                error: 'Cannot send inquiry to your own advertisement'
            });
        }

        // Check for existing request
        const existingRequest = await AdRequest.findOne({
            customerId,
            advertisementId
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                error: 'You have already sent an inquiry for this advertisement'
            });
        }

        // Create the ad request
        const adRequest = await AdRequest.create({
            customerId,
            vendorId: ad.vendorId,
            advertisementId,
            message
        });

        // Populate for response
        await adRequest.populate([
            { path: 'advertisementId', select: 'title category serviceArea' },
            { path: 'vendorId', select: 'name businessName' }
        ]);

        res.status(201).json({
            success: true,
            data: adRequest,
            message: 'Inquiry sent successfully'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'You have already sent an inquiry for this advertisement'
            });
        }
        next(error);
    }
};

// @desc    Get my sent ad requests (for customers)
// @route   GET /api/ad-requests/my
// @access  Private (Customer)
const getMyAdRequests = async (req, res, next) => {
    try {
        const adRequests = await AdRequest.find({ customerId: req.user._id })
            .populate('advertisementId', 'title category serviceArea price')
            .populate('vendorId', 'name businessName phone')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: adRequests.length,
            data: adRequests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get received ad requests (for vendors)
// @route   GET /api/ad-requests/received
// @access  Private (Vendor)
const getReceivedAdRequests = async (req, res, next) => {
    try {
        const adRequests = await AdRequest.find({ vendorId: req.user._id })
            .populate('advertisementId', 'title category serviceArea')
            .populate('customerId', 'name phone email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: adRequests.length,
            data: adRequests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept ad request
// @route   PUT /api/ad-requests/:id/accept
// @access  Private (Vendor)
const acceptAdRequest = async (req, res, next) => {
    try {
        const adRequest = await AdRequest.findById(req.params.id);

        if (!adRequest) {
            return res.status(404).json({
                success: false,
                error: 'Ad request not found'
            });
        }

        // Check if vendor owns this request
        if (adRequest.vendorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to accept this request'
            });
        }

        // Check if already responded
        if (adRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Request has already been ${adRequest.status}`
            });
        }

        adRequest.status = 'accepted';
        adRequest.respondedAt = new Date();
        await adRequest.save();

        // Populate for response
        await adRequest.populate([
            { path: 'advertisementId', select: 'title category' },
            { path: 'customerId', select: 'name phone email' }
        ]);

        res.status(200).json({
            success: true,
            data: adRequest,
            message: 'Request accepted! You can now chat with the customer.'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Decline ad request
// @route   PUT /api/ad-requests/:id/decline
// @access  Private (Vendor)
const declineAdRequest = async (req, res, next) => {
    try {
        const adRequest = await AdRequest.findById(req.params.id);

        if (!adRequest) {
            return res.status(404).json({
                success: false,
                error: 'Ad request not found'
            });
        }

        // Check if vendor owns this request
        if (adRequest.vendorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to decline this request'
            });
        }

        // Check if already responded
        if (adRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Request has already been ${adRequest.status}`
            });
        }

        adRequest.status = 'declined';
        adRequest.respondedAt = new Date();
        await adRequest.save();

        res.status(200).json({
            success: true,
            data: adRequest,
            message: 'Request declined'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single ad request
// @route   GET /api/ad-requests/:id
// @access  Private
const getAdRequest = async (req, res, next) => {
    try {
        const adRequest = await AdRequest.findById(req.params.id)
            .populate('advertisementId', 'title category serviceArea price')
            .populate('vendorId', 'name businessName phone')
            .populate('customerId', 'name phone email');

        if (!adRequest) {
            return res.status(404).json({
                success: false,
                error: 'Ad request not found'
            });
        }

        // Check if user is part of this request
        const userId = req.user._id.toString();
        const isCustomer = adRequest.customerId._id.toString() === userId;
        const isVendor = adRequest.vendorId._id.toString() === userId;

        if (!isCustomer && !isVendor && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this request'
            });
        }

        res.status(200).json({
            success: true,
            data: adRequest
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendAdRequest,
    getMyAdRequests,
    getReceivedAdRequests,
    acceptAdRequest,
    declineAdRequest,
    getAdRequest
};
