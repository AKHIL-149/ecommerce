// backend/src/connectors/BaseConnector.js
class BaseConnector {
  constructor(config) {
    this.config = config;
    this.name = this.constructor.name;
    this.version = '1.0.0';
  }

  async authenticate() {
    throw new Error('authenticate() method must be implemented');
  }

  async fetchOrders(startDate, endDate, options = {}) {
    throw new Error('fetchOrders() method must be implemented');
  }

  async fetchProducts(options = {}) {
    throw new Error('fetchProducts() method must be implemented');
  }

  async fetchCustomers(options = {}) {
    throw new Error('fetchCustomers() method must be implemented');
  }

  async validateConfig() {
    return { valid: true, errors: [] };
  }

  async testConnection() {
    try {
      await this.authenticate();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  normalizeOrder(rawOrder) {
    return {
      id: rawOrder.id,
      order_number: rawOrder.order_number || rawOrder.name,
      customer_id: rawOrder.customer?.id,
      customer_email: rawOrder.customer?.email,
      total_amount: parseFloat(rawOrder.total_price || 0),
      currency: rawOrder.currency,
      status: rawOrder.financial_status || rawOrder.status,
      created_at: new Date(rawOrder.created_at),
      items: (rawOrder.line_items || []).map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price)
      }))
    };
  }

  normalizeProduct(rawProduct) {
    return {
      id: rawProduct.id,
      title: rawProduct.title || rawProduct.name,
      handle: rawProduct.handle,
      vendor: rawProduct.vendor,
      product_type: rawProduct.product_type,
      status: rawProduct.status,
      created_at: new Date(rawProduct.created_at),
      variants: (rawProduct.variants || []).map(variant => ({
        id: variant.id,
        title: variant.title,
        price: parseFloat(variant.price),
        sku: variant.sku,
        inventory_quantity: variant.inventory_quantity
      }))
    };
  }

  normalizeCustomer(rawCustomer) {
    return {
      id: rawCustomer.id,
      email: rawCustomer.email,
      first_name: rawCustomer.first_name,
      last_name: rawCustomer.last_name,
      phone: rawCustomer.phone,
      total_spent: parseFloat(rawCustomer.total_spent || 0),
      orders_count: rawCustomer.orders_count || 0,
      created_at: new Date(rawCustomer.created_at)
    };
  }
}

module.exports = BaseConnector;