const VendorConnection = require('../models/VendorConnection');
const User = require('../models/User');

// @desc    Get all vendors (for network browsing)
// @route   GET /api/network/vendors
// @access  Private (Vendor)
const getVendors = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { category, search } = req.query;

        const query = {
            role: 'vendor',
            _id: { $ne: currentUserId }
        };

        if (category) {
            query.serviceCategories = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { businessName: { $regex: search, $options: 'i' } }
            ];
        }

        const vendors = await User.find(query)
            .select('name businessName phone location serviceCategories createdAt')
            .sort('-createdAt')
            .limit(50);

        // Get connection status for each vendor
        const vendorsWithStatus = await Promise.all(vendors.map(async (vendor) => {
            const connection = await VendorConnection.getConnection(currentUserId, vendor._id);
            return {
                ...vendor.toObject(),
                connectionStatus: connection ? connection.status : null,
                connectionId: connection ? connection._id : null,
                isRequester: connection ? connection.requesterId._id.toString() === currentUserId.toString() : false
            };
        }));

        res.status(200).json({
            success: true,
            count: vendorsWithStatus.length,
            data: vendorsWithStatus
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send connection request
// @route   POST /api/network/connect
// @access  Private (Vendor)
const sendConnectionRequest = async (req, res, next) => {
    try {
        const { receiverId, message } = req.body;
        const requesterId = req.user._id;

        if (requesterId.toString() === receiverId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot connect with yourself'
            });
        }

        // Check if receiver exists and is a vendor
        const receiver = await User.findById(receiverId);
        if (!receiver || receiver.role !== 'vendor') {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        // Check if connection already exists
        const existingConnection = await VendorConnection.getConnection(requesterId, receiverId);
        if (existingConnection) {
            return res.status(400).json({
                success: false,
                error: `Connection already exists with status: ${existingConnection.status}`
            });
        }

        const connection = await VendorConnection.create({
            requesterId,
            receiverId,
            message: message || ''
        });

        res.status(201).json({
            success: true,
            data: connection
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Connection request already sent'
            });
        }
        next(error);
    }
};

// @desc    Get my connections
// @route   GET /api/network/connections
// @access  Private (Vendor)
const getMyConnections = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { status = 'connected' } = req.query;

        const connections = await VendorConnection.find({
            $or: [
                { requesterId: userId },
                { receiverId: userId }
            ],
            status
        }).sort('-updatedAt');

        // Format to show the "other" user
        const formattedConnections = connections.map(conn => {
            const otherUser = conn.requesterId._id.toString() === userId.toString()
                ? conn.receiverId
                : conn.requesterId;

            return {
                connectionId: conn._id,
                status: conn.status,
                message: conn.message,
                createdAt: conn.createdAt,
                otherUser
            };
        });

        res.status(200).json({
            success: true,
            count: formattedConnections.length,
            data: formattedConnections
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending requests (received)
// @route   GET /api/network/requests
// @access  Private (Vendor)
const getPendingRequests = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const requests = await VendorConnection.find({
            receiverId: userId,
            status: 'pending'
        }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept connection request
// @route   PUT /api/network/:id/accept
// @access  Private (Vendor)
const acceptRequest = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const connectionId = req.params.id;

        const connection = await VendorConnection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({
                success: false,
                error: 'Connection request not found'
            });
        }

        // Only receiver can accept
        if (connection.receiverId._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Only the receiver can accept this request'
            });
        }

        if (connection.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Request is already ${connection.status}`
            });
        }

        connection.status = 'connected';
        await connection.save();

        res.status(200).json({
            success: true,
            data: connection
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject connection request
// @route   PUT /api/network/:id/reject
// @access  Private (Vendor)
const rejectRequest = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const connectionId = req.params.id;

        const connection = await VendorConnection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({
                success: false,
                error: 'Connection request not found'
            });
        }

        // Only receiver can reject
        if (connection.receiverId._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Only the receiver can reject this request'
            });
        }

        connection.status = 'rejected';
        await connection.save();

        res.status(200).json({
            success: true,
            data: connection
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove connection
// @route   DELETE /api/network/:id
// @access  Private (Vendor)
const removeConnection = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const connectionId = req.params.id;

        const connection = await VendorConnection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({
                success: false,
                error: 'Connection not found'
            });
        }

        // Either party can remove
        const isParticipant =
            connection.requesterId._id.toString() === userId.toString() ||
            connection.receiverId._id.toString() === userId.toString();

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }

        await connection.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Connection removed'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVendors,
    sendConnectionRequest,
    getMyConnections,
    getPendingRequests,
    acceptRequest,
    rejectRequest,
    removeConnection
};
