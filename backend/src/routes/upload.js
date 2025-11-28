// backend/src/routes/upload.js
// API routes for file uploads

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { checkStoreAccess } = require('../middleware/storeAccess');

// Configure multer for temporary file storage
// Files will be moved to final location after validation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// All upload routes require authentication and store access
router.use(authenticate);
router.use(checkStoreAccess);

// Upload a file
router.post('/', upload.single('file'), uploadController.uploadFile);

// Delete a file
router.delete('/:filename', uploadController.deleteFile);

module.exports = router;
