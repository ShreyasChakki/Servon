const express = require('express');
const router = express.Router();
const {
    getVendors,
    sendConnectionRequest,
    getMyConnections,
    getPendingRequests,
    acceptRequest,
    rejectRequest,
    removeConnection
} = require('../controllers/vendorNetworkController');
const { protect } = require('../middleware/auth');
const { isVendor } = require('../middleware/roleCheck');

// All routes require vendor authentication
router.use(protect);
router.use(isVendor);

router.get('/vendors', getVendors);
router.get('/connections', getMyConnections);
router.get('/requests', getPendingRequests);
router.post('/connect', sendConnectionRequest);
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);
router.delete('/:id', removeConnection);

module.exports = router;
