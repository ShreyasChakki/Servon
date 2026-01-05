import api from './api';

// Get wallet balance
export const getWalletBalance = async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
};

// Add funds to wallet
export const addFunds = async (amount) => {
    const response = await api.post('/wallet/add-funds', { amount });
    return response.data;
};

// Get transaction history
export const getTransactions = async () => {
    const response = await api.get('/wallet/transactions');
    return response.data;
};

// Get full wallet details
export const getWallet = async () => {
    const response = await api.get('/wallet');
    return response.data;
};
