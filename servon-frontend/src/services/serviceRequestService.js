import api from './api';

// Create new service request
export const createServiceRequest = async (requestData) => {
    const response = await api.post('/service-requests', requestData);
    return response.data;
};

// Get all open service requests (for vendors)
export const getServiceRequests = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/service-requests${params ? `?${params}` : ''}`);
    return response.data;
};

// Get my service requests (for customers)
export const getMyServiceRequests = async () => {
    const response = await api.get('/service-requests/my');
    return response.data;
};

// Get single service request
export const getServiceRequest = async (id) => {
    const response = await api.get(`/service-requests/${id}`);
    return response.data;
};

// Update service request
export const updateServiceRequest = async (id, requestData) => {
    const response = await api.put(`/service-requests/${id}`, requestData);
    return response.data;
};

// Delete service request
export const deleteServiceRequest = async (id) => {
    const response = await api.delete(`/service-requests/${id}`);
    return response.data;
};

// Get service requests by category
export const getServiceRequestsByCategory = async (category) => {
    const response = await api.get(`/service-requests/category/${category}`);
    return response.data;
};
