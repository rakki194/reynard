#!/bin/bash

# SSL Certificate Setup Script for Reynard Production
# This script sets up Let's Encrypt SSL certificates for production deployment

set -e

# Configuration
DOMAIN="${DOMAIN:-your-domain.com}"
EMAIL="${SSL_EMAIL:-admin@your-domain.com}"
STAGING="${STAGING:-true}"

echo "🔐 Setting up SSL certificates for Reynard Production..."
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Staging mode: $STAGING"

# Check if domain is configured
if [ "$DOMAIN" = "your-domain.com" ]; then
    echo "❌ Please set the DOMAIN environment variable to your actual domain"
    echo "Example: export DOMAIN=example.com"
    exit 1
fi

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Create webroot directory
sudo mkdir -p /var/www/certbot

# Obtain SSL certificate
echo "🔑 Obtaining SSL certificate..."
if [ "$STAGING" = "true" ]; then
    echo "🧪 Using Let's Encrypt staging environment (for testing)"
    sudo certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --staging \
        -d $DOMAIN \
        -d www.$DOMAIN
else
    echo "🚀 Using Let's Encrypt production environment"
    sudo certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
fi

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
sudo crontab -l 2>/dev/null | grep -v certbot | sudo crontab -
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Test renewal
echo "🧪 Testing certificate renewal..."
sudo certbot renew --dry-run

echo "✅ SSL certificate setup complete!"
echo "📋 Next steps:"
echo "1. Update your nginx configuration to use the SSL certificates"
echo "2. Uncomment the HTTPS server block in nginx/reynard.production.conf"
echo "3. Restart nginx: sudo systemctl restart nginx"
echo "4. Test your SSL setup: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
