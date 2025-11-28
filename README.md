# EcomInventory - Open Source Inventory Management System

> A self-hosted inventory and store management system designed for small businesses. Track products, manage orders, monitor customers, and grow your business.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v16+-green.svg)
![React](https://img.shields.io/badge/react-v18+-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-v15+-blue.svg)

## Features

- **Product Management** - Add products with variants, track stock levels, get low stock alerts
- **Order Management** - Manually enter orders from in-store or phone sales
- **Customer Tracking** - Keep track of your regulars and their purchase history
- **Inventory Control** - Real-time stock tracking with adjustment history
- **Sales Reports** - Generate reports to understand what's selling and what's not
- **Multi-tenant** - Support multiple stores in one installation
- **Role-based Access** - Control who can view and edit data (owner, manager, staff, viewer)
- **Docker Ready** - One-command deployment with Docker Compose
- **API-First** - Complete REST API for integrations and future expansions

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git installed
- At least 2GB of free RAM

### Installation

1. Clone the repository
```bash
git clone https://github.com/AKHIL-149/ecom-inventory.git
cd ecom-inventory
```

2. Create your environment file
```bash
cp .env.example .env
```

3. Edit the .env file and update the following values:
   - `JWT_SECRET` - Generate a secure random string
   - `POSTGRES_PASSWORD` - Choose a strong database password

4. Start the application
```bash
docker-compose up -d
```

5. Run database migrations
```bash
docker-compose exec backend npx knex migrate:latest
```

6. Access the application
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

7. Register your account or use demo credentials
   - **Register**: Create a new account at http://localhost:3002/register (automatically creates your store)
   - **Demo Login**: Email: `demo@example.com`, Password: `password`

## Manual Setup (Without Docker)

### Backend Setup

1. Install PostgreSQL 15+ and Redis 7+

2. Create database
```bash
createdb ecom_inventory
```

3. Install backend dependencies
```bash
cd backend
npm install
```

4. Run database migrations
```bash
npm run migrate
```

5. Start the backend server
```bash
npm run dev
```

### Frontend Setup

1. Install frontend dependencies
```bash
cd frontend
npm install
```

2. Create .env file
```bash
echo "PORT=3002" > .env
echo "REACT_APP_API_URL=http://localhost:3001/api" >> .env
```

3. Start the development server
```bash
npm start
```

## Usage

### First Time Setup

1. Register a new account at http://localhost:3002/register
   - Your store will be automatically created during registration
   - You'll be logged in immediately after registration
2. Customize your store settings (optional)
   - Go to Settings → Store Settings
   - Update store name, currency, timezone
3. Start adding products, customers, and orders

### Adding Products

1. Navigate to Products page
2. Click "Add Product"
3. Fill in product details (name, SKU, price, stock)
4. Add variants if needed (sizes, colors, etc.)
5. Upload product images
6. Set low stock threshold for alerts

### Creating Orders

1. Navigate to Orders page
2. Click "New Order"
3. Select or create a customer
4. Add products to the order
5. Enter payment and shipping details
6. Save the order

### Managing Inventory

1. Navigate to Inventory page
2. View current stock levels
3. See low stock alerts
4. Make stock adjustments as needed
5. View adjustment history for audit trail

## API Documentation

### Authentication

All API requests except login and register require authentication.

```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "yourpassword"
}

# Returns JWT token to use in subsequent requests
```

Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Products API

```bash
# List all products
GET /api/products?storeId=1&page=1&limit=20

# Get single product
GET /api/products/:id

# Create product
POST /api/products
{
  "name": "Product Name",
  "sku": "PROD-001",
  "price": 29.99,
  "inventory_quantity": 100,
  "store_id": 1
}

# Update product
PUT /api/products/:id

# Delete product (soft delete)
DELETE /api/products/:id

# Adjust stock
POST /api/products/:id/adjust-stock
{
  "quantity_change": -5,
  "reason": "Sold in store"
}
```

### Orders API

```bash
# List orders
GET /api/orders?storeId=1&status=pending

# Create order
POST /api/orders
{
  "store_id": 1,
  "customer_id": 123,
  "items": [
    {
      "product_id": 456,
      "quantity": 2,
      "price": 29.99
    }
  ],
  "total_amount": 59.98
}

# Update order status
PUT /api/orders/:id
{
  "status": "completed"
}
```

### Customers API

```bash
# List customers
GET /api/customers?storeId=1

# Create customer
POST /api/customers
{
  "store_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}

# Get customer with order history
GET /api/customers/:id/orders
```

## Architecture

```
ecom-inventory/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/      # Database and Redis configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth, validation, etc.
│   │   └── server.js    # Entry point
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # State management
│   │   └── utils/       # Helper functions
├── database/
│   └── migrations/      # SQL migration files
└── docker-compose.yml   # Docker configuration
```

## Technology Stack

### Backend
- Node.js 18+ with Express
- PostgreSQL 15+ for data storage
- Redis 7+ for caching
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React 18 with Hooks
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API calls

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Has no emojis in code or comments
- Uses natural, conversational comments
- Follows the existing code style
- Includes appropriate error handling

## Roadmap

### Phase 1 (Current)
- [x] Product management with variants
- [x] Manual order entry
- [x] Customer tracking
- [x] Inventory management
- [x] Basic reporting
- [x] Multi-tenant support

### Phase 2 (Future)
- [ ] Customer-facing online store
- [ ] Shopping cart functionality
- [ ] Payment gateway integration (Stripe)
- [ ] Email notifications
- [ ] Barcode/QR code support
- [ ] Advanced reporting and analytics
- [ ] Mobile app

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review closed issues for solutions

## Acknowledgments

Built with passion for small businesses who need simple, effective inventory management.
