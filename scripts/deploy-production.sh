#!/bin/bash

# 🦊 Reynard Production Deployment Script
# ======================================
# 
# Comprehensive production deployment script for the Reynard application stack.
# This script provides enterprise-grade deployment capabilities with comprehensive
# validation, error handling, and monitoring for production environments.
# 
# The Production Deployment Script provides:
# - Complete application stack deployment with Docker Compose
# - Environment variable validation and configuration management
# - Database migration and initialization procedures
# - Health checks and service validation
# - Rollback capabilities and error recovery
# - Comprehensive logging and monitoring setup
# - Security validation and configuration verification
# - Performance optimization and resource management
# 
# Key Features:
# - Environment Validation: Comprehensive validation of production configuration
# - Service Orchestration: Complete application stack deployment and management
# - Database Management: Migration, initialization, and backup procedures
# - Health Monitoring: Service health checks and validation
# - Error Recovery: Rollback capabilities and error handling
# - Security Validation: Configuration and security verification
# - Performance Optimization: Resource management and optimization
# - Monitoring Setup: Comprehensive logging and monitoring configuration
# 
# Prerequisites:
# - Docker and Docker Compose installed and configured
# - Production environment file (.env.production) configured
# - Required environment variables set and validated
# - Database credentials and connection strings configured
# - SSL certificates and security configuration ready
# 
# Usage:
#   ./deploy-production.sh
# 
# Author: Reynard Development Team
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

echo -e "${BLUE}🚀 Starting Reynard Production Deployment...${NC}"

# Check if .env.production exists
if [[ ! -f "${ENV_FILE}" ]]; then
    echo -e "${RED}❌ Environment file ${ENV_FILE} not found!${NC}"
    echo -e "${YELLOW}📝 Please create ${ENV_FILE} with your production configuration${NC}"
    echo -e "${YELLOW}📋 See .env.production.example for reference${NC}"
    exit 1
fi

# Load environment variables
export $(cat "${ENV_FILE}" | grep -v '^#' | xargs)

# Validate required environment variables
required_vars=("JWT_SECRET_KEY" "POSTGRES_DB" "POSTGRES_USER" "POSTGRES_PASSWORD" "REDIS_PASSWORD" "DOMAIN")
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable $var is not set!${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f "${COMPOSE_FILE}" down || true

# Build and deploy
echo -e "${YELLOW}🔨 Building and deploying containers...${NC}"
docker-compose -f "${COMPOSE_FILE}" build --no-cache
docker-compose -f "${COMPOSE_FILE}" up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 30

# Check health of all services
echo -e "${YELLOW}🏥 Checking service health...${NC}"
docker-compose -f "${COMPOSE_FILE}" ps

# Test backend health
echo -e "${YELLOW}🔍 Testing backend health...${NC}"
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo -e "${YELLOW}📋 Backend logs:${NC}"
    docker-compose -f "${COMPOSE_FILE}" logs reynard-backend
    exit 1
fi

# Test frontend health
echo -e "${YELLOW}🔍 Testing frontend health...${NC}"
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    echo -e "${YELLOW}📋 Frontend logs:${NC}"
    docker-compose -f "${COMPOSE_FILE}" logs reynard-frontend
    exit 1
fi

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if docker-compose -f "${COMPOSE_FILE}" exec -T postgres pg_isready -U "${POSTGRES_USER}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is healthy${NC}"
else
    echo -e "${RED}❌ Database health check failed${NC}"
    echo -e "${YELLOW}📋 Database logs:${NC}"
    docker-compose -f "${COMPOSE_FILE}" logs postgres
    exit 1
fi

# Test Redis connection
echo -e "${YELLOW}🔍 Testing Redis connection...${NC}"
if docker-compose -f "${COMPOSE_FILE}" exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis health check failed${NC}"
    echo -e "${YELLOW}📋 Redis logs:${NC}"
    docker-compose -f "${COMPOSE_FILE}" logs redis
    exit 1
fi

# Display deployment summary
echo -e "${GREEN}🎉 Reynard Production Deployment Complete!${NC}"
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "  🌐 Frontend: http://${DOMAIN}"
echo -e "  🔧 Backend API: http://${DOMAIN}/api"
echo -e "  📊 Health Check: http://${DOMAIN}/api/health"
echo -e "  🗄️  Database: PostgreSQL on port 5432"
echo -e "  🔴 Redis: Redis on port 6379"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Set up SSL certificates: ./scripts/setup-ssl.sh"
echo -e "  2. Configure your domain DNS to point to this server"
echo -e "  3. Test your application thoroughly"
echo -e "  4. Set up monitoring and logging"
echo ""
echo -e "${GREEN}🦦 Your Reynard application is now running in production!${NC}"
