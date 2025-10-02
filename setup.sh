#!/bin/bash

# setup.sh - EcomAnalytics Setup Script
set -e

echo "🚀 EcomAnalytics Setup Script"
echo "=============================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check Docker
log_info "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

log_success "Docker found!"

# Setup .env
log_info "Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    log_success "Created .env file"
else
    log_info ".env already exists"
fi

# Start services
log_info "Starting services..."
docker-compose up -d

log_success "Services started!"

echo ""
echo "🎉 EcomAnalytics is running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo ""