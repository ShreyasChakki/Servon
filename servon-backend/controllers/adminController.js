const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Quotation = require('../models/Quotation');
const Wallet = require('../models/Wallet');
const Advertisement = require('../models/Advertisement');
const VendorConnection = require('../models/VendorConnection');
const Message = require('../models/Message');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
    try {
        // User stats
        const totalUsers = await User.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });

        // New users this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newUsersThisWeek = await User.countDocuments({
            createdAt: { $gte: oneWeekAgo }
        });

        // Service request stats
        const totalRequests = await ServiceRequest.countDocuments();
        const openRequests = await ServiceRequest.countDocuments({ status: 'open' });
        const closedRequests = await ServiceRequest.countDocuments({ status: 'closed' });

        // Quotation stats
        const totalQuotations = await Quotation.countDocuments();
        const acceptedQuotations = await Quotation.countDocuments({ status: 'accepted' });

        // Calculate total revenue from quotation fees (₹1 each)
        const totalRevenue = totalQuotations * 1;

        // Advertisement stats
        const totalAds = await Advertisement.countDocuments();
        const activeAds = await Advertisement.countDocuments({ status: 'active' });

        // Get total ad spend
        const adSpendResult = await Advertisement.aggregate([
            { $group: { _id: null, total: { $sum: '$budget' } } }
        ]);
        const totalAdSpend = adSpendResult[0]?.total || 0;

        // Message stats (chat activity)
        const totalMessages = await Message.countDocuments();

        // Vendor connection stats
        const totalConnections = await VendorConnection.countDocuments({ status: 'connected' });

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    customers: totalCustomers,
                    vendors: totalVendors,
                    newThisWeek: newUsersThisWeek
                },
                requests: {
                    total: totalRequests,
                    open: openRequests,
                    closed: closedRequests
                },
                quotations: {
                    total: totalQuotations,
                    accepted: acceptedQuotations,
                    revenue: totalRevenue
                },
                advertisements: {
                    total: totalAds,
                    active: activeAds,
                    totalSpend: totalAdSpend
                },
                engagement: {
                    messages: totalMessages,
                    connections: totalConnections
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;

        const query = {};

        if (role && ['customer', 'vendor', 'admin'].includes(role)) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { businessName: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            pages: Math.ceil(total / limit),
            page: parseInt(page),
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user details with stats
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get user-specific stats
        let stats = {};

        if (user.role === 'customer') {
            stats.requests = await ServiceRequest.countDocuments({ customerId: user._id });
            stats.quotationsReceived = await Quotation.countDocuments({ customerId: user._id });
        } else if (user.role === 'vendor') {
            const wallet = await Wallet.findOne({ userId: user._id });
            stats.quotationsSent = await Quotation.countDocuments({ vendorId: user._id });
            stats.acceptedQuotations = await Quotation.countDocuments({ vendorId: user._id, status: 'accepted' });
            stats.walletBalance = wallet?.balance || 0;
            stats.ads = await Advertisement.countDocuments({ vendorId: user._id });
            stats.connections = await VendorConnection.countDocuments({
                $or: [{ requesterId: user._id }, { receiverId: user._id }],
                status: 'connected'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                stats
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private (Admin)
const toggleUserBan = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Cannot ban admins
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Cannot ban admin users'
            });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                userId: user._id,
                isBanned: user.isBanned,
                message: user.isBanned ? 'User has been banned' : 'User has been unbanned'
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Cannot delete admins
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Cannot delete admin users'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get recent activity
// @route   GET /api/admin/activity
// @access  Private (Admin)
const getRecentActivity = async (req, res, next) => {
    try {
        const [recentUsers, recentRequests, recentQuotations] = await Promise.all([
            User.find()
                .select('name email role createdAt')
                .sort('-createdAt')
                .limit(5),
            ServiceRequest.find()
                .select('title customerId category status createdAt')
                .populate('customerId', 'name')
                .sort('-createdAt')
                .limit(5),
            Quotation.find()
                .select('vendorId customerId price status createdAt')
                .populate('vendorId', 'businessName name')
                .populate('customerId', 'name')
                .sort('-createdAt')
                .limit(5)
        ]);

        res.status(200).json({
            success: true,
            data: {
                recentUsers,
                recentRequests,
                recentQuotations
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    getUserDetails,
    toggleUserBan,
    deleteUser,
    getRecentActivity
};
