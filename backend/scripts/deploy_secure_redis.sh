#!/bin/bash
# Secure Redis Deployment Script for Reynard ECS System
# This script deploys Redis with TLS encryption and password authentication

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REDIS_USER="redis"
REDIS_GROUP="redis"
REDIS_TLS_DIR="/etc/redis/tls"
REDIS_LOG_DIR="/var/log/redis"
REDIS_DATA_DIR="/var/lib/redis"
REDIS_CONF_DIR="/etc/redis"
# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"

# Get Redis password from environment or .env file
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    REDIS_PASSWORD=$(grep "REDIS_PASSWORD=" "${PROJECT_ROOT}/.env" | cut -d'=' -f2)
else
    echo -e "${RED}❌ .env file not found. Please set REDIS_PASSWORD environment variable.${NC}"
    exit 1
fi

if [[ -z "${REDIS_PASSWORD}" ]]; then
    echo -e "${RED}❌ REDIS_PASSWORD not found in .env file${NC}"
    exit 1
fi

echo -e "${BLUE}🔐 Deploying Secure Redis for Reynard ECS System...${NC}"

# Check if running as root
if [[ ${EUID} -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Step 1: Create Redis user and directories
echo -e "${YELLOW}👤 Setting up Redis user and directories...${NC}"

# Create Redis user if it doesn't exist
if ! id "${REDIS_USER}" &>/dev/null; then
    useradd --system --home-dir /var/lib/redis --shell /bin/false --create-home "${REDIS_USER}"
    echo -e "${GREEN}✅ Created Redis user${NC}"
else
    echo -e "${GREEN}✅ Redis user already exists${NC}"
fi

# Create directories
mkdir -p "${REDIS_TLS_DIR}" "${REDIS_LOG_DIR}" "${REDIS_DATA_DIR}" "${REDIS_CONF_DIR}"
chown -R "${REDIS_USER}:${REDIS_GROUP}" "${REDIS_TLS_DIR}" "${REDIS_LOG_DIR}" "${REDIS_DATA_DIR}"
chmod 750 "${REDIS_TLS_DIR}"
chmod 755 "${REDIS_LOG_DIR}" "${REDIS_DATA_DIR}"

# Step 2: Generate TLS certificates
echo -e "${YELLOW}🔑 Generating TLS certificates...${NC}"
if [[ -f "${PROJECT_ROOT}/scripts/setup_redis_tls.sh" ]]; then
    bash "${PROJECT_ROOT}/scripts/setup_redis_tls.sh"
else
    echo -e "${RED}❌ TLS setup script not found${NC}"
    exit 1
fi

# Step 3: Install Redis configuration
echo -e "${YELLOW}⚙️ Installing Redis configuration...${NC}"
if [[ -f "${PROJECT_ROOT}/redis.conf" ]]; then
    cp "${PROJECT_ROOT}/redis.conf" "${REDIS_CONF_DIR}/redis.conf"
    chown "${REDIS_USER}:${REDIS_GROUP}" "${REDIS_CONF_DIR}/redis.conf"
    chmod 640 "${REDIS_CONF_DIR}/redis.conf"
    echo -e "${GREEN}✅ Redis configuration installed${NC}"
else
    echo -e "${RED}❌ Redis configuration file not found${NC}"
    exit 1
fi

# Step 4: Install systemd service
echo -e "${YELLOW}🔧 Installing systemd service...${NC}"
if [[ -f "${PROJECT_ROOT}/scripts/redis-secure.service.example" ]]; then
    # Create service file from template with actual password
    sed "s/YOUR_SECURE_REDIS_PASSWORD_HERE/${REDIS_PASSWORD}/g" "${PROJECT_ROOT}/scripts/redis-secure.service.example" > "/etc/systemd/system/redis-secure.service"
    systemctl daemon-reload
    systemctl enable redis-secure
    echo -e "${GREEN}✅ Systemd service installed and enabled${NC}"
else
    echo -e "${RED}❌ Systemd service template file not found${NC}"
    exit 1
fi

# Step 5: Configure firewall (if ufw is available)
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    # Allow Redis TLS port
    ufw allow 6380/tcp comment "Redis TLS"
    # Deny Redis non-TLS port
    ufw deny 6379/tcp comment "Redis non-TLS (blocked)"
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️ UFW not available, configure firewall manually${NC}"
fi

# Step 6: Start Redis service
echo -e "${YELLOW}🚀 Starting Redis service...${NC}"
systemctl start redis-secure

# Wait for Redis to start
sleep 3

# Check if Redis is running
if systemctl is-active --quiet redis-secure; then
    echo -e "${GREEN}✅ Redis service started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Redis service${NC}"
    systemctl status redis-secure
    exit 1
fi

# Step 7: Test Redis connection
echo -e "${YELLOW}🧪 Testing Redis connection...${NC}"

# Test TLS connection
if redis-cli --tls --cert "${REDIS_TLS_DIR}/client.crt" --key "${REDIS_TLS_DIR}/client.key" --cacert "${REDIS_TLS_DIR}/ca.crt" -p 6380 ping | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis TLS connection successful${NC}"
else
    echo -e "${RED}❌ Redis TLS connection failed${NC}"
    exit 1
fi

# Test password authentication
if redis-cli --tls --cert "${REDIS_TLS_DIR}/client.crt" --key "${REDIS_TLS_DIR}/client.key" --cacert "${REDIS_TLS_DIR}/ca.crt" -p 6380 -a "dCKIXedFbxi!jaWM15HArAAvHc01XMD!" ping | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis password authentication successful${NC}"
else
    echo -e "${RED}❌ Redis password authentication failed${NC}"
    exit 1
fi

# Step 8: Security verification
echo -e "${YELLOW}🔍 Running security verification...${NC}"

# Check that non-TLS port is not accessible
if ! redis-cli -p 6379 ping &>/dev/null; then
    echo -e "${GREEN}✅ Non-TLS port correctly blocked${NC}"
else
    echo -e "${RED}❌ Non-TLS port is accessible (security issue)${NC}"
fi

# Check Redis configuration
if redis-cli --tls --cert "${REDIS_TLS_DIR}/client.crt" --key "${REDIS_TLS_DIR}/client.key" --cacert "${REDIS_TLS_DIR}/ca.crt" -p 6380 -a "dCKIXedFbxi!jaWM15HArAAvHc01XMD!" config get requirepass | grep -q "dCKIXedFbxi!jaWM15HArAAvHc01XMD!"; then
    echo -e "${GREEN}✅ Password authentication configured${NC}"
else
    echo -e "${RED}❌ Password authentication not configured${NC}"
fi

# Step 9: Create monitoring script
echo -e "${YELLOW}📊 Creating monitoring script...${NC}"

cat > "/usr/local/bin/redis-monitor.sh" << EOF
#!/bin/bash
# Redis Security Monitoring Script

REDIS_TLS_DIR="/etc/redis/tls"
PROJECT_ROOT="${PROJECT_ROOT}"

# Get Redis password from .env file
if [[ -f "\$PROJECT_ROOT/.env" ]]; then
    REDIS_PASSWORD=\$(grep "REDIS_PASSWORD=" "\$PROJECT_ROOT/.env" | cut -d'=' -f2)
else
    echo "❌ .env file not found"
    exit 1
fi

if [[ -z "\$REDIS_PASSWORD" ]]; then
    echo "❌ REDIS_PASSWORD not found in .env file"
    exit 1
fi

echo "🔍 Redis Security Status:"
echo "========================="

# Check service status
if systemctl is-active --quiet redis-secure; then
    echo "✅ Service: Running"
else
    echo "❌ Service: Not running"
fi

# Check TLS connection
if redis-cli --tls --cert "${REDIS_TLS_DIR}/client.crt" --key "${REDIS_TLS_DIR}/client.key" --cacert "${REDIS_TLS_DIR}/ca.crt" -p 6380 ping &>/dev/null; then
    echo "✅ TLS: Working"
else
    echo "❌ TLS: Failed"
fi

# Check password authentication
if redis-cli --tls --cert "${REDIS_TLS_DIR}/client.crt" --key "${REDIS_TLS_DIR}/client.key" --cacert "${REDIS_TLS_DIR}/ca.crt" -p 6380 -a "${REDIS_PASSWORD}" ping &>/dev/null; then
    echo "✅ Authentication: Working"
else
    echo "❌ Authentication: Failed"
fi

# Check non-TLS port is blocked
if ! redis-cli -p 6379 ping &>/dev/null; then
    echo "✅ Non-TLS Port: Blocked (Good)"
else
    echo "❌ Non-TLS Port: Accessible (Security Issue)"
fi

# Show Redis info
echo ""
echo "📊 Redis Information:"
redis-cli --tls --cert "${REDIS_TLS_DIR}/client.crt" --key "${REDIS_TLS_DIR}/client.key" --cacert "${REDIS_TLS_DIR}/ca.crt" -p 6380 -a "${REDIS_PASSWORD}" info server | head -10
EOF

chmod +x "/usr/local/bin/redis-monitor.sh"
echo -e "${GREEN}✅ Monitoring script created${NC}"

# Final status
echo -e "\n${BLUE}🎉 Secure Redis deployment completed successfully!${NC}"
echo -e "${GREEN}📋 Deployment Summary:${NC}"
echo -e "   • Redis user: ${REDIS_USER}"
echo -e "   • TLS certificates: ${REDIS_TLS_DIR}"
echo -e "   • Configuration: ${REDIS_CONF_DIR}/redis.conf"
echo -e "   • Service: redis-secure"
echo -e "   • TLS port: 6380"
echo -e "   • Non-TLS port: 6379 (blocked)"
echo -e "   • Monitoring: /usr/local/bin/redis-monitor.sh"
echo -e ""
echo -e "${YELLOW}⚠️ Important Notes:${NC}"
echo -e "   • Update your application to use rediss://localhost:6380"
echo -e "   • Use the TLS certificates for client connections"
echo -e "   • Monitor Redis with: redis-monitor.sh"
echo -e "   • Check logs with: journalctl -u redis-secure -f"
echo -e ""
echo -e "${BLUE}🔐 Security Features Enabled:${NC}"
echo -e "   ✅ TLS encryption (port 6380)"
echo -e "   ✅ Password authentication"
echo -e "   ✅ Non-TLS port blocked (6379)"
echo -e "   ✅ Systemd security hardening"
echo -e "   ✅ Firewall configuration"
echo -e "   ✅ Certificate-based client authentication"
