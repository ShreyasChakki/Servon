import api from './api';

// Get vendor public profile with their ads
export const getVendorProfile = async (vendorId) => {
    const response = await api.get(`/vendors/${vendorId}/profile`);
    return response.data;
};

// Initiate contact with vendor
export const initiateVendorContact = async (vendorId, data = {}) => {
    const response = await api.post(`/vendors/${vendorId}/contact`, data);
    return response.data;
};
