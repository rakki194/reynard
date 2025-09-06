#!/bin/bash

# Development setup script for Reynard
# This script sets up the development environment with all necessary components

set -e

echo "🦊 Setting up Reynard development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the Reynard root directory"
    exit 1
fi

print_status "Installing Node.js dependencies..."
npm install

print_status "Installing all package dependencies..."
npm run install:all

print_status "Setting up Python backend environment..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python -m venv venv
    print_success "Created Python virtual environment"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

print_success "Backend dependencies installed"

cd ..

print_status "Setting up environment files..."

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# JWT Configuration
JWT_SECRET_KEY=$(openssl rand -base64 32)
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Environment
ENVIRONMENT=development
DEBUG=true

# Database (for future use)
DATABASE_URL=sqlite:///./reynard.db
EOF
    print_success "Created backend .env file"
fi

# Create frontend .env if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Frontend Environment
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_NAME=Reynard
VITE_APP_VERSION=1.0.0
EOF
    print_success "Created frontend .env file"
fi

print_status "Building packages..."
npm run build:all

print_success "Development environment setup complete!"

echo ""
echo "🦊 Reynard Development Environment Ready!"
echo ""
echo "📋 Available commands:"
echo ""
echo "🚀 Start development servers:"
echo "   npm run dev:backend    # Start backend API server"
echo "   npm run dev:frontend   # Start frontend dev server"
echo "   npm run dev            # Start both servers"
echo ""
echo "🐳 Docker development:"
echo "   docker-compose -f docker-compose.dev.yml up"
echo ""
echo "🔧 Testing:"
echo "   npm test               # Run all tests"
echo "   npm run test:security  # Run security tests"
echo "   npm run test:backend   # Run backend tests"
echo ""
echo "🏗️ Building:"
echo "   npm run build          # Build all packages"
echo "   npm run build:backend  # Build backend only"
echo ""
echo "🔐 Default credentials:"
echo "   - Admin: admin / admin123"
echo "   - User: user / user123"
echo ""
echo "🌐 Access points:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Next steps:"
echo "1. Run 'npm run dev' to start both servers"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Check http://localhost:8000/docs for API documentation"
echo ""
