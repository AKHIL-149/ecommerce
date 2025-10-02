// backend/src/connectors/WooCommerceConnector.js
const BaseConnector = require('./BaseConnector');

class WooCommerceConnector extends BaseConnector {
  constructor(config) {
    super(config);
    this.siteUrl = config.siteUrl;
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
  }

  async authenticate() {
    const response = await this.makeRequest('/wp-json/wc/v3/system_status');
    if (!response.environment) {
      throw new Error('Invalid WooCommerce credentials');
    }
    return response;
  }

  async fetchOrders(startDate, endDate, options = {}) {
    const orders = [];
    let page = 1;
    const perPage = options.perPage || 100;

    while (true) {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        after: startDate,
        before: endDate,
        status: 'any'
      });

      const response = await this.makeRequest(`/wp-json/wc/v3/orders?${params}`);
      
      if (!response || response.length === 0) {
        break;
      }

      const normalizedOrders = response.map(order => this.normalizeWooOrder(order));
      orders.push(...normalizedOrders);

      page++;
      await this.sleep(300);
    }

    return orders;
  }

  async fetchProducts(options = {}) {
    const products = [];
    let page = 1;
    const perPage = options.perPage || 100;

    while (true) {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });

      const response = await this.makeRequest(`/wp-json/wc/v3/products?${params}`);
      
      if (!response || response.length === 0) {
        break;
      }

      const normalizedProducts = response.map(product => this.normalizeProduct(product));
      products.push(...normalizedProducts);

      page++;
      await this.sleep(300);
    }

    return products;
  }

  async fetchCustomers(options = {}) {
    const customers = [];
    let page = 1;
    const perPage = options.perPage || 100;

    while (true) {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });

      const response = await this.makeRequest(`/wp-json/wc/v3/customers?${params}`);
      
      if (!response || response.length === 0) {
        break;
      }

      const normalizedCustomers = response.map(customer => this.normalizeCustomer(customer));
      customers.push(...normalizedCustomers);

      page++;
      await this.sleep(300);
    }

    return customers;
  }

  normalizeWooOrder(rawOrder) {
    return {
      id: rawOrder.id,
      order_number: rawOrder.number,
      customer_id: rawOrder.customer_id,
      customer_email: rawOrder.billing.email,
      total_amount: parseFloat(rawOrder.total),
      currency: rawOrder.currency,
      status: rawOrder.status,
      created_at: new Date(rawOrder.date_created),
      items: rawOrder.line_items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variation_id,
        title: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price)
      }))
    };
  }

  async makeRequest(endpoint) {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const url = `${this.siteUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async validateConfig() {
    const errors = [];
    
    if (!this.siteUrl) {
      errors.push('Site URL is required');
    }
    
    if (!this.consumerKey) {
      errors.push('Consumer key is required');
    }

    if (!this.consumerSecret) {
      errors.push('Consumer secret is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = WooCommerceConnector;