import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('opshub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const enableBlockchain = (email) =>
  api.post('/auth/enable-blockchain', { email });

// Blockchain
export const getBlockchainStatus = (email) =>
  api.get(`/blockchain/status/${encodeURIComponent(email)}`);

// Payments
export const getPaymentHistory = (email) =>
  api.get(`/payments/history/${encodeURIComponent(email)}`);

// Transactions
export const getTransaction = (id) =>
  api.get(`/transactions/${encodeURIComponent(id)}`);

export const createEscrow = (buyerEmail, sellerEmail, amount) =>
  api.post('/escrow/create', { buyerEmail, sellerEmail, amount });

export const completeEscrow = (dealId) =>
  api.post('/escrow/complete', { dealId });

export const getEscrowDeals = (email) =>
  api.get(`/escrow/user/${encodeURIComponent(email)}`);

// Business
export const onboardBusiness = (name) =>
  api.post('/business/onboard', { name });

export default api;
