// backend/src/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.get('/sales', authenticate, analyticsController.getSalesOverview);
router.get('/products', authenticate, analyticsController.getProductPerformance);
router.get('/customers', authenticate, analyticsController.getCustomerInsights);
router.get('/realtime', authenticate, analyticsController.getRealTimeStats);

module.exports = router;