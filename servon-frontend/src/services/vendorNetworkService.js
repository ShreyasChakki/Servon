import api from './api';

// Get vendors for network browsing
export const getVendors = async (category = null, search = null) => {
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;

    const response = await api.get('/network/vendors', { params });
    return response.data;
};

// Get my connections
export const getMyConnections = async (status = 'connected') => {
    const response = await api.get('/network/connections', { params: { status } });
    return response.data;
};

// Get pending connection requests
export const getPendingRequests = async () => {
    const response = await api.get('/network/requests');
    return response.data;
};

// Send connection request
export const sendConnectionRequest = async (receiverId, message = '') => {
    const response = await api.post('/network/connect', { receiverId, message });
    return response.data;
};

// Accept connection request
export const acceptRequest = async (connectionId) => {
    const response = await api.put(`/network/${connectionId}/accept`);
    return response.data;
};

// Reject connection request
export const rejectRequest = async (connectionId) => {
    const response = await api.put(`/network/${connectionId}/reject`);
    return response.data;
};

// Remove connection
export const removeConnection = async (connectionId) => {
    const response = await api.delete(`/network/${connectionId}`);
    return response.data;
};
