# Quick Start Guide

Get the e-commerce inventory management system running in 5 minutes.

## Option 1: Docker (Recommended - Easiest)

### Prerequisites
- Docker Desktop installed and running

### Steps

1. **Start the application**
```bash
docker-compose up -d
```

2. **Wait for services to be ready** (about 30 seconds)

3. **Run database migrations**
```bash
docker-compose exec backend npx knex migrate:latest
```

4. **Create a demo user and store**
```bash
# Access the PostgreSQL container
docker-compose exec postgres psql -U postgres -d ecom_analytics

# Run these SQL commands:
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('demo@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJGvvKdN2', 'Demo', 'User');

INSERT INTO stores (name, domain, platform, settings)
VALUES ('Demo Store', 'demo.store', 'standalone', '{"currency": "USD", "timezone": "UTC"}');

INSERT INTO user_stores (user_id, store_id, role)
VALUES (1, 1, 'owner');

# Exit with: \q
```

5. **Access the application**
- Frontend: http://localhost:3002
- Backend API: http://localhost:3001/api
- **Demo Login**:
  - Email: `demo@example.com`
  - Password: `password`
- **Or Register**: Create a new account at http://localhost:3002/register (your store will be auto-created)

## Option 2: Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 15
- Redis 7

### Steps

1. **Setup Database**
```bash
# Create database
createdb ecom_analytics

# Run migrations
cd backend
npm install
npx knex migrate:latest
```

2. **Configure Environment**
```bash
# Copy and edit .env file
cp .env.example .env

# Edit .env with your database credentials
```

3. **Start Backend**
```bash
cd backend
npm install
node src/server.js
```

4. **Start Frontend** (in another terminal)
```bash
cd frontend
npm install
npm start
```

5. **Create Demo User** (in database)
```sql
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('demo@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJGvvKdN2', 'Demo', 'User');

INSERT INTO stores (name, domain, platform, settings)
VALUES ('Demo Store', 'demo.store', 'standalone', '{"currency": "USD", "timezone": "UTC"}');

INSERT INTO user_stores (user_id, store_id, role)
VALUES (1, 1, 'owner');
```

6. **Access the application**
- Frontend: http://localhost:3002
- **Demo Login**:
  - Email: `demo@example.com`
  - Password: `password`
- **Or Register**: Create a new account (your store will be auto-created)

## Option 3: Deploy to Railway (Cloud)

1. **Sign up** at https://railway.app
2. **Click "New Project"**
3. **Deploy from GitHub repo**
4. **Add PostgreSQL and Redis** services
5. **Set environment variables** from `.env.example`
6. **Done!** Railway gives you a live URL

## Troubleshooting

### Docker not starting?
```bash
# Check Docker is running
docker --version

# Restart Docker Desktop
# Then try: docker-compose up -d
```

### Port already in use?
```bash
# Change ports in docker-compose.yml
# Frontend default: 3002 (port 3003 in docker-compose.yml maps to 3000 inside container)
# Backend default: 3001
```

### Database connection error?
```bash
# Check PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs backend
```

## What's Next?

After logging in, you can:
1. **Add Products** - Go to Products page and create sample products
2. **Create Orders** - Use the Orders page to create manual orders
3. **Add Customers** - Maintain a customer database
4. **Track Inventory** - Adjust stock levels and view history
5. **View Reports** - See sales analytics and insights
6. **Configure Settings** - Update store settings and your profile

## Default Demo Data

The system starts empty. You can:
- Register a new account (creates a new store automatically)
- Use the demo account above
- Add sample products, customers, and orders through the UI

## Need Help?

Check the main README.md for:
- Full feature documentation
- API documentation
- Architecture overview
- Development guide
