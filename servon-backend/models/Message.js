const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    quotationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation',
        default: null  // Optional - for customer-vendor chats
    },
    connectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorConnection',
        default: null  // Optional - for vendor-vendor chats
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'system'],
        default: 'text'
    },
    readAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Compound index for efficient conversation retrieval
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Static method to generate conversation ID from two user IDs and context
messageSchema.statics.generateConversationId = function (userId1, userId2, contextId = null) {
    // Sort user IDs to ensure consistent conversation ID regardless of who initiates
    const sortedIds = [userId1.toString(), userId2.toString()].sort();
    if (contextId) {
        return `${sortedIds[0]}_${sortedIds[1]}_${contextId}`;
    }
    return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Static method to get or validate conversation access
messageSchema.statics.canChat = async function (userId1, userId2, quotationId) {
    const Quotation = require('./Quotation');

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) return false;

    // Check if both users are part of this quotation
    const vendorId = quotation.vendorId._id || quotation.vendorId;
    const customerId = quotation.customerId._id || quotation.customerId;

    const users = [vendorId.toString(), customerId.toString()];
    const checkUsers = [userId1.toString(), userId2.toString()];

    return users.includes(checkUsers[0]) && users.includes(checkUsers[1]);
};

module.exports = mongoose.model('Message', messageSchema);
