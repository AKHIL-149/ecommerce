// frontend/src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    if (this.token) {
      this.setAuthToken(this.token);
    }
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token, user } = response.data;
      this.setAuthToken(token);
      return { user, token };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      this.setAuthToken(token);
      return { user, token };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setAuthToken(null);
    }
  }

  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      return response.data.user;
    } catch (error) {
      this.setAuthToken(null);
      throw this.handleError(error);
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.message || error.response.data.error || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // No response received
      return new Error('Unable to connect to server. Please check your connection.');
    } else {
      // Request setup error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new AuthService();
