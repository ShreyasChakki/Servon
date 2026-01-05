const express = require('express');
const router = express.Router();
const {
    getConversations,
    getMessages,
    sendMessage,
    sendVendorMessage,
    sendDirectMessage,
    markAsRead,
    getConversationInfo
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/conversations', getConversations);
router.get('/:conversationId/messages', getMessages);
router.get('/:conversationId/info', getConversationInfo);
router.post('/send', sendMessage);
router.post('/send-vendor', sendVendorMessage);
router.post('/send-direct', sendDirectMessage);
router.put('/:conversationId/read', markAsRead);

module.exports = router;
