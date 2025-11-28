// backend/src/controllers/storesController.js
// HTTP request handlers for store-related endpoints
// Manages store settings and multi-tenant operations

const { query } = require('../config/database');
const { getUserStores } = require('../middleware/storeAccess');
const inventoryService = require('../services/inventoryService');

class StoresController {
  // GET /api/stores - Get all stores the user has access to
  async getUserStores(req, res) {
    try {
      const userId = req.user.userId;

      const stores = await getUserStores(userId);
      res.json({ stores });
    } catch (error) {
      console.error('Get user stores error:', error);
      res.status(500).json({ error: 'Failed to fetch stores' });
    }
  }

  // GET /api/stores/:id - Get store details
  async getStore(req, res) {
    try {
      const storeId = req.params.id;
      const userId = req.user.userId;

      // Make sure the user has access to this store
      const sql = `
        SELECT s.*, us.role as user_role
        FROM stores s
        JOIN user_stores us ON s.id = us.store_id
        WHERE s.id = $1 AND us.user_id = $2
      `;

      const result = await query(sql, [storeId, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Store not found or access denied' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get store error:', error);
      res.status(500).json({ error: 'Failed to fetch store' });
    }
  }

  // PUT /api/stores/:id/settings - Update store settings
  async updateStoreSettings(req, res) {
    try {
      const storeId = req.storeAccess.storeId;
      const { name, domain, settings } = req.body;

      const sql = `
        UPDATE stores
        SET
          name = COALESCE($1, name),
          domain = COALESCE($2, domain),
          settings = COALESCE($3, settings),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;

      const result = await query(sql, [
        name,
        domain,
        settings ? JSON.stringify(settings) : null,
        storeId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Store not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update store settings error:', error);
      res.status(500).json({ error: 'Failed to update store settings' });
    }
  }

  // GET /api/stores/:id/inventory-summary - Get inventory overview
  async getInventorySummary(req, res) {
    try {
      const storeId = req.storeAccess.storeId;

      const summary = await inventoryService.getInventorySummary(storeId);
      res.json(summary);
    } catch (error) {
      console.error('Get inventory summary error:', error);
      res.status(500).json({ error: 'Failed to fetch inventory summary' });
    }
  }

  // GET /api/stores/:id/restock-needed - Get products that need restocking
  async getRestockNeeded(req, res) {
    try {
      const storeId = req.storeAccess.storeId;

      const products = await inventoryService.getRestockNeeded(storeId);
      res.json({ products });
    } catch (error) {
      console.error('Get restock needed error:', error);
      res.status(500).json({ error: 'Failed to fetch restock list' });
    }
  }

  // GET /api/stores/:id/adjustments - Get recent stock adjustments
  async getRecentAdjustments(req, res) {
    try {
      const storeId = req.storeAccess.storeId;
      const options = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await inventoryService.getRecentAdjustments(storeId, options);
      res.json(result);
    } catch (error) {
      console.error('Get recent adjustments error:', error);
      res.status(500).json({ error: 'Failed to fetch adjustments' });
    }
  }

  // POST /api/stores - Create a new store
  async createStore(req, res) {
    try {
      const userId = req.user.userId;
      const { name, domain, platform } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Store name is required' });
      }

      const client = await query.pool.connect();

      try {
        await client.query('BEGIN');

        // Create the store
        const storeSql = `
          INSERT INTO stores (name, domain, platform, settings)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;

        const defaultSettings = {
          currency: 'USD',
          tax_rate: 0,
          tax_included: false,
          timezone: 'UTC'
        };

        const storeResult = await client.query(storeSql, [
          name,
          domain || null,
          platform || 'standalone',
          JSON.stringify(defaultSettings)
        ]);

        const store = storeResult.rows[0];

        // Link the user to the store as owner
        await client.query(
          `INSERT INTO user_stores (user_id, store_id, role)
           VALUES ($1, $2, 'owner')`,
          [userId, store.id]
        );

        await client.query('COMMIT');

        res.status(201).json(store);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Create store error:', error);
      res.status(500).json({ error: 'Failed to create store' });
    }
  }
}

module.exports = new StoresController();
