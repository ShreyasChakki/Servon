import api from './api';

// Register new user
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// Login user
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

// Get current user
export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

// Update profile
export const updateProfile = async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
};
