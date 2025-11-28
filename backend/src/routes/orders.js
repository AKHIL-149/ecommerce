// backend/src/routes/orders.js
// API routes for order management

const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticate } = require('../middleware/auth');
const { checkStoreAccess, requireStoreRole } = require('../middleware/storeAccess');
const { validateOrder } = require('../middleware/validate');

// All order routes require authentication and store access
router.use(authenticate);
router.use(checkStoreAccess);

// Get today's stats - this needs to come before /:id to avoid route conflicts
router.get('/stats/today', ordersController.getTodayStats);

// List all orders
router.get('/', ordersController.listOrders);

// Get single order
router.get('/:id', ordersController.getOrder);

// Create new order - requires staff role or higher
router.post('/', requireStoreRole('staff'), validateOrder, ordersController.createOrder);

// Update order status - requires staff role or higher
router.put('/:id', requireStoreRole('staff'), ordersController.updateOrder);

// Cancel order - requires manager role or higher
router.delete('/:id', requireStoreRole('manager'), ordersController.cancelOrder);

module.exports = router;
