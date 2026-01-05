import api from './api';

// Send an ad request/inquiry (Customer)
export const sendAdRequest = async (advertisementId, message) => {
    const response = await api.post('/ad-requests/send', { advertisementId, message });
    return response.data;
};

// Get my sent ad requests (Customer)
export const getMyAdRequests = async () => {
    const response = await api.get('/ad-requests/my');
    return response.data;
};

// Get received ad requests (Vendor)
export const getReceivedAdRequests = async () => {
    const response = await api.get('/ad-requests/received');
    return response.data;
};

// Accept ad request (Vendor)
export const acceptAdRequest = async (id) => {
    const response = await api.put(`/ad-requests/${id}/accept`);
    return response.data;
};

// Decline ad request (Vendor)
export const declineAdRequest = async (id) => {
    const response = await api.put(`/ad-requests/${id}/decline`);
    return response.data;
};

// Get single ad request
export const getAdRequest = async (id) => {
    const response = await api.get(`/ad-requests/${id}`);
    return response.data;
};
