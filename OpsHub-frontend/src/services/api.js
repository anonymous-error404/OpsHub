import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('opshub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const enableBlockchain = (email) => api.post('/auth/enable-blockchain', { email });

// Blockchain & Payments
export const getBlockchainStatus = (email) => api.get(`/blockchain/status/${encodeURIComponent(email)}`);
export const getPaymentHistory = (email) => api.get(`/payments/history/${encodeURIComponent(email)}`);
export const getTransaction = (id) => api.get(`/transactions/${encodeURIComponent(id)}`);

export const createRazorpayOrder = (amount) => api.post('/payments/create-order', { amount });
export const verifyRazorpayPayment = (data) => api.post('/payments/verify-payment', data);

// Escrow
export const requestEscrow = (buyerEmail, sellerEmail, amount, deadlineDays) => api.post('/escrow/request', { buyerEmail, sellerEmail, amount, deadlineDays });
export const payEscrow = (escrowId, paymentId) => api.post('/escrow/pay', { escrowId, paymentId });
export const completeEscrow = (escrowId) => api.post('/escrow/complete', { escrowId });
export const getEscrowDeals = (email) => api.get(`/escrow/user/${encodeURIComponent(email)}`);
export const getEscrowAnalytics = (email) => api.get(`/escrow/analytics/${encodeURIComponent(email)}`);
export const getPartnerRelationship = (email, partnerEmail) => api.get(`/escrow/relationship/${encodeURIComponent(email)}/${encodeURIComponent(partnerEmail)}`);

// Network
export const requestConnection = (from, to) => api.post('/network/request', { from, to });
export const acceptConnection = (from, to) => api.post('/network/accept', { from, to });
export const getMutualConnections = (email) => api.get(`/network/mutuals/${encodeURIComponent(email)}`);
export const getPendingConnections = (email) => api.get(`/network/pending/${encodeURIComponent(email)}`);
export const getAllUsers = (email) => api.get(`/network/users/${encodeURIComponent(email)}`);
export const disconnectConnection = (from, to) => api.post('/network/disconnect', { from, to });

// Business
export const onboardBusiness = (name) => api.post('/business/onboard', { name });

export default api;
