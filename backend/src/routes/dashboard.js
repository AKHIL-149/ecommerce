// backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Dashboard endpoint' });
});

module.exports = router;