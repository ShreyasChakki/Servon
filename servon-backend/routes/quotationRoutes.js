const express = require('express');
const router = express.Router();
const {
    sendQuotation,
    getReceivedQuotations,
    getMyQuotations,
    getQuotation,
    acceptQuotation,
    rejectQuotation
} = require('../controllers/quotationController');
const { protect } = require('../middleware/auth');
const { isCustomer, isVendor } = require('../middleware/roleCheck');

// Vendor routes
router.post('/send', protect, isVendor, sendQuotation);
router.get('/my', protect, isVendor, getMyQuotations);

// Customer routes
router.get('/received/:requestId', protect, isCustomer, getReceivedQuotations);
router.put('/:id/accept', protect, isCustomer, acceptQuotation);
router.put('/:id/reject', protect, isCustomer, rejectQuotation);

// Shared routes
router.get('/:id', protect, getQuotation);

module.exports = router;
