// backend/src/services/inventoryService.js
// Business logic for inventory management
// Handles stock adjustments and tracking

const { query } = require('../config/database');

class InventoryService {
  // Adjust stock for a product
  async adjustStock(productId, variantId, storeId, userId, adjustmentData) {
    const { quantity_change, reason, notes } = adjustmentData;

    const client = await query.pool.connect();

    try {
      await client.query('BEGIN');

      // Get current inventory level
      let currentQuantity;
      let tableName;
      let itemId;

      if (variantId) {
        const variantResult = await client.query(
          'SELECT inventory_quantity FROM product_variants WHERE id = $1 AND store_id = $2',
          [variantId, storeId]
        );

        if (variantResult.rows.length === 0) {
          throw new Error('Product variant not found');
        }

        currentQuantity = variantResult.rows[0].inventory_quantity;
        tableName = 'product_variants';
        itemId = variantId;
      } else {
        const productResult = await client.query(
          'SELECT inventory_quantity FROM products WHERE id = $1 AND store_id = $2',
          [productId, storeId]
        );

        if (productResult.rows.length === 0) {
          throw new Error('Product not found');
        }

        currentQuantity = productResult.rows[0].inventory_quantity;
        tableName = 'products';
        itemId = productId;
      }

      const newQuantity = currentQuantity + quantity_change;

      // Don't allow negative inventory
      if (newQuantity < 0) {
        throw new Error('Adjustment would result in negative inventory');
      }

      // Update the inventory
      const updateSql = `
        UPDATE ${tableName}
        SET inventory_quantity = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      await client.query(updateSql, [newQuantity, itemId]);

      // Record the adjustment
      const adjustmentSql = `
        INSERT INTO stock_adjustments (
          product_id, variant_id, store_id, user_id,
          adjustment_type, quantity_change, quantity_before,
          quantity_after, reason, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const adjustmentType = quantity_change > 0 ? 'increase' : 'decrease';

      const adjustmentResult = await client.query(adjustmentSql, [
        productId,
        variantId || null,
        storeId,
        userId,
        adjustmentType,
        quantity_change,
        currentQuantity,
        newQuantity,
        reason,
        notes || null
      ]);

      await client.query('COMMIT');

      return adjustmentResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get adjustment history for a product
  async getAdjustmentHistory(productId, storeId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT
        sa.*,
        u.email as adjusted_by_email,
        u.first_name as adjusted_by_first_name,
        u.last_name as adjusted_by_last_name,
        COUNT(*) OVER() as total_count
      FROM stock_adjustments sa
      LEFT JOIN users u ON sa.user_id = u.id
      WHERE sa.product_id = $1 AND sa.store_id = $2
      ORDER BY sa.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await query(sql, [productId, storeId, limit, offset]);

    return {
      adjustments: result.rows,
      pagination: {
        page,
        limit,
        total: result.rows[0]?.total_count || 0,
        totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit)
      }
    };
  }

  // Get all recent stock adjustments for a store
  async getRecentAdjustments(storeId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT
        sa.*,
        p.name as product_name,
        p.sku as product_sku,
        pv.title as variant_title,
        u.email as adjusted_by_email,
        u.first_name as adjusted_by_first_name,
        u.last_name as adjusted_by_last_name,
        COUNT(*) OVER() as total_count
      FROM stock_adjustments sa
      LEFT JOIN products p ON sa.product_id = p.id
      LEFT JOIN product_variants pv ON sa.variant_id = pv.id
      LEFT JOIN users u ON sa.user_id = u.id
      WHERE sa.store_id = $1
      ORDER BY sa.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [storeId, limit, offset]);

    return {
      adjustments: result.rows,
      pagination: {
        page,
        limit,
        total: result.rows[0]?.total_count || 0,
        totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit)
      }
    };
  }

  // Get inventory summary for a store
  async getInventorySummary(storeId) {
    const sql = `
      SELECT
        COUNT(*) as total_products,
        SUM(inventory_quantity) as total_units,
        SUM(CASE WHEN inventory_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
        SUM(CASE WHEN inventory_quantity <= low_stock_threshold THEN 1 ELSE 0 END) as low_stock_count,
        SUM(inventory_quantity * cost) as total_inventory_value
      FROM products
      WHERE store_id = $1 AND deleted_at IS NULL
    `;

    const result = await query(sql, [storeId]);
    return result.rows[0];
  }

  // Get products that need restocking
  async getRestockNeeded(storeId) {
    const sql = `
      SELECT
        p.*,
        (p.low_stock_threshold - p.inventory_quantity) as units_needed
      FROM products p
      WHERE p.store_id = $1
        AND p.deleted_at IS NULL
        AND p.inventory_quantity <= p.low_stock_threshold
      ORDER BY (p.low_stock_threshold - p.inventory_quantity) DESC
    `;

    const result = await query(sql, [storeId]);
    return result.rows;
  }
}

module.exports = new InventoryService();
