// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userResult = await query(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
        [email, hashedPassword, firstName, lastName]
      );

      const user = userResult.rows[0];

      // Create default store for the user
      const storeName = `${firstName}'s Store`;
      const storeDomain = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const storeSettings = JSON.stringify({
        currency: 'USD',
        timezone: 'UTC',
        low_stock_threshold: 10
      });

      const storeResult = await query(
        'INSERT INTO stores (name, domain, platform, settings) VALUES ($1, $2, $3, $4) RETURNING id',
        [storeName, storeDomain, 'standalone', storeSettings]
      );

      const storeId = storeResult.rows[0].id;

      // Link user to store as owner
      await query(
        'INSERT INTO user_stores (user_id, store_id, role) VALUES ($1, $2, $3)',
        [user.id, storeId, 'owner']
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: user,
        token
      });
    } catch (error) {
      console.error('Register error:', error);
      // Handle duplicate email error
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async logout(req, res) {
    res.json({ message: 'Logged out successfully' });
  }

  async getCurrentUser(req, res) {
    try {
      const result = await query(
        'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
        [req.user.userId]
      );

      res.json({ user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const userId = req.user.userId;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, userId]
        );

        if (existingUser.rows.length > 0) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      // Split name into first and last name (simple split on space)
      let firstName = '';
      let lastName = '';
      if (name) {
        const nameParts = name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }

      // Build update query dynamically based on provided fields
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name) {
        updates.push(`first_name = $${paramCount++}`);
        values.push(firstName);
        updates.push(`last_name = $${paramCount++}`);
        values.push(lastName);
      }

      if (email) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(userId);

      const result = await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, first_name, last_name`,
        values
      );

      res.json({
        user: {
          id: result.rows[0].id,
          email: result.rows[0].email,
          name: `${result.rows[0].first_name} ${result.rows[0].last_name}`.trim()
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.user.userId;

      // Validate inputs
      if (!current_password || !new_password) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      // Get current user
      const userResult = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValid = await bcrypt.compare(current_password, userResult.rows[0].password_hash);

      if (!isValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 12);

      // Update password
      await query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, userId]
      );

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
}

module.exports = new AuthController();