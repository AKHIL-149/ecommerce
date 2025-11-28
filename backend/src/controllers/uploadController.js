// backend/src/controllers/uploadController.js
// Handles file uploads for product images
// Currently stores files locally, can be extended to use cloud storage later

const path = require('path');
const fs = require('fs').promises;

class UploadController {
  // POST /api/upload - Upload a file
  async uploadFile(req, res) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file;
      const storeId = req.storeAccess.storeId;

      // Validate file type - only allow images
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        // Delete the uploaded file if it's not an allowed type
        await fs.unlink(file.path);
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
        });
      }

      // Check file size - max 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        await fs.unlink(file.path);
        return res.status(400).json({
          error: 'File too large',
          message: 'Maximum file size is 5MB'
        });
      }

      // Generate a unique filename to prevent conflicts
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `${storeId}_${timestamp}${extension}`;

      // Define upload directory
      const uploadDir = path.join(__dirname, '../../uploads');

      // Create upload directory if it doesn't exist
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Move file to final location
      const finalPath = path.join(uploadDir, filename);
      await fs.rename(file.path, finalPath);

      // Return the file URL
      const fileUrl = `/uploads/${filename}`;

      res.json({
        success: true,
        file: {
          filename: filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: fileUrl
        }
      });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }

  // DELETE /api/upload/:filename - Delete an uploaded file
  async deleteFile(req, res) {
    try {
      const filename = req.params.filename;
      const storeId = req.storeAccess.storeId;

      // Make sure the file belongs to this store
      if (!filename.startsWith(`${storeId}_`)) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only delete files from your own store'
        });
      }

      const uploadDir = path.join(__dirname, '../../uploads');
      const filePath = path.join(uploadDir, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete the file
      await fs.unlink(filePath);

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }
}

module.exports = new UploadController();
