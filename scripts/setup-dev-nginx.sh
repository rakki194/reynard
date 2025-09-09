#!/bin/bash

# Development Nginx Setup Script
# This script sets up Nginx for local development without requiring root privileges

set -e

echo "🦊 Setting up Nginx for Reynard development..."

# Check if we're in the right directory
if [ ! -f "nginx/reynard-dev.conf" ]; then
    echo "❌ Error: Please run this script from the Reynard project root directory"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx is not installed. Please install it first:"
    echo "   Arch Linux: sudo pacman -S nginx"
    echo "   Ubuntu/Debian: sudo apt install nginx"
    echo "   macOS: brew install nginx"
    exit 1
fi

# Create development directories
echo "📁 Creating development directories..."
mkdir -p dist/frontend
mkdir -p logs/nginx

# Copy development Nginx configuration
echo "📝 Setting up development Nginx configuration..."
cp nginx/reynard-dev.conf nginx/reynard-dev-local.conf

# Update paths in the configuration for local development
sed -i 's|/usr/share/nginx/html/frontend|./dist/frontend|g' nginx/reynard-dev-local.conf
sed -i 's|/var/log/nginx/reynard|./logs/nginx|g' nginx/reynard-dev-local.conf

echo ""
echo "🎉 Development Nginx setup complete!"
echo ""
echo "To use this configuration:"
echo "1. Build your frontend: pnpm run build"
echo "2. Copy the built files to: ./dist/frontend/"
echo "3. Start your FastAPI backend: cd backend && python main.py"
echo "4. Test the configuration: nginx -t -c $(pwd)/nginx/reynard-dev-local.conf"
echo "5. Start Nginx: nginx -c $(pwd)/nginx/reynard-dev-local.conf"
echo ""
echo "Your site will be available at: http://localhost"
echo "Backend API will be available at: http://localhost/api/"
echo ""
echo "To stop Nginx: nginx -s quit"
echo "To reload configuration: nginx -s reload -c $(pwd)/nginx/reynard-dev-local.conf"
