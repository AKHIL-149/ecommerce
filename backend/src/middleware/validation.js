// backend/src/middleware/validation.js
const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      return res.status(400).json({
        error: 'Validation Error',
        message: errorMessage,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

// Validation Schemas
const schemas = {
  // Auth Schemas
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    firstName: Joi.string()
      .min(1)
      .max(100)
      .required()
      .trim()
      .messages({
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .min(1)
      .max(100)
      .required()
      .trim()
      .messages({
        'any.required': 'Last name is required'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  // Analytics Query Schemas
  analyticsQuery: Joi.object({
    startDate: Joi.date()
      .iso()
      .required()
      .messages({
        'any.required': 'Start date is required',
        'date.format': 'Start date must be in ISO format'
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'any.required': 'End date is required',
        'date.min': 'End date must be after start date',
        'date.format': 'End date must be in ISO format'
      }),
    storeId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'any.required': 'Store ID is required',
        'number.base': 'Store ID must be a number',
        'number.positive': 'Store ID must be positive'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      })
  }),

  productPerformanceQuery: Joi.object({
    startDate: Joi.date()
      .iso()
      .required()
      .messages({
        'any.required': 'Start date is required'
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'any.required': 'End date is required',
        'date.min': 'End date must be after start date'
      }),
    storeId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'any.required': 'Store ID is required'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
  }),

  realTimeQuery: Joi.object({
    storeId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'any.required': 'Store ID is required'
      })
  }),

  // Store/Connector Schemas
  addStore: Joi.object({
    name: Joi.string()
      .min(1)
      .max(255)
      .required()
      .trim()
      .messages({
        'any.required': 'Store name is required'
      }),
    domain: Joi.string()
      .uri()
      .allow('')
      .optional()
      .messages({
        'string.uri': 'Domain must be a valid URL'
      }),
    platform: Joi.string()
      .valid('shopify', 'woocommerce', 'bigcommerce', 'magento')
      .required()
      .messages({
        'any.required': 'Platform is required',
        'any.only': 'Platform must be one of: shopify, woocommerce, bigcommerce, magento'
      }),
    config: Joi.object()
      .required()
      .messages({
        'any.required': 'Configuration is required'
      })
  }),

  testConnection: Joi.object({
    platform: Joi.string()
      .valid('shopify', 'woocommerce', 'bigcommerce', 'magento')
      .required(),
    config: Joi.object()
      .required()
  }),

  syncData: Joi.object({
    storeId: Joi.number()
      .integer()
      .positive()
      .required(),
    dataType: Joi.string()
      .valid('orders', 'products', 'customers', 'all')
      .default('all'),
    startDate: Joi.date()
      .iso()
      .optional(),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
  })
};

module.exports = {
  validate,
  schemas
};
