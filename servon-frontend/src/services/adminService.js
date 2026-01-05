import api from './api';

// Get dashboard stats
export const getDashboardStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

// Get recent activity
export const getRecentActivity = async () => {
    const response = await api.get('/admin/activity');
    return response.data;
};

// Get all users
export const getUsers = async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
};

// Get user details
export const getUserDetails = async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
};

// Toggle user ban status
export const toggleUserBan = async (userId) => {
    const response = await api.put(`/admin/users/${userId}/ban`);
    return response.data;
};

// Delete user
export const deleteUser = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
};
