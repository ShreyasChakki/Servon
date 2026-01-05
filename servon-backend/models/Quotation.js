const mongoose = require('mongoose');
const { QUOTATION_STATUS } = require('../utils/constants');

const quotationSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: true,
        index: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price cannot be negative']
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    estimatedDuration: {
        type: String,
        maxlength: [100, 'Duration cannot be more than 100 characters']
    },
    status: {
        type: String,
        enum: QUOTATION_STATUS,
        default: 'sent',
        index: true
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'refunded'],
        default: 'paid'
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate quotations
quotationSchema.index({ requestId: 1, vendorId: 1 }, { unique: true });

// Populate vendor and customer info
quotationSchema.pre(/^find/, function (next) {
    this.populate('vendorId', 'name email phone businessName businessCategory');
    next();
});

module.exports = mongoose.model('Quotation', quotationSchema);
