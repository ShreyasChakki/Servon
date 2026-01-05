const express = require('express');
const router = express.Router();
const {
    createServiceRequest,
    getServiceRequests,
    getMyServiceRequests,
    getServiceRequest,
    updateServiceRequest,
    deleteServiceRequest,
    getServiceRequestsByCategory
} = require('../controllers/serviceRequestController');
const { protect } = require('../middleware/auth');
const { isCustomer, isVendor } = require('../middleware/roleCheck');

// Customer routes
router.post('/', protect, isCustomer, createServiceRequest);
router.get('/my', protect, isCustomer, getMyServiceRequests);

// Vendor routes (browse requests)
router.get('/', protect, isVendor, getServiceRequests);
router.get('/category/:category', protect, isVendor, getServiceRequestsByCategory);

// Shared routes
router.get('/:id', protect, getServiceRequest);
router.put('/:id', protect, isCustomer, updateServiceRequest);
router.delete('/:id', protect, isCustomer, deleteServiceRequest);

module.exports = router;
