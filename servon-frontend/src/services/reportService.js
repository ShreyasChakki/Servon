import api from './api';

// Create a report (Customer)
export const createReport = async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
};

// Get all reports (Admin)
export const getReports = async (params = {}) => {
    const response = await api.get('/reports', { params });
    return response.data;
};

// Get report statistics (Admin)
export const getReportStats = async () => {
    const response = await api.get('/reports/stats');
    return response.data;
};

// Get reports for a specific vendor (Admin)
export const getVendorReports = async (vendorId) => {
    const response = await api.get(`/reports/vendor/${vendorId}`);
    return response.data;
};

// Update report status (Admin)
export const updateReportStatus = async (reportId, data) => {
    const response = await api.put(`/reports/${reportId}`, data);
    return response.data;
};
