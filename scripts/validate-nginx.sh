#!/bin/bash

# Nginx Configuration Validation Script for Reynard
# Tests all nginx configurations for syntax errors

set -e

echo "🦊 Validating Reynard Nginx configurations..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test nginx config
test_nginx_config() {
    local config_file="$1"
    local config_name="$2"

    echo -n "Testing ${config_name}... "

    if nginx -t -c "${config_file}" 2>/dev/null; then
        echo -e "${GREEN}✅ Valid${NC}"
        return 0
    else
        echo -e "${RED}❌ Invalid${NC}"
        return 1
    fi
}

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx is not installed. Installing nginx for testing...${NC}"
    if command -v pacman &> /dev/null; then
        sudo pacman -S --noconfirm nginx
    elif command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y nginx
    else
        echo -e "${RED}❌ Cannot install nginx automatically. Please install nginx first.${NC}"
        exit 1
    fi
fi

# Test main nginx configuration
echo "📋 Testing main nginx configuration..."
test_nginx_config "nginx/nginx.conf" "Main nginx.conf"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Main configuration is valid${NC}"
else
    echo -e "${RED}❌ Main configuration has errors${NC}"
    exit 1
fi

# Test development configuration
echo ""
echo "🔧 Testing development configuration..."
test_nginx_config "nginx/dev/reynard-dev.conf" "Development config"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Development configuration is valid${NC}"
else
    echo -e "${RED}❌ Development configuration has errors${NC}"
    exit 1
fi

# Test production configurations
echo ""
echo "🚀 Testing production configurations..."

# Test full production config
test_nginx_config "nginx/prod/reynard-prod.conf" "Full production config"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Full production configuration is valid${NC}"
else
    echo -e "${RED}❌ Full production configuration has errors${NC}"
    exit 1
fi

# Test frontend-only config
test_nginx_config "nginx/prod/frontend-only.conf" "Frontend-only config"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend-only configuration is valid${NC}"
else
    echo -e "${RED}❌ Frontend-only configuration has errors${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All nginx configurations are valid!${NC}"
echo ""
echo "📋 Configuration Summary:"
echo "  • Main config: nginx/nginx.conf"
echo "  • Development: nginx/dev/reynard-dev.conf"
echo "  • Production: nginx/prod/reynard-prod.conf"
echo "  • Frontend-only: nginx/prod/frontend-only.conf"
echo ""
echo "🚀 Ready for deployment!"
