import api from './api';

// Send quotation (₹1 fee)
export const sendQuotation = async (quotationData) => {
    const response = await api.post('/quotations/send', quotationData);
    return response.data;
};

// Get received quotations (for customers) - by request ID
export const getReceivedQuotations = async (requestId) => {
    const response = await api.get(`/quotations/received/${requestId}`);
    return response.data;
};

// Alias for getReceivedQuotations
export const getQuotationsForRequest = async (requestId) => {
    const response = await api.get(`/quotations/received/${requestId}`);
    return response.data;
};

// Get my sent quotations (for vendors)
export const getMyQuotations = async () => {
    const response = await api.get('/quotations/my');
    return response.data;
};

// Get single quotation
export const getQuotation = async (id) => {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
};

// Accept quotation (for customers)
export const acceptQuotation = async (id) => {
    const response = await api.put(`/quotations/${id}/accept`);
    return response.data;
};

// Reject quotation (for customers)
export const rejectQuotation = async (id) => {
    const response = await api.put(`/quotations/${id}/reject`);
    return response.data;
};

// Generic respond to quotation (accept or reject)
export const respondToQuotation = async (id, action) => {
    const endpoint = action === 'accepted' ? 'accept' : 'reject';
    const response = await api.put(`/quotations/${id}/${endpoint}`);
    return response.data;
};

