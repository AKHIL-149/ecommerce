// backend/src/services/productService.js
// Business logic for product management
// This separates the database operations from the controller logic

const { query } = require('../config/database');

class ProductService {
  // Get all products for a store with pagination
  async getProducts(storeId, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const offset = (page - 1) * limit;
    const search = options.search || '';
    const category = options.category || '';

    let whereClause = 'WHERE p.store_id = $1 AND p.deleted_at IS NULL';
    const params = [storeId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      whereClause += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      whereClause += ` AND p.category = $${paramCount}`;
      params.push(category);
    }

    const sql = `
      SELECT
        p.*,
        COUNT(*) OVER() as total_count,
        COALESCE(json_agg(
          json_build_object(
            'id', pv.id,
            'title', pv.title,
            'sku', pv.sku,
            'price', pv.price,
            'cost', pv.cost,
            'inventory_quantity', pv.inventory_quantity
          )
        ) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);

    return {
      products: result.rows,
      pagination: {
        page,
        limit,
        total: result.rows[0]?.total_count || 0,
        totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit)
      }
    };
  }

  // Get a single product by ID
  async getProductById(productId, storeId) {
    const sql = `
      SELECT
        p.*,
        COALESCE(json_agg(
          json_build_object(
            'id', pv.id,
            'title', pv.title,
            'sku', pv.sku,
            'price', pv.price,
            'cost', pv.cost,
            'inventory_quantity', pv.inventory_quantity,
            'position', pv.position
          )
        ) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.id = $1 AND p.store_id = $2 AND p.deleted_at IS NULL
      GROUP BY p.id
    `;

    const result = await query(sql, [productId, storeId]);
    return result.rows[0] || null;
  }

  // Create a new product
  async createProduct(productData, storeId, userId) {
    const {
      name,
      sku,
      handle,
      vendor,
      category,
      product_type,
      price,
      cost,
      inventory_quantity,
      low_stock_threshold,
      images,
      variants
    } = productData;

    // Start a transaction since we might be creating variants too
    const client = await query.pool.connect();

    try {
      await client.query('BEGIN');

      // Insert the main product
      const productSql = `
        INSERT INTO products (
          store_id, name, sku, handle, vendor, category, product_type,
          price, cost, inventory_quantity, low_stock_threshold, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const productResult = await client.query(productSql, [
        storeId,
        name,
        sku || null,
        handle || name.toLowerCase().replace(/\s+/g, '-'),
        vendor || null,
        category || null,
        product_type || null,
        price || 0,
        cost || 0,
        inventory_quantity || 0,
        low_stock_threshold || 10,
        JSON.stringify(images || [])
      ]);

      const product = productResult.rows[0];

      // If variants are provided, create them
      if (variants && variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          const variantSql = `
            INSERT INTO product_variants (
              product_id, store_id, title, sku, price, cost,
              inventory_quantity, position
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;

          await client.query(variantSql, [
            product.id,
            storeId,
            variant.title,
            variant.sku || null,
            variant.price || product.price,
            variant.cost || product.cost,
            variant.inventory_quantity || 0,
            i + 1
          ]);
        }
      }

      await client.query('COMMIT');

      // Fetch the complete product with variants
      return await this.getProductById(product.id, storeId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update an existing product
  async updateProduct(productId, productData, storeId) {
    const {
      name,
      sku,
      handle,
      vendor,
      category,
      product_type,
      price,
      cost,
      inventory_quantity,
      low_stock_threshold,
      images,
      status
    } = productData;

    const sql = `
      UPDATE products
      SET
        name = COALESCE($1, name),
        sku = COALESCE($2, sku),
        handle = COALESCE($3, handle),
        vendor = COALESCE($4, vendor),
        category = COALESCE($5, category),
        product_type = COALESCE($6, product_type),
        price = COALESCE($7, price),
        cost = COALESCE($8, cost),
        inventory_quantity = COALESCE($9, inventory_quantity),
        low_stock_threshold = COALESCE($10, low_stock_threshold),
        images = COALESCE($11, images),
        status = COALESCE($12, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13 AND store_id = $14 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await query(sql, [
      name,
      sku,
      handle,
      vendor,
      category,
      product_type,
      price,
      cost,
      inventory_quantity,
      low_stock_threshold,
      images ? JSON.stringify(images) : null,
      status,
      productId,
      storeId
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return await this.getProductById(productId, storeId);
  }

  // Soft delete a product
  async deleteProduct(productId, storeId) {
    const sql = `
      UPDATE products
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND store_id = $2 AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await query(sql, [productId, storeId]);
    return result.rows.length > 0;
  }

  // Get products with low stock
  async getLowStockProducts(storeId) {
    const sql = `
      SELECT p.*,
        (p.inventory_quantity <= p.low_stock_threshold) as is_low_stock
      FROM products p
      WHERE p.store_id = $1
        AND p.deleted_at IS NULL
        AND p.inventory_quantity <= p.low_stock_threshold
      ORDER BY p.inventory_quantity ASC
    `;

    const result = await query(sql, [storeId]);
    return result.rows;
  }
}

module.exports = new ProductService();
