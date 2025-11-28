// frontend/src/utils/api.js
// Axios wrapper for making API calls to the backend
// Handles authentication tokens and error responses

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we get a 401, the token is invalid or expired
    // Clear it and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Products API calls
export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  adjustStock: (id, data) => api.post(`/products/${id}/adjust-stock`, data),
  getLowStock: (params) => api.get('/products/low-stock', { params }),
  getAdjustments: (id, params) => api.get(`/products/${id}/adjustments`, { params })
};

// Orders API calls
export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
  cancel: (id) => api.delete(`/orders/${id}`),
  getTodayStats: (params) => api.get('/orders/stats/today', { params })
};

// Customers API calls
export const customersAPI = {
  list: (params) => api.get('/customers', { params }),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  search: (query) => api.get('/customers/search', { params: { q: query } }),
  getTop: (limit) => api.get('/customers/top', { params: { limit } }),
  getOrders: (id, params) => api.get(`/customers/${id}/orders`, { params })
};

// Stores API calls
export const storesAPI = {
  list: () => api.get('/stores'),
  get: (id) => api.get(`/stores/${id}`),
  create: (data) => api.post('/stores', data),
  update: (id, data) => api.put(`/stores/${id}/settings`, data),
  updateSettings: (id, data) => api.put(`/stores/${id}/settings`, data),
  getInventorySummary: (id) => api.get(`/stores/${id}/inventory-summary`),
  getRestockNeeded: (id) => api.get(`/stores/${id}/restock-needed`),
  getAdjustments: (id, params) => api.get(`/stores/${id}/adjustments`, { params })
};

// Inventory API calls
export const inventoryAPI = {
  getHistory: (params) => api.get(`/stores/${params.storeId}/adjustments`, { params })
};

// Reports API calls
export const reportsAPI = {
  getSales: (params) => api.get('/reports/sales', { params }),
  getProducts: (params) => api.get('/reports/products', { params }),
  getCustomers: (params) => api.get('/reports/customers', { params }),
  getRealtime: (params) => api.get('/reports/realtime', { params })
};

// Upload API calls
export const uploadAPI = {
  uploadFile: (file, storeId) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/upload', formData, {
      params: { storeId },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteFile: (filename) => api.delete(`/upload/${filename}`)
};

export default api;
