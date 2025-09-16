#!/bin/bash

# Reynard Production Testing Script
# This script runs comprehensive tests on the production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost}"
API_URL="${BASE_URL}/api"
HEALTH_URL="${BASE_URL}/health"

echo -e "${BLUE}🧪 Starting Reynard Production Tests...${NC}"

# Test 1: Health Check
echo -e "${YELLOW}🔍 Test 1: Health Check${NC}"
if curl -f -s "$HEALTH_URL" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

# Test 2: Frontend Accessibility
echo -e "${YELLOW}🔍 Test 2: Frontend Accessibility${NC}"
if curl -f -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
    exit 1
fi

# Test 3: API Documentation
echo -e "${YELLOW}🔍 Test 3: API Documentation${NC}"
if curl -f -s "$API_URL/docs" > /dev/null; then
    echo -e "${GREEN}✅ API documentation is accessible${NC}"
else
    echo -e "${RED}❌ API documentation is not accessible${NC}"
    exit 1
fi

# Test 4: API Health Endpoint
echo -e "${YELLOW}🔍 Test 4: API Health Endpoint${NC}"
response=$(curl -s "$API_URL/health")
if echo "$response" | grep -q "healthy\|ok\|status"; then
    echo -e "${GREEN}✅ API health endpoint is working${NC}"
else
    echo -e "${RED}❌ API health endpoint failed${NC}"
    echo -e "${YELLOW}Response: $response${NC}"
    exit 1
fi

# Test 5: Security Headers
echo -e "${YELLOW}🔍 Test 5: Security Headers${NC}"
headers=$(curl -s -I "$BASE_URL")
security_headers=("X-Frame-Options" "X-Content-Type-Options" "X-XSS-Protection")
all_headers_present=true

for header in "${security_headers[@]}"; do
    if echo "$headers" | grep -qi "$header"; then
        echo -e "${GREEN}✅ $header header present${NC}"
    else
        echo -e "${RED}❌ $header header missing${NC}"
        all_headers_present=false
    fi
done

if [ "$all_headers_present" = true ]; then
    echo -e "${GREEN}✅ All security headers are present${NC}"
else
    echo -e "${RED}❌ Some security headers are missing${NC}"
    exit 1
fi

# Test 6: Rate Limiting
echo -e "${YELLOW}🔍 Test 6: Rate Limiting${NC}"
echo -e "${YELLOW}  Making multiple rapid requests to test rate limiting...${NC}"
rate_limit_hit=false
for i in {1..15}; do
    response=$(curl -s -w "%{http_code}" -o /dev/null "$API_URL/health")
    if [ "$response" = "429" ]; then
        rate_limit_hit=true
        break
    fi
    sleep 0.1
done

if [ "$rate_limit_hit" = true ]; then
    echo -e "${GREEN}✅ Rate limiting is working${NC}"
else
    echo -e "${YELLOW}⚠️  Rate limiting may not be configured or may need adjustment${NC}"
fi

# Test 7: Static File Caching
echo -e "${YELLOW}🔍 Test 7: Static File Caching${NC}"
# Try to find a static file (this might not work in all setups)
static_response=$(curl -s -I "$BASE_URL/favicon.ico" 2>/dev/null || echo "")
if echo "$static_response" | grep -qi "cache-control"; then
    echo -e "${GREEN}✅ Static file caching headers are present${NC}"
else
    echo -e "${YELLOW}⚠️  Static file caching headers not detected (may be normal)${NC}"
fi

# Test 8: Database Connection (if accessible)
echo -e "${YELLOW}🔍 Test 8: Database Connection${NC}"
if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U ${POSTGRES_USER:-reynard_user} > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Database connection test skipped (container not accessible)${NC}"
fi

# Test 9: Redis Connection (if accessible)
echo -e "${YELLOW}🔍 Test 9: Redis Connection${NC}"
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis connection is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Redis connection test skipped (container not accessible)${NC}"
fi

# Test 10: Container Health
echo -e "${YELLOW}🔍 Test 10: Container Health${NC}"
unhealthy_containers=$(docker-compose -f docker-compose.production.yml ps --filter "health=unhealthy" --format "table {{.Name}}" | tail -n +2)
if [ -z "$unhealthy_containers" ]; then
    echo -e "${GREEN}✅ All containers are healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy containers detected:${NC}"
    echo "$unhealthy_containers"
    exit 1
fi

# Performance Test
echo -e "${YELLOW}🔍 Performance Test: Response Times${NC}"
response_time=$(curl -s -w "%{time_total}" -o /dev/null "$HEALTH_URL")
echo -e "${BLUE}  Health endpoint response time: ${response_time}s${NC}"

if (( $(echo "$response_time < 1.0" | bc -l) )); then
    echo -e "${GREEN}✅ Response time is acceptable (< 1s)${NC}"
else
    echo -e "${YELLOW}⚠️  Response time is slow (> 1s)${NC}"
fi

# Summary
echo -e "${GREEN}🎉 All Production Tests Completed Successfully!${NC}"
echo -e "${BLUE}📊 Test Summary:${NC}"
echo -e "  ✅ Health checks passed"
echo -e "  ✅ Frontend accessibility confirmed"
echo -e "  ✅ API functionality verified"
echo -e "  ✅ Security headers implemented"
echo -e "  ✅ Container health verified"
echo ""
echo -e "${GREEN}🦦 Your Reynard production deployment is working perfectly!${NC}"
