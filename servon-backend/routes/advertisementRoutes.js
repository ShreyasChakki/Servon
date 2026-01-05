const express = require('express');
const router = express.Router();
const {
    createAdvertisement,
    getMyAdvertisements,
    getActiveAdvertisements,
    getAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    recordClick
} = require('../controllers/advertisementController');
const { protect } = require('../middleware/auth');
const { isVendor } = require('../middleware/roleCheck');

// Public routes
router.get('/', getActiveAdvertisements);
router.get('/:id', getAdvertisement);
router.post('/:id/click', recordClick);

// Vendor protected routes
router.post('/', protect, isVendor, createAdvertisement);
router.get('/my/list', protect, isVendor, getMyAdvertisements);
router.put('/:id', protect, isVendor, updateAdvertisement);
router.delete('/:id', protect, isVendor, deleteAdvertisement);

module.exports = router;
