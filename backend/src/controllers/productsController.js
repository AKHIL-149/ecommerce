// backend/src/controllers/productsController.js
// HTTP request handlers for product-related endpoints
// Delegates business logic to the product service

const productService = require('../services/productService');
const inventoryService = require('../services/inventoryService');

class ProductsController {
  // GET /api/products - List all products
  async listProducts(req, res) {
    try {
      const storeId = req.storeAccess.storeId;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        category: req.query.category
      };

      const result = await productService.getProducts(storeId, options);
      res.json(result);
    } catch (error) {
      console.error('List products error:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  // GET /api/products/:id - Get single product
  async getProduct(req, res) {
    try {
      const productId = req.params.id;
      const storeId = req.storeAccess.storeId;

      const product = await productService.getProductById(productId, storeId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  }

  // POST /api/products - Create new product
  async createProduct(req, res) {
    try {
      const storeId = req.storeAccess.storeId;
      const userId = req.user.userId;

      const product = await productService.createProduct(req.body, storeId, userId);
      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product', message: error.message });
    }
  }

  // PUT /api/products/:id - Update product
  async updateProduct(req, res) {
    try {
      const productId = req.params.id;
      const storeId = req.storeAccess.storeId;

      const product = await productService.updateProduct(productId, req.body, storeId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }

  // DELETE /api/products/:id - Delete product (soft delete)
  async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
      const storeId = req.storeAccess.storeId;

      const deleted = await productService.deleteProduct(productId, storeId);

      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  // POST /api/products/:id/adjust-stock - Adjust product stock
  async adjustStock(req, res) {
    try {
      const productId = parseInt(req.params.id);
      const storeId = req.storeAccess.storeId;
      const userId = req.user.userId;
      const { variant_id, quantity_change, reason, notes } = req.body;

      const adjustment = await inventoryService.adjustStock(
        productId,
        variant_id || null,
        storeId,
        userId,
        { quantity_change, reason, notes }
      );

      res.json({
        message: 'Stock adjusted successfully',
        adjustment
      });
    } catch (error) {
      console.error('Adjust stock error:', error);
      res.status(500).json({ error: 'Failed to adjust stock', message: error.message });
    }
  }

  // GET /api/products/low-stock - Get products with low stock
  async getLowStock(req, res) {
    try {
      const storeId = req.storeAccess.storeId;

      const products = await productService.getLowStockProducts(storeId);
      res.json({ products });
    } catch (error) {
      console.error('Get low stock error:', error);
      res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
  }

  // GET /api/products/:id/adjustments - Get adjustment history
  async getAdjustmentHistory(req, res) {
    try {
      const productId = req.params.id;
      const storeId = req.storeAccess.storeId;
      const options = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await inventoryService.getAdjustmentHistory(productId, storeId, options);
      res.json(result);
    } catch (error) {
      console.error('Get adjustment history error:', error);
      res.status(500).json({ error: 'Failed to fetch adjustment history' });
    }
  }
}

module.exports = new ProductsController();
