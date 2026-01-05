import api from './api';

// Get active advertisements (public)
export const getActiveAdvertisements = async (category = null, limit = 10) => {
    const params = { limit };
    if (category) params.category = category;

    const response = await api.get('/advertisements', { params });
    return response.data;
};

// Get single advertisement
export const getAdvertisement = async (id) => {
    const response = await api.get(`/advertisements/${id}`);
    return response.data;
};

// Create advertisement (requires wallet balance)
export const createAdvertisement = async (adData) => {
    const response = await api.post('/advertisements', adData);
    return response.data;
};

// Get vendor's advertisements
export const getMyAdvertisements = async () => {
    const response = await api.get('/advertisements/my/list');
    return response.data;
};

// Update advertisement
export const updateAdvertisement = async (id, updateData) => {
    const response = await api.put(`/advertisements/${id}`, updateData);
    return response.data;
};

// Delete advertisement
export const deleteAdvertisement = async (id) => {
    const response = await api.delete(`/advertisements/${id}`);
    return response.data;
};

// Record click on advertisement
export const recordAdClick = async (id) => {
    const response = await api.post(`/advertisements/${id}/click`);
    return response.data;
};
