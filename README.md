# 🚀 EcomAnalytics - Open Source E-commerce Analytics Platform

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg)
![React](https://img.shields.io/badge/react-v18+-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-v15+-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)

**AI-driven analytics platform that any e-commerce business can use to gain insights, optimize operations, and enhance customer experience.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## ✨ Features

### 📊 Real-time Dashboard
- Live sales, traffic, and performance metrics
- Auto-refreshing real-time statistics (every 30 seconds)
- Beautiful, responsive charts and visualizations
- Customizable date ranges for historical analysis

### 🔌 Multi-Platform Support
- **Shopify** - Full integration with Shopify stores
- **WooCommerce** - WordPress e-commerce support
- **BigCommerce** - Enterprise e-commerce platform
- **Magento** - Flexible e-commerce solution

### 📈 Advanced Analytics
- **Sales Overview** - Daily revenue, orders, and trends
- **Customer Segmentation** - VIP, Loyal, Regular, and New customers
- **Product Performance** - Top products by revenue and units sold
- **Traffic Analysis** - Page views, sessions, and visitor tracking
- **Repeat Customer Rate** - Customer retention metrics

### 🎨 Customizable & Extensible
- Plugin architecture for custom connectors
- RESTful API for third-party integrations
- Comprehensive Swagger API documentation

### 🔐 Security-First
- JWT-based authentication with secure password hashing (bcrypt)
- Input validation on all API endpoints (Joi)
- Rate limiting to prevent abuse
- HTTP security headers (Helmet)
- CORS protection

### 🐳 Docker-Ready
- One-command deployment with Docker Compose
- Development and production configurations
- Health checks for all services
- Automatic database migrations

### 🌐 Multi-Tenant Ready
- Support for multiple stores per user
- Role-based access control
- Store-level data isolation

---

## 🎯 Who Is This For?

- **E-commerce Business Owners** - Get actionable insights from your store data
- **Marketing Teams** - Track campaign performance and customer behavior
- **Developers** - Build custom analytics solutions or extend functionality
- **Agencies** - Manage analytics for multiple client stores

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
  - [Install Docker](https://docs.docker.com/get-docker/)
  - [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Git** - For cloning the repository

**OR** if running without Docker:

- **Node.js** (v18+) and **npm** (v9+)
- **PostgreSQL** (v15+)
- **Redis** (v7+)

---

## 🚀 Quick Start

Get up and running in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ecom-analytics.git
cd ecom-analytics

# 2. Copy environment file and configure
cp .env.example .env
# Edit .env and set your passwords and secrets (REQUIRED!)

# 3. Start all services with Docker Compose
docker-compose up -d

# 4. Wait for services to be healthy (30-60 seconds)
docker-compose ps

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

**Default Demo Credentials:**
- Email: `demo@example.com`
- Password: `password`

> ⚠️ **Important**: Change default passwords in production!

---

## 📦 Installation

### Option 1: Docker (Recommended)

1. **Clone and navigate to the project**
   ```bash
   git clone https://github.com/yourusername/ecom-analytics.git
   cd ecom-analytics
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file** and set the following **REQUIRED** variables:
   ```env
   POSTGRES_PASSWORD=your_secure_password_here
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   ```

   **Generate a secure JWT secret:**
   ```bash
   openssl rand -base64 64
   ```

4. **Start the services**
   ```bash
   docker-compose up -d
   ```

5. **Verify all services are running**
   ```bash
   docker-compose ps
   ```

   All services should show "Up" status with "(healthy)" indicator.

6. **View logs** (if needed)
   ```bash
   docker-compose logs -f
   ```

### Option 2: Manual Installation

<details>
<summary>Click to expand manual installation steps</summary>

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecom-analytics.git
   cd ecom-analytics
   ```

2. **Install PostgreSQL and Redis**
   - Follow official documentation for your OS
   - Create database: `createdb ecom_analytics`

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Run database migrations**
   ```bash
   cd ../backend
   psql -U postgres -d ecom_analytics -f ../database/migrations/001_initial_schema.sql
   ```

6. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secrets
   ```

7. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```

8. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```

</details>

---

## ⚙️ Configuration

### Environment Variables

Key configuration options in `.env`:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_PASSWORD` | PostgreSQL database password | - | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT token signing (min 32 chars) | - | ✅ Yes |
| `NODE_ENV` | Application environment | `development` | No |
| `PORT` | Backend API port | `3001` | No |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` | No |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `1000` | No |

See `.env.example` for complete configuration options.

---

## 🎮 Usage

### Accessing the Dashboard

1. **Navigate to** `http://localhost:3000`
2. **Login** with your credentials (or use demo account)
3. **Select date range** to view historical data
4. **Explore metrics:**
   - Real-time overview (visitors, orders, revenue)
   - Sales trends over time
   - Top performing products
   - Customer segmentation

### API Usage

**Authentication:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password"}'
```

**Get Sales Analytics:**
```bash
curl -X GET "http://localhost:3001/api/analytics/sales?storeId=1&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL (database)
- Redis (caching)
- JWT (authentication)
- Joi (validation)

**Frontend:**
- React 18
- Tailwind CSS
- Recharts (visualizations)
- Axios (HTTP client)

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL 15 Alpine
- Redis 7 Alpine

### Project Structure

```
ecom-analytics/
├── backend/                # Node.js/Express backend
│   ├── src/
│   │   ├── config/        # Database & Redis configuration
│   │   ├── connectors/    # E-commerce platform integrations
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, validation, etc.
│   │   ├── routes/        # API routes
│   │   └── server.js      # Express app entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   ├── Dockerfile
│   └── package.json
├── database/              # Database migrations
│   └── migrations/
│       └── 001_initial_schema.sql
├── docker-compose.yml     # Multi-container orchestration
├── .env.example           # Environment template
└── README.md              # This file
```

---

## 👩‍💻 Development

### Setting Up Development Environment

1. **Follow installation steps** for Docker or manual setup
2. **Enable hot reloading** (automatically enabled in dev mode)
3. **Run database migrations** (automatic on first run)

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue: "Please set POSTGRES_PASSWORD in .env file"**
- **Solution**: Create `.env` file from `.env.example` and set required variables

**Issue: Services not starting**
```bash
# Check service logs
docker-compose logs backend
docker-compose logs postgres

# Restart services
docker-compose restart
```

**Issue: Frontend can't connect to backend**
- **Solution**: Ensure `REACT_APP_API_URL` is set correctly

**Issue: Database connection errors**
- **Solution**: Wait for PostgreSQL to be fully started (check with `docker-compose ps`)

### Getting Help

- 📖 [Documentation](https://github.com/yourusername/ecom-analytics/wiki)
- 🐛 [Report Bug](https://github.com/yourusername/ecom-analytics/issues)
- 💡 [Request Feature](https://github.com/yourusername/ecom-analytics/issues)
- 💬 [Discussions](https://github.com/yourusername/ecom-analytics/discussions)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**What this means:**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ⚠️ No liability
- ⚠️ No warranty

---

## 🙏 Acknowledgments

- Built with ❤️ for the e-commerce community
- Inspired by the need for accessible, open-source analytics
- Special thanks to all contributors

---

## 📞 Support

### For Business Owners

- 📧 Email: support@ecomanalytics.com
- 💬 Community Forum: [GitHub Discussions](https://github.com/yourusername/ecom-analytics/discussions)

### For Developers

- 🐛 Bug Reports: [GitHub Issues](https://github.com/yourusername/ecom-analytics/issues)
- 💡 Feature Requests: [GitHub Issues](https://github.com/yourusername/ecom-analytics/issues)

---

<div align="center">

**[⬆ Back to Top](#-ecomanalytics---open-source-e-commerce-analytics-platform)**

Made with ❤️ by the EcomAnalytics community

</div>
