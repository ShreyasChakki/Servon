const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    getVendorReports,
    updateReportStatus,
    getReportStats
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Customer routes
router.post('/', protect, createReport);

// Admin routes
router.get('/', protect, isAdmin, getReports);
router.get('/stats', protect, isAdmin, getReportStats);
router.get('/vendor/:vendorId', protect, isAdmin, getVendorReports);
router.put('/:id', protect, isAdmin, updateReportStatus);

module.exports = router;
