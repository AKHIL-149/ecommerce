// backend/src/routes/customers.js
// API routes for customer management

const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');
const { authenticate } = require('../middleware/auth');
const { checkStoreAccess, requireStoreRole } = require('../middleware/storeAccess');
const { validateCustomer } = require('../middleware/validate');

// All customer routes require authentication and store access
router.use(authenticate);
router.use(checkStoreAccess);

// Search customers - needs to come before /:id to avoid conflicts
router.get('/search', customersController.searchCustomers);

// Get top customers - needs to come before /:id to avoid conflicts
router.get('/top', customersController.getTopCustomers);

// List all customers
router.get('/', customersController.listCustomers);

// Get single customer
router.get('/:id', customersController.getCustomer);

// Get customer's order history
router.get('/:id/orders', customersController.getCustomerOrders);

// Create new customer - requires staff role or higher
router.post('/', requireStoreRole('staff'), validateCustomer, customersController.createCustomer);

// Update customer - requires staff role or higher
router.put('/:id', requireStoreRole('staff'), validateCustomer, customersController.updateCustomer);

// Delete customer - requires manager role or higher
router.delete('/:id', requireStoreRole('manager'), customersController.deleteCustomer);

module.exports = router;
