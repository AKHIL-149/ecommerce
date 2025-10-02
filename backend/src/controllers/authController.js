// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await query(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
        [email, hashedPassword, firstName, lastName]
      );

      const token = jwt.sign(
        { userId: result.rows[0].id, email: result.rows[0].email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: result.rows[0],
        token
      });
    } catch (error) {
      console.error('Register error:', error);
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
}

module.exports = new AuthController();