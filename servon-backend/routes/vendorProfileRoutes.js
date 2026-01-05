const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getVendorPublicProfile, initiateContact } = require('../controllers/vendorProfileController');

// Get vendor public profile with ads
router.get('/:vendorId/profile', protect, getVendorPublicProfile);

// Initiate contact with vendor (customer only)
router.post('/:vendorId/contact', protect, initiateContact);

module.exports = router;
