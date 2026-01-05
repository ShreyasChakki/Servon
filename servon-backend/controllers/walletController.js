const Wallet = require('../models/Wallet');

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
// @access  Private (Vendor)
const getBalance = async (req, res, next) => {
    try {
        const wallet = await Wallet.getOrCreateWallet(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                balance: wallet.balance,
                lastUpdated: wallet.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add funds to wallet
// @route   POST /api/wallet/add-funds
// @access  Private (Vendor)
const addFunds = async (req, res, next) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid amount'
            });
        }

        const wallet = await Wallet.getOrCreateWallet(req.user._id);
        await wallet.addFunds(Number(amount), `Added ₹${amount} to wallet`);

        res.status(200).json({
            success: true,
            data: {
                balance: wallet.balance,
                message: `Successfully added ₹${amount}`
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private (Vendor)
const getTransactions = async (req, res, next) => {
    try {
        const wallet = await Wallet.getOrCreateWallet(req.user._id);

        // Sort transactions by most recent first
        const transactions = wallet.transactions.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        res.status(200).json({
            success: true,
            data: {
                balance: wallet.balance,
                transactions: transactions.slice(0, 50) // Last 50 transactions
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get full wallet details
// @route   GET /api/wallet
// @access  Private (Vendor)
const getWallet = async (req, res, next) => {
    try {
        const wallet = await Wallet.getOrCreateWallet(req.user._id);

        res.status(200).json({
            success: true,
            data: wallet
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBalance,
    addFunds,
    getTransactions,
    getWallet
};
