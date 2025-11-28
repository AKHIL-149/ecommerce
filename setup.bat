@echo off
echo ================================
echo E-commerce Setup Script
echo ================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed.
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo [1/5] Docker is running...
echo.

echo [2/5] Starting services with Docker Compose...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start services
    pause
    exit /b 1
)
echo.

echo [3/5] Waiting for database to be ready...
timeout /t 10 /nobreak >nul
echo.

echo [4/5] Running database migrations...
docker-compose exec -T backend npx knex migrate:latest
echo.

echo [5/5] Creating demo user and store...
docker-compose exec -T postgres psql -U postgres -d ecom_analytics -c "INSERT INTO users (email, password_hash, first_name, last_name) VALUES ('demo@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJGvvKdN2', 'Demo', 'User') ON CONFLICT (email) DO NOTHING;"
docker-compose exec -T postgres psql -U postgres -d ecom_analytics -c "INSERT INTO stores (name, domain, platform, settings) VALUES ('Demo Store', 'demo.store', 'standalone', '{\"currency\": \"USD\", \"timezone\": \"UTC\"}') ON CONFLICT DO NOTHING;"
docker-compose exec -T postgres psql -U postgres -d ecom_analytics -c "INSERT INTO user_stores (user_id, store_id, role) SELECT 1, 1, 'owner' WHERE NOT EXISTS (SELECT 1 FROM user_stores WHERE user_id = 1 AND store_id = 1);"
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Frontend: http://localhost:3002
echo Backend:  http://localhost:3001/api
echo.
echo Demo Login:
echo   Email: demo@example.com
echo   Password: password
echo.
echo Or register a new account - your store will be auto-created!
echo.
echo Press any key to exit...
pause >nul
