// backend/src/controllers/categoriesController.js
// Handles category management operations

const { query } = require('../config/database');

class CategoriesController {
  async list(req, res) {
    try {
      const { storeId } = req.query;

      if (!storeId) {
        return res.status(400).json({ error: 'Store ID is required' });
      }

      const result = await query(
        `SELECT id, name, description, color, created_at
         FROM categories
         WHERE store_id = $1 AND deleted_at IS NULL
         ORDER BY name ASC`,
        [storeId]
      );

      res.json({ categories: result.rows });
    } catch (error) {
      console.error('List categories error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  async create(req, res) {
    try {
      const { store_id, name, description, color } = req.body;

      if (!store_id || !name) {
        return res.status(400).json({ error: 'Store ID and name are required' });
      }

      const result = await query(
        `INSERT INTO categories (store_id, name, description, color)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, color, created_at`,
        [store_id, name, description || null, color || '#3B82F6']
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create category error:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Category name already exists for this store' });
      }
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, color } = req.body;

      const result = await query(
        `UPDATE categories
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             color = COALESCE($3, color),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND deleted_at IS NULL
         RETURNING id, name, description, color, created_at`,
        [name, description, color, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      // Soft delete the category
      const result = await query(
        `UPDATE categories
         SET deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Set category_id to NULL for products in this category
      await query(
        `UPDATE products
         SET category_id = NULL
         WHERE category_id = $1`,
        [id]
      );

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
}

module.exports = new CategoriesController();
