const express = require('express');
const router = express.Router();
const {
    sendAdRequest,
    getMyAdRequests,
    getReceivedAdRequests,
    acceptAdRequest,
    declineAdRequest,
    getAdRequest
} = require('../controllers/adRequestController');
const { protect } = require('../middleware/auth');
const { isCustomer, isVendor } = require('../middleware/roleCheck');

// Customer routes
router.post('/send', protect, isCustomer, sendAdRequest);
router.get('/my', protect, isCustomer, getMyAdRequests);

// Vendor routes
router.get('/received', protect, isVendor, getReceivedAdRequests);
router.put('/:id/accept', protect, isVendor, acceptAdRequest);
router.put('/:id/decline', protect, isVendor, declineAdRequest);

// Shared routes
router.get('/:id', protect, getAdRequest);

module.exports = router;
