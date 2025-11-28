-- database/migrations/002_ecommerce_enhancements.sql
-- Enhancements for inventory management and e-commerce features

-- Add soft delete support to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add low stock threshold for inventory alerts
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

-- Add images field to store product images as JSON array
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add soft delete support to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add soft delete support to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add notes field for internal order notes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add store settings to stores table for business configuration
ALTER TABLE stores ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Create stock adjustments table to track all inventory changes
-- This gives us a full audit trail of who changed what and when
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id SERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    adjustment_type VARCHAR(50) NOT NULL,
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(inventory_quantity) WHERE inventory_quantity <= low_stock_threshold;
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product_id ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_store_id ON stock_adjustments(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created_at ON stock_adjustments(created_at);

-- Update existing products to have default settings if they don't have them
UPDATE products SET images = '[]'::jsonb WHERE images IS NULL;
UPDATE products SET low_stock_threshold = 10 WHERE low_stock_threshold IS NULL;
UPDATE stores SET settings = '{}'::jsonb WHERE settings IS NULL;

-- Add default store settings for existing stores
UPDATE stores
SET settings = jsonb_build_object(
    'currency', 'USD',
    'tax_rate', 0,
    'tax_included', false,
    'timezone', 'UTC'
)
WHERE settings = '{}'::jsonb;
