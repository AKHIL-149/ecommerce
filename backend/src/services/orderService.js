// backend/src/services/orderService.js
// Business logic for order management
// Handles order creation, updates, and retrievals

const { query } = require('../config/database');

class OrderService {
  // Get all orders for a store with filters
  async getOrders(storeId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const offset = (page - 1) * limit;
    const status = options.status || '';
    const startDate = options.startDate || '';
    const endDate = options.endDate || '';

    let whereClause = 'WHERE o.store_id = $1 AND o.deleted_at IS NULL';
    const params = [storeId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    if (startDate) {
      paramCount++;
      whereClause += ` AND o.created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      whereClause += ` AND o.created_at <= $${paramCount}`;
      params.push(endDate);
    }

    const sql = `
      SELECT
        o.*,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        COUNT(*) OVER() as total_count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);

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

  // Get a single order with all details including items
  async getOrderById(orderId, storeId) {
    const sql = `
      SELECT
        o.*,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.email as customer_email,
        c.phone as customer_phone,
        COALESCE(json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'variant_id', oi.variant_id,
            'title', oi.title,
            'quantity', oi.quantity,
            'price', oi.price,
            'total_amount', oi.total_amount,
            'sku', oi.sku
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1 AND o.store_id = $2 AND o.deleted_at IS NULL
      GROUP BY o.id, c.id
    `;

    const result = await query(sql, [orderId, storeId]);
    return result.rows[0] || null;
  }

  // Create a new order
  async createOrder(orderData, storeId, userId) {
    const {
      customer_id,
      customer_email,
      order_number,
      items,
      subtotal_amount,
      tax_amount,
      shipping_amount,
      discount_amount,
      total_amount,
      currency,
      status,
      financial_status,
      notes
    } = orderData;

    // Start transaction because we're creating order and items
    const client = await query.pool.connect();

    try {
      await client.query('BEGIN');

      // Generate order number if not provided
      const generatedOrderNumber = order_number || `ORD-${Date.now()}`;

      // Insert the order
      const orderSql = `
        INSERT INTO orders (
          store_id, order_number, customer_id, customer_email,
          total_amount, subtotal_amount, tax_amount, shipping_amount,
          discount_amount, currency, status, financial_status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const orderResult = await client.query(orderSql, [
        storeId,
        generatedOrderNumber,
        customer_id || null,
        customer_email || null,
        total_amount,
        subtotal_amount || total_amount,
        tax_amount || 0,
        shipping_amount || 0,
        discount_amount || 0,
        currency || 'USD',
        status || 'pending',
        financial_status || 'pending',
        notes || null
      ]);

      const order = orderResult.rows[0];

      // Insert order items and update inventory
      for (const item of items) {
        // Insert order item
        const itemSql = `
          INSERT INTO order_items (
            order_id, product_id, variant_id, store_id, title,
            quantity, price, total_amount, sku
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;

        await client.query(itemSql, [
          order.id,
          item.product_id,
          item.variant_id || null,
          storeId,
          item.title || item.product_name,
          item.quantity,
          item.price,
          item.quantity * item.price,
          item.sku || null
        ]);

        // Update product inventory
        // If there's a variant, update the variant inventory
        // Otherwise update the main product inventory
        if (item.variant_id) {
          await client.query(
            `UPDATE product_variants
             SET inventory_quantity = inventory_quantity - $1
             WHERE id = $2 AND store_id = $3`,
            [item.quantity, item.variant_id, storeId]
          );
        } else {
          await client.query(
            `UPDATE products
             SET inventory_quantity = inventory_quantity - $1
             WHERE id = $2 AND store_id = $3`,
            [item.quantity, item.product_id, storeId]
          );
        }

        // Record the inventory adjustment
        const adjustmentSql = `
          INSERT INTO stock_adjustments (
            product_id, variant_id, store_id, user_id,
            adjustment_type, quantity_change, quantity_before,
            quantity_after, reason
          )
          SELECT
            $1, $2, $3, $4, 'sale', -$5,
            CASE
              WHEN $2 IS NOT NULL THEN (SELECT inventory_quantity FROM product_variants WHERE id = $2)
              ELSE (SELECT inventory_quantity FROM products WHERE id = $1)
            END + $5,
            CASE
              WHEN $2 IS NOT NULL THEN (SELECT inventory_quantity FROM product_variants WHERE id = $2)
              ELSE (SELECT inventory_quantity FROM products WHERE id = $1)
            END,
            'Order ' || $6
        `;

        await client.query(adjustmentSql, [
          item.product_id,
          item.variant_id || null,
          storeId,
          userId,
          item.quantity,
          generatedOrderNumber
        ]);
      }

      // Update customer stats if customer is linked
      if (customer_id) {
        await client.query(
          `UPDATE customers
           SET orders_count = orders_count + 1,
               total_spent = total_spent + $1,
               last_order_date = CURRENT_TIMESTAMP
           WHERE id = $2 AND store_id = $3`,
          [total_amount, customer_id, storeId]
        );
      }

      await client.query('COMMIT');

      // Fetch and return the complete order
      return await this.getOrderById(order.id, storeId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update order status
  async updateOrder(orderId, updateData, storeId) {
    const { status, financial_status, fulfillment_status, notes } = updateData;

    const sql = `
      UPDATE orders
      SET
        status = COALESCE($1, status),
        financial_status = COALESCE($2, financial_status),
        fulfillment_status = COALESCE($3, fulfillment_status),
        notes = COALESCE($4, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND store_id = $6 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await query(sql, [
      status,
      financial_status,
      fulfillment_status,
      notes,
      orderId,
      storeId
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return await this.getOrderById(orderId, storeId);
  }

  // Cancel an order (soft delete)
  async cancelOrder(orderId, storeId, userId) {
    // We need to restore inventory when cancelling
    const client = await query.pool.connect();

    try {
      await client.query('BEGIN');

      // Get order items before canceling
      const order = await this.getOrderById(orderId, storeId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Restore inventory for each item
      for (const item of order.items) {
        if (item.variant_id) {
          await client.query(
            `UPDATE product_variants
             SET inventory_quantity = inventory_quantity + $1
             WHERE id = $2 AND store_id = $3`,
            [item.quantity, item.variant_id, storeId]
          );
        } else {
          await client.query(
            `UPDATE products
             SET inventory_quantity = inventory_quantity + $1
             WHERE id = $2 AND store_id = $3`,
            [item.quantity, item.product_id, storeId]
          );
        }

        // Record the inventory adjustment
        const adjustmentSql = `
          INSERT INTO stock_adjustments (
            product_id, variant_id, store_id, user_id,
            adjustment_type, quantity_change, quantity_before,
            quantity_after, reason
          )
          SELECT
            $1, $2, $3, $4, 'return', $5,
            CASE
              WHEN $2 IS NOT NULL THEN (SELECT inventory_quantity FROM product_variants WHERE id = $2)
              ELSE (SELECT inventory_quantity FROM products WHERE id = $1)
            END - $5,
            CASE
              WHEN $2 IS NOT NULL THEN (SELECT inventory_quantity FROM product_variants WHERE id = $2)
              ELSE (SELECT inventory_quantity FROM products WHERE id = $1)
            END,
            'Order cancelled: ' || $6
        `;

        await client.query(adjustmentSql, [
          item.product_id,
          item.variant_id || null,
          storeId,
          userId,
          item.quantity,
          order.order_number
        ]);
      }

      // Update customer stats
      if (order.customer_id) {
        await client.query(
          `UPDATE customers
           SET orders_count = orders_count - 1,
               total_spent = total_spent - $1
           WHERE id = $2 AND store_id = $3`,
          [order.total_amount, order.customer_id, storeId]
        );
      }

      // Soft delete the order
      await client.query(
        `UPDATE orders
         SET deleted_at = CURRENT_TIMESTAMP,
             status = 'cancelled'
         WHERE id = $1 AND store_id = $2`,
        [orderId, storeId]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get order statistics for today
  async getTodayStats(storeId) {
    const sql = `
      SELECT
        COUNT(*) as orders_today,
        COALESCE(SUM(total_amount), 0) as revenue_today,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM orders
      WHERE store_id = $1
        AND deleted_at IS NULL
        AND DATE(created_at) = CURRENT_DATE
    `;

    const result = await query(sql, [storeId]);
    return result.rows[0];
  }
}

module.exports = new OrderService();
