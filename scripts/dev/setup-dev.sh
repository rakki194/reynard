#!/bin/bash

# Reynard Development Environment Setup Script
# This script sets up the development environment for the Reynard project

set -e

echo "🦊 Setting up Reynard development environment..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: Please run this script from the Reynard project root directory"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
pnpm install

# Build all packages
echo "🔨 Building all packages..."
pnpm run build

# Set up Python virtual environment for backend
echo "🐍 Setting up Python virtual environment..."
cd backend

# Create virtual environment if it doesn't exist
if [[ ! -d "venv" ]]; then
    python -m venv venv
fi

# Activate virtual environment
# shellcheck source=venv/bin/activate
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [[ ! -f ".env" ]]; then
    echo "🔐 Creating .env file..."
    cat > .env << EOF
# JWT Secret Key (generate a secure random key)
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))" || echo "fallback-secret-key")

# Database settings (for future use)
DATABASE_URL=sqlite:///./reynard.db

# CORS settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Development settings
DEBUG=True
LOG_LEVEL=info
EOF
    echo "✅ Created .env file with secure JWT secret"
fi

cd ..

# Set up Nginx for development (optional)
echo "🌐 Setting up Nginx configuration..."
if [[ -f "nginx/dev/reynard-dev.conf" ]]; then
    echo "📝 Development Nginx configuration file exists at nginx/dev/reynard-dev.conf"
    echo "   To use it, run: ./scripts/dev/setup-dev-nginx.sh"
    echo "   For development, you can run the backend directly with:"
    echo "   cd backend && source venv/bin/activate && python main.py"
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "To start the development servers:"
echo "1. Backend: cd backend && source venv/bin/activate && python main.py"
echo "2. Frontend: pnpm run dev"
echo ""
echo "The backend will be available at http://localhost:8000"
echo "The frontend will be available at http://localhost:5173"
echo ""
echo "API documentation will be available at http://localhost:8000/api/docs"
