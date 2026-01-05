const express = require('express');
const router = express.Router();
const {
    getBalance,
    addFunds,
    getTransactions,
    getWallet
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');
const { isVendor } = require('../middleware/roleCheck');

// All routes require vendor role
router.use(protect, isVendor);

router.get('/', getWallet);
router.get('/balance', getBalance);
router.post('/add-funds', addFunds);
router.get('/transactions', getTransactions);

module.exports = router;
