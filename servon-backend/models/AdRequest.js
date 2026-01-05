const mongoose = require('mongoose');

const adRequestSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Customer ID is required']
    },
    vendorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Vendor ID is required']
    },
    advertisementId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Advertisement',
        required: [true, 'Advertisement ID is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate requests for same ad by same customer
adRequestSchema.index({ customerId: 1, advertisementId: 1 }, { unique: true });

// Index for efficient queries
adRequestSchema.index({ vendorId: 1, status: 1 });
adRequestSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('AdRequest', adRequestSchema);
