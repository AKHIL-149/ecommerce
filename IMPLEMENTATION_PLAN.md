# EcomAnalytics to Inventory Management System - Implementation Plan

## Overview
Transform the existing analytics platform into a self-hosted inventory and store management system that any small business can use to track products, manage orders, and monitor customers. Later, businesses can optionally add an online storefront.

## Phase 1: Core Inventory Management (Current Focus)

### What We're Keeping (Already Good)
1. Database schema - products, orders, customers, variants tables are perfect
2. Multi-tenant architecture - stores table and user_stores relationships
3. Authentication system - JWT-based auth with bcrypt
4. Docker setup - easy deployment
5. PostgreSQL + Redis infrastructure
6. Rate limiting and security middleware

### What We're Removing/Repurposing
1. External platform connectors (Shopify, WooCommerce)
   - These were for importing data FROM other platforms
   - We're building a standalone system now
   - Remove: ShopifyConnector, WooCommerceConnector, ConnectorManager
   - Remove: connectors routes and controller

2. Analytics-focused UI
   - Replace dashboard charts with admin management interface
   - Keep analytics as a secondary feature for reports

### What We're Building New

#### Backend Changes

1. **Product Management API** (NEW)
   - POST /api/products - create product with variants
   - GET /api/products - list all products with pagination
   - GET /api/products/:id - get single product details
   - PUT /api/products/:id - update product
   - DELETE /api/products/:id - soft delete product
   - POST /api/products/:id/adjust-stock - manual stock adjustments
   - GET /api/products/low-stock - products below threshold

2. **Order Management API** (NEW)
   - POST /api/orders - manually create order (for in-store sales)
   - GET /api/orders - list orders with filters
   - GET /api/orders/:id - get order details
   - PUT /api/orders/:id - update order status
   - DELETE /api/orders/:id - cancel order
   - GET /api/orders/stats - quick stats (today's sales, etc)

3. **Customer Management API** (NEW)
   - POST /api/customers - add customer
   - GET /api/customers - list customers
   - GET /api/customers/:id - get customer with order history
   - PUT /api/customers/:id - update customer
   - DELETE /api/customers/:id - soft delete customer
   - GET /api/customers/:id/orders - customer's orders

4. **Store Settings API** (NEW)
   - GET /api/stores/:id - get store details
   - PUT /api/stores/:id/settings - update store settings
   - Currency, tax rates, business info, etc

5. **Reports API** (ENHANCE EXISTING)
   - Keep existing analytics endpoints
   - Add inventory reports
   - Add low stock alerts
   - Sales by product/category
   - Customer purchase patterns

6. **File Upload API** (NEW)
   - POST /api/upload - handle product images
   - Store locally in /uploads for now
   - Later can add cloud storage

#### Database Changes

1. **Schema Modifications**
   - Add 'deleted_at' to products, customers, orders (soft deletes)
   - Add 'low_stock_threshold' to products
   - Add 'images' JSONB field to products table
   - Add 'notes' TEXT field to orders
   - Add 'store_settings' JSONB to stores table
   - Create 'stock_adjustments' table for audit trail

2. **New Migration File**
   - Create 002_ecommerce_enhancements.sql
   - Add new columns and tables
   - Add indexes for performance

#### Frontend Changes

1. **Authentication Flow** (NEW)
   - Login page
   - Registration page (for new store owners)
   - Protected routes
   - Token management
   - Logout functionality

2. **Main Layout** (NEW)
   - Sidebar navigation
   - Top header with user info
   - Store selector (if user has multiple stores)
   - Responsive mobile layout

3. **Dashboard Page** (TRANSFORM EXISTING)
   - Today's stats (orders, revenue)
   - Low stock alerts
   - Recent orders
   - Quick actions
   - Simple charts (keep from existing)

4. **Products Page** (NEW)
   - Product list with search/filter
   - Add product form with variants
   - Edit product inline or modal
   - Bulk actions (delete, adjust stock)
   - Image upload
   - Categories filter

5. **Orders Page** (NEW)
   - Order list with status filters
   - Create new order form
   - Order details view
   - Update order status
   - Print invoice

6. **Customers Page** (NEW)
   - Customer list
   - Add customer form
   - Customer details with order history
   - Search by name/email

7. **Inventory Page** (NEW)
   - Stock levels overview
   - Low stock warnings
   - Stock adjustment form
   - Stock history

8. **Reports Page** (NEW)
   - Sales reports with date range
   - Product performance
   - Customer insights
   - Export to CSV

9. **Settings Page** (NEW)
   - Store information
   - Currency and tax settings
   - User management (staff)
   - Profile settings

### File Structure After Changes

```
backend/
├── src/
│   ├── config/
│   │   └── database.js (keep)
│   ├── controllers/
│   │   ├── authController.js (keep, enhance)
│   │   ├── productsController.js (NEW)
│   │   ├── ordersController.js (NEW)
│   │   ├── customersController.js (NEW)
│   │   ├── storesController.js (NEW)
│   │   ├── reportsController.js (transform from analyticsController)
│   │   └── uploadController.js (NEW)
│   ├── middleware/
│   │   ├── auth.js (keep)
│   │   ├── validate.js (NEW - input validation)
│   │   └── storeAccess.js (NEW - check user has access to store)
│   ├── routes/
│   │   ├── auth.js (keep)
│   │   ├── products.js (NEW)
│   │   ├── orders.js (NEW)
│   │   ├── customers.js (NEW)
│   │   ├── stores.js (NEW)
│   │   ├── reports.js (transform from analytics.js)
│   │   └── upload.js (NEW)
│   ├── services/ (NEW LAYER)
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── customerService.js
│   │   └── inventoryService.js
│   ├── utils/ (NEW)
│   │   ├── validation.js
│   │   └── helpers.js
│   └── server.js (modify)

frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout.js (NEW)
│   │   │   ├── Sidebar.js (NEW)
│   │   │   ├── Header.js (NEW)
│   │   │   ├── Table.js (NEW - reusable)
│   │   │   ├── Modal.js (NEW)
│   │   │   ├── Button.js (NEW)
│   │   │   └── Input.js (NEW)
│   │   ├── auth/
│   │   │   ├── Login.js (NEW)
│   │   │   └── Register.js (NEW)
│   │   ├── dashboard/
│   │   │   └── Dashboard.js (transform existing)
│   │   ├── products/
│   │   │   ├── ProductList.js (NEW)
│   │   │   ├── ProductForm.js (NEW)
│   │   │   └── ProductDetail.js (NEW)
│   │   ├── orders/
│   │   │   ├── OrderList.js (NEW)
│   │   │   ├── OrderForm.js (NEW)
│   │   │   └── OrderDetail.js (NEW)
│   │   ├── customers/
│   │   │   ├── CustomerList.js (NEW)
│   │   │   ├── CustomerForm.js (NEW)
│   │   │   └── CustomerDetail.js (NEW)
│   │   ├── inventory/
│   │   │   └── InventoryView.js (NEW)
│   │   ├── reports/
│   │   │   └── Reports.js (NEW)
│   │   └── settings/
│   │       └── Settings.js (NEW)
│   ├── context/
│   │   ├── AuthContext.js (NEW)
│   │   └── StoreContext.js (NEW)
│   ├── utils/
│   │   ├── api.js (NEW - axios wrapper)
│   │   └── helpers.js (NEW)
│   ├── App.js (modify for routing)
│   └── index.js (keep)
```

### Implementation Order (Step-by-Step)

#### Stage 1: Foundation & Cleanup
1. Remove connector files and routes
2. Create database migration for enhancements
3. Create .env.example file with all required variables
4. Update README with new project description
5. Add input validation middleware

#### Stage 2: Backend Core APIs
1. Create service layer for business logic
2. Build Products API (full CRUD)
3. Build Orders API (manual entry)
4. Build Customers API
5. Build Store Settings API
6. Add file upload handling
7. Transform analytics to reports API

#### Stage 3: Frontend Foundation
1. Set up React Router
2. Create AuthContext and authentication flow
3. Build Login/Register pages
4. Create main Layout with Sidebar
5. Create reusable components (Table, Modal, etc)

#### Stage 4: Frontend Pages
1. Transform Dashboard (keep charts, add quick stats)
2. Build Products management page
3. Build Orders management page
4. Build Customers page
5. Build Inventory tracking page
6. Build Reports page
7. Build Settings page

#### Stage 5: Polish & Testing
1. Add loading states throughout
2. Add error handling
3. Add success notifications
4. Test all CRUD operations
5. Test multi-tenant isolation
6. Update documentation
7. Create setup wizard for first-time users

### Technical Decisions

1. **No emojis in code** - Clean, professional comments
2. **Comments style** - Natural, conversational, as if you wrote them
3. **Service layer** - Separate business logic from controllers
4. **Soft deletes** - Don't actually delete data, mark as deleted
5. **Image storage** - Local filesystem first, cloud later
6. **No external dependencies** - Standalone system
7. **Simple validation** - Manual validation, no heavy libraries yet

### Key Features for Phase 1

1. Add products with variants (sizes, colors, etc)
2. Track inventory levels
3. Get low stock alerts
4. Manually create orders (in-store sales)
5. Track customer purchase history
6. Generate sales reports
7. Multiple stores per installation
8. Multiple users per store with roles

### Later (Phase 2) - Customer-Facing Store

This comes later but keeping in mind:
- Public product catalog
- Shopping cart
- Online checkout with Stripe
- Customer self-service
- Public store theme customization

## Migration Strategy

Since this is a significant change, we'll:
1. Keep old code in separate branch
2. Make changes incrementally
3. Test each stage before moving forward
4. Maintain database compatibility

## Success Criteria

Phase 1 is complete when:
- Store owner can add/edit/delete products
- Store owner can manually enter orders
- Store owner can track customers
- Store owner can view inventory levels
- Store owner can generate basic reports
- Multiple users can access same store
- Everything works via Docker deployment
- Documentation is updated

## Comments Style Example

Good comment style (natural, humanized):
```javascript
// Check if the user actually owns this store before letting them modify anything
// This prevents users from accessing other people's data

// Calculate the new stock level after this adjustment
// We need to make sure it doesn't go negative

// This query is a bit complex but it groups orders by day
// and calculates totals for the date range
```

Bad comment style (avoid):
```javascript
// TODO: Fix this later
// Magic number
// This is the main function
```
