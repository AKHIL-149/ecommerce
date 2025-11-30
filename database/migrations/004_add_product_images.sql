-- Migration: Add product images support
-- Date: 2025-11-28
-- Description: Adds image_url column to products table for product image storage

-- Add image_url column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN products.image_url IS 'URL or base64 encoded image data for the product';
