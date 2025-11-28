-- Migration: Add product categories
-- Description: Adds category support to products and creates categories table

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(store_id, name)
);

-- Add category_id to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_store ON categories(store_id) WHERE deleted_at IS NULL;

-- Insert some default categories for existing stores
INSERT INTO categories (store_id, name, description, color)
SELECT DISTINCT
  p.store_id,
  'Uncategorized',
  'Default category for products without a specific category',
  '#6B7280'
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM categories c
  WHERE c.store_id = p.store_id AND c.name = 'Uncategorized'
)
ON CONFLICT (store_id, name) DO NOTHING;
