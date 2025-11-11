// frontend/src/services/analyticsService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AnalyticsService {
  async getSalesOverview(storeId, startDate, endDate) {
    try {
      const response = await axios.get(`${API_URL}/analytics/sales`, {
        params: { storeId, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProductPerformance(storeId, startDate, endDate, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/analytics/products`, {
        params: { storeId, startDate, endDate, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCustomerInsights(storeId, startDate, endDate) {
    try {
      const response = await axios.get(`${API_URL}/analytics/customers`, {
        params: { storeId, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRealTimeStats(storeId) {
    try {
      const response = await axios.get(`${API_URL}/analytics/realtime`, {
        params: { storeId }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const message = error.response.data.message || error.response.data.error || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      return new Error('Unable to connect to server. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new AnalyticsService();
