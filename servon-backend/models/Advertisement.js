const mongoose = require('mongoose');
const { SERVICE_CATEGORIES, AD_STATUS } = require('../utils/constants');

const advertisementSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: SERVICE_CATEGORIES
    },
    serviceArea: {
        type: String,
        required: [true, 'Please specify service area'],
        trim: true
    },
    contactPhone: {
        type: String,
        required: [true, 'Please provide contact phone']
    },
    image: {
        type: String,
        default: null
    },
    budget: {
        type: Number,
        required: [true, 'Please specify ad budget'],
        min: [10, 'Minimum ad budget is ₹10']
    },
    amountSpent: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: AD_STATUS,
        default: 'active'
    },
    views: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Duration brackets based on budget (in days)
// ₹10-25 = 3 days, ₹26-50 = 7 days, ₹51-100 = 15 days, ₹101-200 = 30 days, ₹201+ = 60 days
advertisementSchema.statics.getDurationDays = function (budget) {
    if (budget >= 201) return 60;
    if (budget >= 101) return 30;
    if (budget >= 51) return 15;
    if (budget >= 26) return 7;
    return 3; // ₹10-25
};

// Calculate end date based on budget
advertisementSchema.statics.calculateEndDate = function (budget, startDate = new Date()) {
    const days = this.getDurationDays(budget);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    return endDate;
};

// Index for finding active ads by category
advertisementSchema.index({ status: 1, category: 1 });

// Pre-find hook to populate vendor details
advertisementSchema.pre(/^find/, function (next) {
    this.populate('vendorId', 'name businessName phone');
    next();
});

// Method to increment views
advertisementSchema.methods.addView = async function () {
    this.views += 1;
    await this.save();
};

// Method to increment clicks
advertisementSchema.methods.addClick = async function () {
    this.clicks += 1;
    await this.save();
};

// Static method to get active ads for customer view
advertisementSchema.statics.getActiveAds = async function (category = null, limit = 10) {
    const query = { status: 'active' };
    if (category) {
        query.category = category;
    }

    return this.find(query)
        .sort('-createdAt')
        .limit(limit);
};

module.exports = mongoose.model('Advertisement', advertisementSchema);
