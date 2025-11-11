// backend/src/routes/connectors.js
const express = require('express');
const router = express.Router();
const connectorsController = require('../controllers/connectorsController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.get('/', authenticate, connectorsController.listConnectors);
router.post('/stores', authenticate, validate(schemas.addStore), connectorsController.addStore);
router.post('/test', authenticate, validate(schemas.testConnection), connectorsController.testConnection);
router.post('/sync', authenticate, validate(schemas.syncData), connectorsController.syncData);

module.exports = router;