// backend/src/middleware/validate.js
// Input validation middleware for API requests
// This helps prevent bad data from getting into our database

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Simple validation helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  // Basic phone validation - adjust based on your needs
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

const isPositiveNumber = (num) => {
  return !isNaN(num) && Number(num) > 0;
};

const isNonNegativeNumber = (num) => {
  return !isNaN(num) && Number(num) >= 0;
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Basic validation schemas for common use cases
const validateProduct = (req, res, next) => {
  const { name, price, sku } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Product name is required' });
  }

  if (!price || !isNonNegativeNumber(price)) {
    errors.push({ field: 'price', message: 'Valid price is required' });
  }

  if (price && Number(price) < 0) {
    errors.push({ field: 'price', message: 'Price cannot be negative' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

const validateOrder = (req, res, next) => {
  const { customer_id, items, total_amount } = req.body;
  const errors = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push({ field: 'items', message: 'Order must contain at least one item' });
  }

  if (!total_amount || !isPositiveNumber(total_amount)) {
    errors.push({ field: 'total_amount', message: 'Valid total amount is required' });
  }

  // Validate each item in the order
  if (items && Array.isArray(items)) {
    items.forEach((item, index) => {
      if (!item.product_id) {
        errors.push({ field: `items[${index}].product_id`, message: 'Product ID is required' });
      }
      if (!item.quantity || !isPositiveNumber(item.quantity)) {
        errors.push({ field: `items[${index}].quantity`, message: 'Valid quantity is required' });
      }
      if (!item.price || !isNonNegativeNumber(item.price)) {
        errors.push({ field: `items[${index}].price`, message: 'Valid price is required' });
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

const validateCustomer = (req, res, next) => {
  const { email, first_name, last_name } = req.body;
  const errors = [];

  if (email && !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Valid email address is required' });
  }

  if (!first_name || first_name.trim().length === 0) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

const validateStockAdjustment = (req, res, next) => {
  const { product_id, quantity_change, reason } = req.body;
  const errors = [];

  if (!product_id) {
    errors.push({ field: 'product_id', message: 'Product ID is required' });
  }

  if (quantity_change === undefined || isNaN(quantity_change)) {
    errors.push({ field: 'quantity_change', message: 'Quantity change is required' });
  }

  if (!reason || reason.trim().length === 0) {
    errors.push({ field: 'reason', message: 'Reason for adjustment is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

module.exports = {
  validateRequest,
  validateProduct,
  validateOrder,
  validateCustomer,
  validateStockAdjustment,
  isValidEmail,
  isValidPhone,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidUrl
};
