const mongoose = require('mongoose');
const { TRANSACTION_TYPES } = require('../utils/constants');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: TRANSACTION_TYPES,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        enum: ['Quotation', 'Advertisement']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    transactions: [transactionSchema]
}, {
    timestamps: true
});

// Method to add funds
walletSchema.methods.addFunds = async function (amount, description = 'Added funds') {
    this.balance += amount;
    this.transactions.push({
        type: 'credit',
        amount,
        description,
        timestamp: new Date()
    });
    await this.save();
    return this;
};

// Method to deduct funds
walletSchema.methods.deductFunds = async function (amount, description, referenceId, referenceModel) {
    if (this.balance < amount) {
        throw new Error('Insufficient balance');
    }
    this.balance -= amount;
    this.transactions.push({
        type: 'debit',
        amount,
        description,
        referenceId,
        referenceModel,
        timestamp: new Date()
    });
    await this.save();
    return this;
};

// Static method to get or create wallet
walletSchema.statics.getOrCreateWallet = async function (userId) {
    let wallet = await this.findOne({ userId });
    if (!wallet) {
        wallet = await this.create({ userId, balance: 0 });
    }
    return wallet;
};

module.exports = mongoose.model('Wallet', walletSchema);
