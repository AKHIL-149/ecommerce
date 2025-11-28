// backend/src/controllers/customersController.js
// HTTP request handlers for customer-related endpoints
// Manages customer data and purchase history

const customerService = require('../services/customerService');

class CustomersController {
  // GET /api/customers - List all customers
  async listCustomers(req, res) {
    try {
      const storeId = req.storeAccess.storeId;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search
      };

      const result = await customerService.getCustomers(storeId, options);
      res.json(result);
    } catch (error) {
      console.error('List customers error:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  }

  // GET /api/customers/search - Search customers
  async searchCustomers(req, res) {
    try {
      const storeId = req.storeAccess.storeId;
      const searchTerm = req.query.q || '';

      if (!searchTerm) {
        return res.json({ customers: [] });
      }

      const customers = await customerService.searchCustomers(storeId, searchTerm);
      res.json({ customers });
    } catch (error) {
      console.error('Search customers error:', error);
      res.status(500).json({ error: 'Failed to search customers' });
    }
  }

  // GET /api/customers/top - Get top customers by spending
  async getTopCustomers(req, res) {
    try {
      const storeId = req.storeAccess.storeId;
      const limit = parseInt(req.query.limit) || 10;

      const customers = await customerService.getTopCustomers(storeId, limit);
      res.json({ customers });
    } catch (error) {
      console.error('Get top customers error:', error);
      res.status(500).json({ error: 'Failed to fetch top customers' });
    }
  }

  // GET /api/customers/:id - Get single customer
  async getCustomer(req, res) {
    try {
      const customerId = req.params.id;
      const storeId = req.storeAccess.storeId;

      const customer = await customerService.getCustomerById(customerId, storeId);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({ error: 'Failed to fetch customer' });
    }
  }

  // GET /api/customers/:id/orders - Get customer's order history
  async getCustomerOrders(req, res) {
    try {
      const customerId = req.params.id;
      const storeId = req.storeAccess.storeId;
      const options = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await customerService.getCustomerOrders(customerId, storeId, options);
      res.json(result);
    } catch (error) {
      console.error('Get customer orders error:', error);
      res.status(500).json({ error: 'Failed to fetch customer orders' });
    }
  }

  // POST /api/customers - Create new customer
  async createCustomer(req, res) {
    try {
      const storeId = req.storeAccess.storeId;

      const customer = await customerService.createCustomer(req.body, storeId);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ error: 'Failed to create customer', message: error.message });
    }
  }

  // PUT /api/customers/:id - Update customer
  async updateCustomer(req, res) {
    try {
      const customerId = req.params.id;
      const storeId = req.storeAccess.storeId;

      const customer = await customerService.updateCustomer(customerId, req.body, storeId);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({ error: 'Failed to update customer', message: error.message });
    }
  }

  // DELETE /api/customers/:id - Delete customer (soft delete)
  async deleteCustomer(req, res) {
    try {
      const customerId = req.params.id;
      const storeId = req.storeAccess.storeId;

      const deleted = await customerService.deleteCustomer(customerId, storeId);

      if (!deleted) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({ error: 'Failed to delete customer' });
    }
  }
}

module.exports = new CustomersController();
