# Contributing to EcomAnalytics

First off, thank you for considering contributing to EcomAnalytics! It's people like you that make EcomAnalytics such a great tool for the e-commerce community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to support@ecomanalytics.com.

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/yourusername/ecom-analytics/issues) to avoid duplicates.

**When creating a bug report, please include:**

- **Clear descriptive title**
- **Detailed steps to reproduce** the bug
- **Expected behavior** vs **actual behavior**
- **Screenshots** (if applicable)
- **Environment details**:
  - OS (Windows, macOS, Linux)
  - Node.js version
  - Docker version (if using Docker)
  - Browser (if frontend issue)
- **Error messages or logs**

**Example Bug Report:**

```markdown
## Bug: Dashboard fails to load sales data

**Steps to Reproduce:**
1. Login to dashboard
2. Select date range from Jan 1 - Jan 31
3. Navigate to Sales tab

**Expected:** Sales chart displays with data
**Actual:** Error message "Failed to fetch sales overview"

**Environment:**
- OS: macOS 13.0
- Node.js: 18.16.0
- Browser: Chrome 120

**Console Errors:**
```
Error: Network request failed at analyticsService.js:23
```
```

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Clear descriptive title**
- **Detailed description** of the proposed feature
- **Use cases** - why this feature would be useful
- **Mockups or examples** (if applicable)
- **Potential implementation approach** (optional)

### 📝 Contributing Code

#### Good First Issues

Looking for a place to start? Check out issues labeled [`good first issue`](https://github.com/yourusername/ecom-analytics/labels/good%20first%20issue) - these are issues that are suitable for newcomers.

#### Areas We Need Help

- 🔌 **New E-commerce Connectors** (BigCommerce, Magento, etc.)
- 📊 **Dashboard Widgets** (new chart types, metrics)
- 🧪 **Testing** (unit tests, integration tests)
- 📚 **Documentation** (guides, tutorials, API docs)
- 🌐 **Internationalization** (translations)
- ♿ **Accessibility** improvements
- 🎨 **UI/UX** enhancements

---

## Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- Code editor (VS Code recommended)

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/ecom-analytics.git
cd ecom-analytics

# Add upstream remote
git remote add upstream https://github.com/yourusername/ecom-analytics.git
```

### 2. Set Up Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and set required variables
# At minimum, set POSTGRES_PASSWORD and JWT_SECRET
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Start Development Environment

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d
```

**Option B: Manual Setup**

```bash
# Terminal 1: Start PostgreSQL and Redis
# (Follow your OS-specific instructions)

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm start
```

### 5. Verify Setup

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

---

## Pull Request Process

### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clear, readable code
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Test your changes thoroughly

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add shopify order sync functionality"
```

See [Commit Message Guidelines](#commit-message-guidelines) below.

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to the [original repository](https://github.com/yourusername/ecom-analytics)
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template:
   - **Title**: Clear, descriptive title
   - **Description**: What changes you made and why
   - **Related Issues**: Link to related issues (#123)
   - **Testing**: How you tested your changes
   - **Screenshots**: If UI changes

### 6. Code Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, a maintainer will merge your PR

**PR Checklist:**
- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] No merge conflicts
- [ ] PR description is clear and complete

---

## Coding Guidelines

### JavaScript/React Style Guide

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications.

**Key Points:**

1. **Use ES6+ features**
   ```javascript
   // Good
   const fetchData = async () => {
     const result = await api.getData();
     return result;
   };

   // Avoid
   function fetchData() {
     return api.getData().then(function(result) {
       return result;
     });
   }
   ```

2. **Destructuring**
   ```javascript
   // Good
   const { email, password } = req.body;

   // Avoid
   const email = req.body.email;
   const password = req.body.password;
   ```

3. **Arrow Functions**
   ```javascript
   // Good
   const double = (x) => x * 2;

   // Avoid
   function double(x) {
     return x * 2;
   }
   ```

4. **Async/Await over Promises**
   ```javascript
   // Good
   try {
     const data = await fetchData();
     return data;
   } catch (error) {
     console.error(error);
   }

   // Avoid
   fetchData()
     .then(data => data)
     .catch(error => console.error(error));
   ```

### React Component Guidelines

1. **Functional Components with Hooks**
   ```javascript
   // Good
   const Dashboard = () => {
     const [data, setData] = useState([]);

     useEffect(() => {
       fetchDashboardData();
     }, []);

     return <div>...</div>;
   };
   ```

2. **PropTypes or TypeScript**
   - Add prop validation for all components

3. **Component Organization**
   - One component per file
   - Related components in same directory
   - Shared components in `components/common/`

### Backend Guidelines

1. **Separation of Concerns**
   - **Routes**: Define endpoints
   - **Controllers**: Business logic
   - **Models**: Data access
   - **Middleware**: Reusable functions

2. **Error Handling**
   ```javascript
   // Good
   try {
     const result = await query(sql, params);
     res.json(result);
   } catch (error) {
     console.error('Error:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
   ```

3. **Input Validation**
   - Always validate user input
   - Use Joi schemas for validation

4. **Security**
   - Never log sensitive data
   - Use parameterized queries
   - Validate and sanitize all inputs

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(analytics): add customer lifetime value calculation

# Bug fix
fix(auth): resolve JWT token expiration issue

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(dashboard): extract chart component

# Tests
test(analytics): add unit tests for sales controller
```

---

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

1. **Unit Tests** - Test individual functions/components
2. **Integration Tests** - Test API endpoints
3. **E2E Tests** - Test complete user flows (future)

**Example Test:**

```javascript
describe('AnalyticsController', () => {
  describe('getSalesOverview', () => {
    it('should return sales data for valid date range', async () => {
      const req = {
        query: {
          storeId: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await analyticsController.getSalesOverview(req, res);

      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0]).toHaveProperty('dailyStats');
    });
  });
});
```

---

## Documentation Guidelines

### Code Comments

- **Use JSDoc for functions**
  ```javascript
  /**
   * Fetches sales overview data for a store
   * @param {number} storeId - The store ID
   * @param {string} startDate - ISO date string
   * @param {string} endDate - ISO date string
   * @returns {Promise<Object>} Sales overview data
   */
  async getSalesOverview(storeId, startDate, endDate) {
    // Implementation
  }
  ```

- **Inline comments for complex logic**
- **No obvious comments**

### README Updates

- Update README when adding major features
- Include usage examples
- Update configuration section if needed

### API Documentation

- Update Swagger/OpenAPI specs for API changes
- Include request/response examples

---

## Questions?

Don't hesitate to ask questions:

- 💬 [GitHub Discussions](https://github.com/yourusername/ecom-analytics/discussions)
- 📧 Email: support@ecomanalytics.com
- 🐛 [GitHub Issues](https://github.com/yourusername/ecom-analytics/issues)

---

## Recognition

Contributors are recognized in:
- README.md Contributors section
- Release notes
- Project website (coming soon)

Thank you for contributing to EcomAnalytics! 🎉
