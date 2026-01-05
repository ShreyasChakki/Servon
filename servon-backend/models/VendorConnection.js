const mongoose = require('mongoose');
const { CONNECTION_STATUS } = require('../utils/constants');

const vendorConnectionSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: CONNECTION_STATUS,
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: 500,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate connection requests
vendorConnectionSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });

// Pre-find hook to populate user details
vendorConnectionSchema.pre(/^find/, function (next) {
    this.populate('requesterId', 'name businessName phone email serviceCategories');
    this.populate('receiverId', 'name businessName phone email serviceCategories');
    next();
});

// Static method to check if two vendors are connected
vendorConnectionSchema.statics.areConnected = async function (userId1, userId2) {
    const connection = await this.findOne({
        $or: [
            { requesterId: userId1, receiverId: userId2, status: 'connected' },
            { requesterId: userId2, receiverId: userId1, status: 'connected' }
        ]
    });
    return !!connection;
};

// Static method to get connection between two users
vendorConnectionSchema.statics.getConnection = async function (userId1, userId2) {
    return this.findOne({
        $or: [
            { requesterId: userId1, receiverId: userId2 },
            { requesterId: userId2, receiverId: userId1 }
        ]
    });
};

module.exports = mongoose.model('VendorConnection', vendorConnectionSchema);
