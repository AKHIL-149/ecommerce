// backend/src/connectors/ShopifyConnector.js
const BaseConnector = require('./BaseConnector');

class ShopifyConnector extends BaseConnector {
  constructor(config) {
    super(config);
    this.shopDomain = config.shopDomain;
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion || '2023-07';
  }

  async authenticate() {
    const response = await this.makeRequest('/admin/api/2023-07/shop.json');
    if (!response.shop) {
      throw new Error('Invalid Shopify credentials');
    }
    return response.shop;
  }

  async fetchOrders(startDate, endDate, options = {}) {
    const orders = [];
    let sinceId = null;
    const limit = options.limit || 250;

    while (true) {
      const params = new URLSearchParams({
        limit: limit.toString(),
        status: 'any',
        created_at_min: startDate,
        created_at_max: endDate,
        fields: 'id,name,email,created_at,total_price,currency,financial_status,line_items,customer'
      });

      if (sinceId) {
        params.append('since_id', sinceId);
      }

      const response = await this.makeRequest(`/admin/api/${this.apiVersion}/orders.json?${params}`);
      
      if (!response.orders || response.orders.length === 0) {
        break;
      }

      const normalizedOrders = response.orders.map(order => this.normalizeOrder(order));
      orders.push(...normalizedOrders);

      sinceId = response.orders[response.orders.length - 1].id;
      await this.sleep(500);
    }

    return orders;
  }

  async fetchProducts(options = {}) {
    const products = [];
    let sinceId = null;
    const limit = options.limit || 250;

    while (true) {
      const params = new URLSearchParams({
        limit: limit.toString(),
        fields: 'id,title,handle,vendor,product_type,status,created_at,variants'
      });

      if (sinceId) {
        params.append('since_id', sinceId);
      }

      const response = await this.makeRequest(`/admin/api/${this.apiVersion}/products.json?${params}`);
      
      if (!response.products || response.products.length === 0) {
        break;
      }

      const normalizedProducts = response.products.map(product => this.normalizeProduct(product));
      products.push(...normalizedProducts);

      sinceId = response.products[response.products.length - 1].id;
      await this.sleep(500);
    }

    return products;
  }

  async fetchCustomers(options = {}) {
    const customers = [];
    let sinceId = null;
    const limit = options.limit || 250;

    while (true) {
      const params = new URLSearchParams({
        limit: limit.toString(),
        fields: 'id,email,first_name,last_name,phone,total_spent,orders_count,created_at'
      });

      if (sinceId) {
        params.append('since_id', sinceId);
      }

      const response = await this.makeRequest(`/admin/api/${this.apiVersion}/customers.json?${params}`);
      
      if (!response.customers || response.customers.length === 0) {
        break;
      }

      const normalizedCustomers = response.customers.map(customer => this.normalizeCustomer(customer));
      customers.push(...normalizedCustomers);

      sinceId = response.customers[response.customers.length - 1].id;
      await this.sleep(500);
    }

    return customers;
  }

  async makeRequest(endpoint) {
    const url = `https://${this.shopDomain}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async validateConfig() {
    const errors = [];
    
    if (!this.shopDomain) {
      errors.push('Shop domain is required');
    }
    
    if (!this.accessToken) {
      errors.push('Access token is required');
    }

    if (this.shopDomain && !this.shopDomain.includes('.myshopify.com')) {
      errors.push('Shop domain must be in format: store.myshopify.com');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = ShopifyConnector;