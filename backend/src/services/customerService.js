// backend/src/services/customerService.js
// Business logic for customer management
// Handles customer CRUD operations and relationship tracking

const { query } = require('../config/database');

class CustomerService {
  // Get all customers for a store with pagination
  async getCustomers(storeId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const offset = (page - 1) * limit;
    const search = options.search || '';

    let whereClause = 'WHERE c.store_id = $1 AND c.deleted_at IS NULL';
    const params = [storeId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      whereClause += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const sql = `
      SELECT
        c.*,
        COUNT(*) OVER() as total_count
      FROM customers c
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);

    return {
      customers: result.rows,
      pagination: {
        page,
        limit,
        total: result.rows[0]?.total_count || 0,
        totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit)
      }
    };
  }

  // Get a single customer by ID
  async getCustomerById(customerId, storeId) {
    const sql = `
      SELECT c.*
      FROM customers c
      WHERE c.id = $1 AND c.store_id = $2 AND c.deleted_at IS NULL
    `;

    const result = await query(sql, [customerId, storeId]);
    return result.rows[0] || null;
  }

  // Get customer's order history
  async getCustomerOrders(customerId, storeId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT
        o.*,
        COUNT(*) OVER() as total_count
      FROM orders o
      WHERE o.customer_id = $1
        AND o.store_id = $2
        AND o.deleted_at IS NULL
      ORDER BY o.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await query(sql, [customerId, storeId, limit, offset]);

    return {
      orders: result.rows,
      pagination: {
        page,
        limit,
        total: result.rows[0]?.total_count || 0,
        totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit)
      }
    };
  }

  // Create a new customer
  async createCustomer(customerData, storeId) {
    const {
      email,
      first_name,
      last_name,
      phone
    } = customerData;

    // Check if customer with this email already exists for this store
    if (email) {
      const existingCustomer = await query(
        `SELECT id FROM customers
         WHERE email = $1 AND store_id = $2 AND deleted_at IS NULL`,
        [email, storeId]
      );

      if (existingCustomer.rows.length > 0) {
        throw new Error('Customer with this email already exists');
      }
    }

    const sql = `
      INSERT INTO customers (
        store_id, email, first_name, last_name, phone
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(sql, [
      storeId,
      email || null,
      first_name,
      last_name || null,
      phone || null
    ]);

    return result.rows[0];
  }

  // Update an existing customer
  async updateCustomer(customerId, customerData, storeId) {
    const {
      email,
      first_name,
      last_name,
      phone
    } = customerData;

    // If updating email, check it's not already taken
    if (email) {
      const existingCustomer = await query(
        `SELECT id FROM customers
         WHERE email = $1 AND store_id = $2 AND id != $3 AND deleted_at IS NULL`,
        [email, storeId, customerId]
      );

      if (existingCustomer.rows.length > 0) {
        throw new Error('Email already in use by another customer');
      }
    }

    const sql = `
      UPDATE customers
      SET
        email = COALESCE($1, email),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        phone = COALESCE($4, phone),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND store_id = $6 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await query(sql, [
      email,
      first_name,
      last_name,
      phone,
      customerId,
      storeId
    ]);

    return result.rows[0] || null;
  }

  // Soft delete a customer
  async deleteCustomer(customerId, storeId) {
    const sql = `
      UPDATE customers
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND store_id = $2 AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await query(sql, [customerId, storeId]);
    return result.rows.length > 0;
  }

  // Get top customers by spending
  async getTopCustomers(storeId, limit = 10) {
    const sql = `
      SELECT
        c.*,
        c.total_spent,
        c.orders_count
      FROM customers c
      WHERE c.store_id = $1 AND c.deleted_at IS NULL
      ORDER BY c.total_spent DESC
      LIMIT $2
    `;

    const result = await query(sql, [storeId, limit]);
    return result.rows;
  }

  // Search customers by name or email
  async searchCustomers(storeId, searchTerm) {
    const sql = `
      SELECT c.*
      FROM customers c
      WHERE c.store_id = $1
        AND c.deleted_at IS NULL
        AND (
          c.first_name ILIKE $2
          OR c.last_name ILIKE $2
          OR c.email ILIKE $2
          OR CONCAT(c.first_name, ' ', c.last_name) ILIKE $2
        )
      ORDER BY c.orders_count DESC, c.created_at DESC
      LIMIT 20
    `;

    const result = await query(sql, [storeId, `%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = new CustomerService();
