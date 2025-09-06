#!/bin/bash

# Nginx Setup Script for Arch Linux
# This script sets up Nginx with Let's Encrypt SSL certificates for the Reynard project

set -e

echo "🦊 Setting up Nginx with Let's Encrypt for Reynard on Arch Linux..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root (use sudo)"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "nginx/reynard.conf" ]; then
    echo "❌ Error: Please run this script from the Reynard project root directory"
    exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
pacman -Syu --noconfirm

# Install Nginx
echo "🌐 Installing Nginx..."
pacman -S --noconfirm nginx

# Install Certbot for Let's Encrypt
echo "🔐 Installing Certbot..."
pacman -S --noconfirm certbot certbot-nginx

# Enable and start Nginx
echo "🚀 Starting Nginx service..."
systemctl enable nginx
systemctl start nginx

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p /usr/share/nginx/html/frontend
mkdir -p /var/log/nginx/reynard

# Copy Nginx configuration
echo "📝 Setting up Nginx configuration..."
cp nginx/reynard.conf /etc/nginx/sites-available/reynard.conf

# Create symlink to enable the site
ln -sf /etc/nginx/sites-available/reynard.conf /etc/nginx/sites-enabled/reynard.conf

# Remove default Nginx site if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "🎉 Nginx setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the domain name in /etc/nginx/sites-available/reynard.conf"
echo "2. Build your frontend and copy it to /usr/share/nginx/html/frontend"
echo "3. Start your FastAPI backend on port 8000"
echo "4. For production with SSL:"
echo "   - Update your domain DNS to point to this server"
echo "   - Run: certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
echo "For development without SSL:"
echo "   - Access your site at http://localhost"
echo "   - Backend API at http://localhost/api/"
echo ""
echo "Nginx status:"
systemctl status nginx --no-pager -l