const ServiceRequest = require('../models/ServiceRequest');

// @desc    Create new service request
// @route   POST /api/service-requests
// @access  Private (Customer)
const createServiceRequest = async (req, res, next) => {
    try {
        const { title, category, description, location, budget, urgency, images } = req.body;

        const serviceRequest = await ServiceRequest.create({
            customerId: req.user._id,
            title,
            category,
            description,
            location,
            budget,
            urgency,
            images
        });

        res.status(201).json({
            success: true,
            data: serviceRequest
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all open service requests (for vendors)
// @route   GET /api/service-requests
// @access  Private (Vendor)
const getServiceRequests = async (req, res, next) => {
    try {
        const { category, urgency, sort = '-createdAt' } = req.query;

        const query = { status: 'open' };

        if (category) query.category = category;
        if (urgency) query.urgency = urgency;

        const serviceRequests = await ServiceRequest.find(query)
            .populate('customerId', 'name location')
            .sort(sort)
            .lean();

        res.status(200).json({
            success: true,
            count: serviceRequests.length,
            data: serviceRequests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my service requests (for customers)
// @route   GET /api/service-requests/my
// @access  Private (Customer)
const getMyServiceRequests = async (req, res, next) => {
    try {
        const serviceRequests = await ServiceRequest.find({ customerId: req.user._id })
            .sort('-createdAt')
            .lean();

        res.status(200).json({
            success: true,
            count: serviceRequests.length,
            data: serviceRequests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single service request
// @route   GET /api/service-requests/:id
// @access  Private
const getServiceRequest = async (req, res, next) => {
    try {
        const serviceRequest = await ServiceRequest.findById(req.params.id)
            .populate('customerId', 'name email phone location');

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                error: 'Service request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: serviceRequest
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update service request
// @route   PUT /api/service-requests/:id
// @access  Private (Customer - owner only)
const updateServiceRequest = async (req, res, next) => {
    try {
        let serviceRequest = await ServiceRequest.findById(req.params.id);

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                error: 'Service request not found'
            });
        }

        // Check if user is the owner
        if (serviceRequest.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this request'
            });
        }

        const { title, category, description, location, budget, urgency, status, images } = req.body;

        serviceRequest = await ServiceRequest.findByIdAndUpdate(
            req.params.id,
            { title, category, description, location, budget, urgency, status, images },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: serviceRequest
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete service request
// @route   DELETE /api/service-requests/:id
// @access  Private (Customer - owner only)
const deleteServiceRequest = async (req, res, next) => {
    try {
        const serviceRequest = await ServiceRequest.findById(req.params.id);

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                error: 'Service request not found'
            });
        }

        // Check if user is the owner
        if (serviceRequest.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this request'
            });
        }

        await serviceRequest.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get service requests by category
// @route   GET /api/service-requests/category/:category
// @access  Private (Vendor)
const getServiceRequestsByCategory = async (req, res, next) => {
    try {
        const serviceRequests = await ServiceRequest.find({
            category: req.params.category,
            status: 'open'
        })
            .populate('customerId', 'name location')
            .sort('-createdAt')
            .lean();

        res.status(200).json({
            success: true,
            count: serviceRequests.length,
            data: serviceRequests
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createServiceRequest,
    getServiceRequests,
    getMyServiceRequests,
    getServiceRequest,
    updateServiceRequest,
    deleteServiceRequest,
    getServiceRequestsByCategory
};
