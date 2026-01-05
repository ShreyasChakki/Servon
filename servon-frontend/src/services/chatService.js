import api from './api';

// Get all conversations
export const getConversations = async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
};

// Get messages for a conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
    const response = await api.get(`/chat/${conversationId}/messages`, {
        params: { page, limit }
    });
    return response.data;
};

// Get conversation info
export const getConversationInfo = async (conversationId) => {
    const response = await api.get(`/chat/${conversationId}/info`);
    return response.data;
};

// Send message (REST fallback)
export const sendMessage = async (quotationId, receiverId, content) => {
    const response = await api.post('/chat/send', {
        quotationId,
        receiverId,
        content
    });
    return response.data;
};

// Send message for vendor connections
export const sendVendorMessage = async (connectionId, receiverId, content) => {
    const response = await api.post('/chat/send-vendor', {
        connectionId,
        receiverId,
        content
    });
    return response.data;
};

// Mark messages as read
export const markAsRead = async (conversationId) => {
    const response = await api.put(`/chat/${conversationId}/read`);
    return response.data;
};

// Send message for direct/ad-based conversations
export const sendDirectMessage = async (conversationId, receiverId, content) => {
    const response = await api.post('/chat/send-direct', {
        conversationId,
        receiverId,
        content
    });
    return response.data;
};
