// backend/src/routes/categories.js
// Routes for category management

const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.get('/', categoriesController.list);
router.post('/', categoriesController.create);
router.put('/:id', categoriesController.update);
router.delete('/:id', categoriesController.delete);

module.exports = router;
