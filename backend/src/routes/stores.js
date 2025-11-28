// backend/src/routes/stores.js
// API routes for store management

const express = require('express');
const router = express.Router();
const storesController = require('../controllers/storesController');
const { authenticate } = require('../middleware/auth');
const { checkStoreAccess, requireStoreRole } = require('../middleware/storeAccess');

// All store routes require authentication
router.use(authenticate);

// Get all stores the user has access to - no store access check needed
router.get('/', storesController.getUserStores);

// Create new store - no store access check needed
router.post('/', storesController.createStore);

// Routes below require access to a specific store
router.use(checkStoreAccess);

// Get store details
router.get('/:id', storesController.getStore);

// Update store settings - requires owner role
router.put('/:id/settings', requireStoreRole('owner'), storesController.updateStoreSettings);

// Get inventory summary
router.get('/:id/inventory-summary', storesController.getInventorySummary);

// Get products that need restocking
router.get('/:id/restock-needed', storesController.getRestockNeeded);

// Get recent stock adjustments
router.get('/:id/adjustments', storesController.getRecentAdjustments);

module.exports = router;
