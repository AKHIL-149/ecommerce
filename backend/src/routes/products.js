// backend/src/routes/products.js
// API routes for product management

const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticate } = require('../middleware/auth');
const { checkStoreAccess, requireStoreRole } = require('../middleware/storeAccess');
const { validateProduct, validateStockAdjustment } = require('../middleware/validate');

// All product routes require authentication and store access
router.use(authenticate);
router.use(checkStoreAccess);

// Get low stock products - this needs to come before /:id to avoid route conflicts
router.get('/low-stock', productsController.getLowStock);

// List all products
router.get('/', productsController.listProducts);

// Get single product
router.get('/:id', productsController.getProduct);

// Create new product - requires staff role or higher
router.post('/', requireStoreRole('staff'), validateProduct, productsController.createProduct);

// Update product - requires staff role or higher
router.put('/:id', requireStoreRole('staff'), validateProduct, productsController.updateProduct);

// Delete product - requires manager role or higher
router.delete('/:id', requireStoreRole('manager'), productsController.deleteProduct);

// Adjust stock - requires staff role or higher
router.post('/:id/adjust-stock', requireStoreRole('staff'), validateStockAdjustment, productsController.adjustStock);

// Get adjustment history
router.get('/:id/adjustments', productsController.getAdjustmentHistory);

module.exports = router;
