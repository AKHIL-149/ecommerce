// backend/src/routes/connectors.js
const express = require('express');
const router = express.Router();
const connectorsController = require('../controllers/connectorsController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, connectorsController.listConnectors);
router.post('/stores', authenticate, connectorsController.addStore);
router.post('/test', authenticate, connectorsController.testConnection);
router.post('/sync', authenticate, connectorsController.syncData);

module.exports = router;