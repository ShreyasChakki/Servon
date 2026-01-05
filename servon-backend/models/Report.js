const mongoose = require('mongoose');

const REPORT_REASONS = [
    'scam',           // Scam / Fraud
    'harassment',     // Harassment / Abusive behavior
    'fake_service',   // Fake service / Did not deliver
    'unprofessional', // Unprofessional conduct
    'other'           // Other
];

const REPORT_STATUS = ['pending', 'reviewed', 'resolved', 'dismissed'];

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    quotationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation',
        default: null
    },
    conversationId: {
        type: String,
        default: null
    },
    reason: {
        type: String,
        enum: REPORT_REASONS,
        required: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description of the issue'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: REPORT_STATUS,
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate reports for same vendor/quotation
reportSchema.index({ reporterId: 1, vendorId: 1, quotationId: 1 });

// Static method to get report count for a vendor
reportSchema.statics.getVendorReportCount = async function (vendorId) {
    return this.countDocuments({ vendorId });
};

// Static method to get pending report count
reportSchema.statics.getPendingCount = async function () {
    return this.countDocuments({ status: 'pending' });
};

// Pre-find hook to populate user details
reportSchema.pre(/^find/, function (next) {
    this.populate('reporterId', 'name email phone');
    this.populate('vendorId', 'name businessName email phone');
    this.populate('reviewedBy', 'name');
    next();
});

module.exports = mongoose.model('Report', reportSchema);
module.exports.REPORT_REASONS = REPORT_REASONS;
module.exports.REPORT_STATUS = REPORT_STATUS;
