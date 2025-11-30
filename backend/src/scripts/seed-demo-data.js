#!/usr/bin/env node
// backend/src/scripts/seed-demo-data.js
// Seeds the database with demo data from CSV files

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ecom_analytics',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }

  return data;
}

// Parse CSV line handling quoted values
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

async function createTestUser() {
  console.log('\n1. Creating test user and store...');

  try {
    // Check if test user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@superstore.com']
    );

    let userId;
    let storeId;

    if (existingUser.rows.length > 0) {
      console.log('   Test user already exists, using existing user');
      userId = existingUser.rows[0].id;

      // Get the store via user_stores
      const userStore = await pool.query(
        'SELECT store_id FROM user_stores WHERE user_id = $1 AND role = $2',
        [userId, 'owner']
      );

      if (userStore.rows.length > 0) {
        storeId = userStore.rows[0].store_id;
        console.log(`   Using existing store (ID: ${storeId})`);
        return { userId, storeId };
      }
    } else {
      // Create new test user
      const hashedPassword = await bcrypt.hash('demo123', 10);

      const userResult = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id`,
        ['Demo', 'User', 'demo@superstore.com', hashedPassword, 'admin']
      );

      userId = userResult.rows[0].id;
      console.log(`   ✓ Created user: demo@superstore.com (ID: ${userId})`);
    }

    // Create store
    const storeResult = await pool.query(
      `INSERT INTO stores (name, platform, settings, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id`,
      [
        'Superstore Demo',
        'manual',
        JSON.stringify({
          currency: 'USD',
          timezone: 'America/New_York',
          low_stock_threshold: 10
        })
      ]
    );

    storeId = storeResult.rows[0].id;
    console.log(`   ✓ Created store: Superstore Demo (ID: ${storeId})`);

    // Link user to store as owner
    await pool.query(
      `INSERT INTO user_stores (user_id, store_id, role, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [userId, storeId, 'owner']
    );

    console.log(`   ✓ Linked user to store as owner`);

    return { userId, storeId };

  } catch (error) {
    console.error('   Error creating test user:', error.message);
    throw error;
  }
}

async function seedCategories(storeId) {
  console.log('\n2. Seeding categories...');

  try {
    // Try multiple paths
    const possiblePaths = [
      path.join(__dirname, '../../../demo_categories.csv'),
      path.join(process.cwd(), 'demo_categories.csv'),
      '/app/demo_categories.csv',
      'C:\\ecommerce\\demo_categories.csv'
    ];

    let csvPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      console.log('   Warning: demo_categories.csv not found, skipping');
      console.log('   Tried paths:', possiblePaths);
      return {};
    }

    console.log(`   Found CSV at: ${csvPath}`);
    const categories = parseCSV(csvPath);
    const categoryMap = {};

    for (const category of categories) {
      // Check if category already exists
      const existing = await pool.query(
        'SELECT id FROM categories WHERE store_id = $1 AND name = $2',
        [storeId, category.name]
      );

      if (existing.rows.length > 0) {
        categoryMap[category.name] = existing.rows[0].id;
        console.log(`   - ${category.name} (existing)`);
        continue;
      }

      const result = await pool.query(
        `INSERT INTO categories (store_id, name, description, color, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id`,
        [storeId, category.name, category.description, category.color]
      );

      categoryMap[category.name] = result.rows[0].id;
      console.log(`   ✓ ${category.name} (ID: ${result.rows[0].id})`);
    }

    console.log(`   Total: ${Object.keys(categoryMap).length} categories`);
    return categoryMap;

  } catch (error) {
    console.error('   Error seeding categories:', error.message);
    throw error;
  }
}

async function seedProducts(storeId, categoryMap) {
  console.log('\n3. Seeding products...');

  try {
    const possiblePaths = [
      path.join(__dirname, '../../../demo_products.csv'),
      path.join(process.cwd(), 'demo_products.csv'),
      '/app/demo_products.csv',
      'C:\\ecommerce\\demo_products.csv'
    ];

    let csvPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      console.log('   Warning: demo_products.csv not found, skipping');
      return {};
    }

    console.log(`   Found CSV at: ${csvPath}`);
    const products = parseCSV(csvPath);
    const productMap = {};
    let count = 0;

    // Get next available ID
    const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM products');
    let nextId = maxIdResult.rows[0].next_id;

    for (const product of products) {
      // Get category ID
      const categoryId = categoryMap[product.category] || null;

      // Check if product already exists
      const existing = await pool.query(
        'SELECT id FROM products WHERE store_id = $1 AND sku = $2',
        [storeId, product.sku]
      );

      if (existing.rows.length > 0) {
        productMap[product.sku] = existing.rows[0].id;
        continue;
      }

      const result = await pool.query(
        `INSERT INTO products (
          id, store_id, name, sku, price, cost,
          category_id, inventory_quantity, low_stock_threshold,
          status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING id`,
        [
          nextId++,
          storeId,
          product.name,
          product.sku,
          parseFloat(product.price),
          parseFloat(product.cost) || 0,
          categoryId,
          parseInt(product.inventory_quantity),
          parseInt(product.low_stock_threshold),
          product.status
        ]
      );

      productMap[product.sku] = result.rows[0].id;
      count++;

      if (count % 20 === 0) {
        console.log(`   - Imported ${count} products...`);
      }
    }

    console.log(`   ✓ Total: ${count} products imported`);
    return productMap;

  } catch (error) {
    console.error('   Error seeding products:', error.message);
    throw error;
  }
}

async function seedCustomers(storeId) {
  console.log('\n4. Seeding customers...');

  try {
    const possiblePaths = [
      path.join(__dirname, '../../../demo_customers.csv'),
      path.join(process.cwd(), 'demo_customers.csv'),
      '/app/demo_customers.csv',
      'C:\\ecommerce\\demo_customers.csv'
    ];

    let csvPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      console.log('   Warning: demo_customers.csv not found, skipping');
      return {};
    }

    console.log(`   Found CSV at: ${csvPath}`);
    const customers = parseCSV(csvPath);
    const customerMap = {};
    let count = 0;

    // Get next available ID
    const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM customers');
    let nextId = maxIdResult.rows[0].next_id;

    for (const customer of customers) {
      // Check if customer already exists
      const existing = await pool.query(
        'SELECT id FROM customers WHERE store_id = $1 AND email = $2',
        [storeId, customer.email]
      );

      if (existing.rows.length > 0) {
        customerMap[customer.customer_id] = existing.rows[0].id;
        continue;
      }

      // Split name into first and last
      const nameParts = customer.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const result = await pool.query(
        `INSERT INTO customers (
          id, store_id, first_name, last_name, email, phone,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id`,
        [
          nextId++,
          storeId,
          firstName,
          lastName,
          customer.email,
          customer.phone
        ]
      );

      customerMap[customer.customer_id] = result.rows[0].id;
      count++;

      if (count % 20 === 0) {
        console.log(`   - Imported ${count} customers...`);
      }
    }

    console.log(`   ✓ Total: ${count} customers imported`);
    return customerMap;

  } catch (error) {
    console.error('   Error seeding customers:', error.message);
    throw error;
  }
}

async function seedOrders(storeId, customerMap, productMap) {
  console.log('\n5. Seeding orders...');

  try {
    const possiblePaths = [
      path.join(__dirname, '../../../demo_orders.csv'),
      path.join(process.cwd(), 'demo_orders.csv'),
      '/app/demo_orders.csv',
      'C:\\ecommerce\\demo_orders.csv'
    ];

    let csvPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      console.log('   Warning: demo_orders.csv not found, skipping');
      return;
    }

    console.log(`   Found CSV at: ${csvPath}`);
    const orders = parseCSV(csvPath);
    let count = 0;

    // Get next available ID
    const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM orders');
    let nextOrderId = maxIdResult.rows[0].next_id;

    // Group orders by order_id
    const orderGroups = {};
    orders.forEach(order => {
      if (!orderGroups[order.order_id]) {
        orderGroups[order.order_id] = [];
      }
      orderGroups[order.order_id].push(order);
    });

    for (const orderId in orderGroups) {
      const orderItems = orderGroups[orderId];
      const firstItem = orderItems[0];

      // Get customer ID
      const customerId = customerMap[firstItem.customer_id];
      if (!customerId) {
        console.log(`   - Skipping order ${orderId}: customer not found`);
        continue;
      }

      // Check if order already exists
      const existing = await pool.query(
        'SELECT id FROM orders WHERE store_id = $1 AND order_number = $2',
        [storeId, orderId]
      );

      if (existing.rows.length > 0) {
        continue;
      }

      // Calculate total amount
      const totalAmount = orderItems.reduce((sum, item) =>
        sum + parseFloat(item.total_amount), 0
      );

      // Create order
      const orderResult = await pool.query(
        `INSERT INTO orders (
          id, store_id, customer_id, order_number,
          total_amount, status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id`,
        [
          nextOrderId++,
          storeId,
          customerId,
          orderId,
          totalAmount.toFixed(2),
          firstItem.status,
          firstItem.order_date
        ]
      );

      const newOrderId = orderResult.rows[0].id;

      // Create order items
      for (const item of orderItems) {
        const productId = productMap[item.product_id];
        if (!productId) {
          console.log(`   - Skipping item: product ${item.product_id} not found`);
          continue;
        }

        const quantity = parseInt(item.quantity);
        const price = parseFloat(item.price_per_unit);
        const totalAmount = quantity * price;

        await pool.query(
          `INSERT INTO order_items (
            order_id, product_id, quantity, price, total_amount, created_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            newOrderId,
            productId,
            quantity,
            price,
            totalAmount.toFixed(2)
          ]
        );
      }

      count++;
      if (count % 10 === 0) {
        console.log(`   - Imported ${count} orders...`);
      }
    }

    console.log(`   ✓ Total: ${count} orders imported`);

  } catch (error) {
    console.error('   Error seeding orders:', error.message);
    throw error;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Superstore Demo Data Seeder');
  console.log('E-Commerce Inventory Management System');
  console.log('='.repeat(60));

  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');

    // Create test user and store
    const { userId, storeId } = await createTestUser();

    // Seed data
    const categoryMap = await seedCategories(storeId);
    const productMap = await seedProducts(storeId, categoryMap);
    const customerMap = await seedCustomers(storeId);
    await seedOrders(storeId, customerMap, productMap);

    console.log('\n' + '='.repeat(60));
    console.log('✅ DEMO DATA SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Store ID: ${storeId}`);
    console.log(`   Categories: ${Object.keys(categoryMap).length}`);
    console.log(`   Products: ${Object.keys(productMap).length}`);
    console.log(`   Customers: ${Object.keys(customerMap).length}`);

    console.log('\n🔐 Test Account Credentials:');
    console.log('   Email: demo@superstore.com');
    console.log('   Password: demo123');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Open http://localhost:3002');
    console.log('   2. Login with test credentials above');
    console.log('   3. Explore the dashboard and features');
    console.log('   4. See DEMO_GUIDE.md for full walkthrough');

    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeder
main();
