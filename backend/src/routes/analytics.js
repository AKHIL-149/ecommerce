// backend/src/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.get('/sales', authenticate, validate(schemas.analyticsQuery, 'query'), analyticsController.getSalesOverview);
router.get('/products', authenticate, validate(schemas.productPerformanceQuery, 'query'), analyticsController.getProductPerformance);
router.get('/customers', authenticate, validate(schemas.analyticsQuery, 'query'), analyticsController.getCustomerInsights);
router.get('/realtime', authenticate, validate(schemas.realTimeQuery, 'query'), analyticsController.getRealTimeStats);

module.exports = router;