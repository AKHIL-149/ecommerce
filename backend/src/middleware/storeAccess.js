// backend/src/middleware/storeAccess.js
// Middleware to ensure users can only access stores they have permission for
// This prevents users from modifying other people's data

const { query } = require('../config/database');

// Check if the user has access to a specific store
// The store ID can come from the URL params, query string, or request body
const checkStoreAccess = async (req, res, next) => {
  try {
    // Get the store ID from wherever it appears in the request
    const storeId = req.params.storeId || req.query.storeId || req.body.storeId || req.body.store_id;

    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    const userId = req.user.userId;

    // Check if this user has access to this store
    const result = await query(
      `SELECT us.role, s.is_active
       FROM user_stores us
       JOIN stores s ON us.store_id = s.id
       WHERE us.user_id = $1 AND us.store_id = $2`,
      [userId, storeId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this store'
      });
    }

    const { role, is_active } = result.rows[0];

    // Check if the store is still active
    if (!is_active) {
      return res.status(403).json({
        error: 'Store inactive',
        message: 'This store has been deactivated'
      });
    }

    // Attach the store info to the request for later use
    req.storeAccess = {
      storeId: parseInt(storeId),
      role: role
    };

    next();
  } catch (error) {
    console.error('Store access check error:', error);
    res.status(500).json({ error: 'Failed to verify store access' });
  }
};

// Check if the user has a specific role for the store
const requireStoreRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.storeAccess) {
      return res.status(500).json({ error: 'Store access not verified' });
    }

    const userRole = req.storeAccess.role;

    // Define role hierarchy: owner > manager > staff > viewer
    const roleHierarchy = {
      'owner': 4,
      'manager': 3,
      'staff': 2,
      'viewer': 1
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires ${requiredRole} role or higher`
      });
    }

    next();
  };
};

// Get all stores the user has access to
const getUserStores = async (userId) => {
  try {
    const result = await query(
      `SELECT s.*, us.role
       FROM stores s
       JOIN user_stores us ON s.id = us.store_id
       WHERE us.user_id = $1 AND s.is_active = true
       ORDER BY s.name`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Get user stores error:', error);
    return [];
  }
};

module.exports = {
  checkStoreAccess,
  requireStoreRole,
  getUserStores
};
