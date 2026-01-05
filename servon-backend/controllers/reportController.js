const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Create a report
// @route   POST /api/reports
// @access  Private (Customer)
const createReport = async (req, res, next) => {
    try {
        const { vendorId, quotationId, conversationId, reason, description } = req.body;
        const reporterId = req.user._id;

        // Validate required fields
        if (!vendorId || !reason || !description) {
            return res.status(400).json({
                success: false,
                error: 'Please provide vendorId, reason, and description'
            });
        }

        // Check if vendor exists and is actually a vendor
        const vendor = await User.findById(vendorId);
        if (!vendor || vendor.role !== 'vendor') {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        // Prevent self-reporting
        if (vendorId.toString() === reporterId.toString()) {
            return res.status(400).json({
                success: false,
                error: 'You cannot report yourself'
            });
        }

        // Check for duplicate report (same reporter, vendor, quotation)
        const existingReport = await Report.findOne({
            reporterId,
            vendorId,
            quotationId: quotationId || null
        });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                error: 'You have already reported this vendor for this transaction'
            });
        }

        // Create report
        const report = await Report.create({
            reporterId,
            vendorId,
            quotationId: quotationId || null,
            conversationId: conversationId || null,
            reason,
            description
        });

        res.status(201).json({
            success: true,
            data: report,
            message: 'Report submitted successfully. Our team will review it shortly.'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reports (admin)
// @route   GET /api/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
    try {
        const { status, vendorId, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (vendorId) filter.vendorId = vendorId;

        const reports = await Report.find(filter)
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('quotationId', 'price description');

        const total = await Report.countDocuments(filter);

        // Get vendor report counts for each unique vendor
        const vendorIds = [...new Set(reports.map(r => r.vendorId?._id?.toString()))];
        const vendorReportCounts = {};

        for (const vId of vendorIds) {
            if (vId) {
                vendorReportCounts[vId] = await Report.getVendorReportCount(vId);
            }
        }

        res.status(200).json({
            success: true,
            data: reports,
            vendorReportCounts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reports for a specific vendor
// @route   GET /api/reports/vendor/:vendorId
// @access  Private (Admin)
const getVendorReports = async (req, res, next) => {
    try {
        const { vendorId } = req.params;

        const reports = await Report.find({ vendorId })
            .sort('-createdAt')
            .populate('quotationId', 'price description');

        const totalCount = await Report.getVendorReportCount(vendorId);

        // Count by status
        const statusCounts = {
            pending: await Report.countDocuments({ vendorId, status: 'pending' }),
            reviewed: await Report.countDocuments({ vendorId, status: 'reviewed' }),
            resolved: await Report.countDocuments({ vendorId, status: 'resolved' }),
            dismissed: await Report.countDocuments({ vendorId, status: 'dismissed' })
        };

        res.status(200).json({
            success: true,
            data: reports,
            totalCount,
            statusCounts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update report status
// @route   PUT /api/reports/:id
// @access  Private (Admin)
const updateReportStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        // Update report
        report.status = status || report.status;
        report.adminNotes = adminNotes !== undefined ? adminNotes : report.adminNotes;
        report.reviewedBy = req.user._id;
        report.reviewedAt = new Date();

        await report.save();

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get report statistics (for admin dashboard)
// @route   GET /api/reports/stats
// @access  Private (Admin)
const getReportStats = async (req, res, next) => {
    try {
        const total = await Report.countDocuments();
        const pending = await Report.countDocuments({ status: 'pending' });
        const reviewed = await Report.countDocuments({ status: 'reviewed' });
        const resolved = await Report.countDocuments({ status: 'resolved' });
        const dismissed = await Report.countDocuments({ status: 'dismissed' });

        // Get vendors with most reports
        const topReportedVendors = await Report.aggregate([
            { $group: { _id: '$vendorId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vendor'
                }
            },
            { $unwind: '$vendor' },
            {
                $project: {
                    vendorId: '$_id',
                    name: '$vendor.businessName',
                    email: '$vendor.email',
                    count: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                reviewed,
                resolved,
                dismissed,
                topReportedVendors
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReport,
    getReports,
    getVendorReports,
    updateReportStatus,
    getReportStats
};
