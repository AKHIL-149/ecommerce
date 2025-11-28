// backend/src/routes/reports.js
// API routes for reports and analytics

const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');
const { checkStoreAccess } = require('../middleware/storeAccess');

// All report routes require authentication and store access
router.use(authenticate);
router.use(checkStoreAccess);

// Get sales overview report
router.get('/sales', reportsController.getSalesOverview);

// Get product performance report
router.get('/products', reportsController.getProductPerformance);

// Get customer insights report
router.get('/customers', reportsController.getCustomerInsights);

// Get real-time statistics
router.get('/realtime', reportsController.getRealTimeStats);

module.exports = router;
