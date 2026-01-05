const mongoose = require('mongoose');
const { SERVICE_CATEGORIES, URGENCY_LEVELS, REQUEST_STATUS } = require('../utils/constants');

const serviceRequestSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: SERVICE_CATEGORIES
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
        maxlength: [100, 'Location cannot be more than 100 characters']
    },
    budget: {
        type: Number,
        min: [0, 'Budget cannot be negative']
    },
    urgency: {
        type: String,
        enum: URGENCY_LEVELS,
        default: 'medium'
    },
    status: {
        type: String,
        enum: REQUEST_STATUS,
        default: 'open',
        index: true
    },
    quotationsCount: {
        type: Number,
        default: 0
    },
    images: [{
        type: String
    }]
}, {
    timestamps: true
});

// Index for faster queries
serviceRequestSchema.index({ category: 1, status: 1 });
serviceRequestSchema.index({ createdAt: -1 });

// Virtual for populating quotations
serviceRequestSchema.virtual('quotations', {
    ref: 'Quotation',
    localField: '_id',
    foreignField: 'requestId'
});

// Ensure virtuals are included in JSON
serviceRequestSchema.set('toJSON', { virtuals: true });
serviceRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
