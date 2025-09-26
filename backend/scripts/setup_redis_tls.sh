#!/bin/bash
# Redis TLS Setup Script for Reynard ECS System
# This script generates TLS certificates for secure Redis communication

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REDIS_TLS_DIR="/etc/redis/tls"
REDIS_USER="redis"
REDIS_GROUP="redis"
CERT_VALIDITY_DAYS=365

echo -e "${BLUE}🔐 Setting up Redis TLS certificates...${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Create TLS directory
echo -e "${YELLOW}📁 Creating TLS directory...${NC}"
mkdir -p "$REDIS_TLS_DIR"
chown "$REDIS_USER:$REDIS_GROUP" "$REDIS_TLS_DIR"
chmod 750 "$REDIS_TLS_DIR"

# Generate CA private key
echo -e "${YELLOW}🔑 Generating CA private key...${NC}"
openssl genrsa -out "$REDIS_TLS_DIR/ca.key" 4096
chown "$REDIS_USER:$REDIS_GROUP" "$REDIS_TLS_DIR/ca.key"
chmod 600 "$REDIS_TLS_DIR/ca.key"

# Generate CA certificate
echo -e "${YELLOW}📜 Generating CA certificate...${NC}"
openssl req -new -x509 -days $CERT_VALIDITY_DAYS -key "$REDIS_TLS_DIR/ca.key" \
    -out "$REDIS_TLS_DIR/ca.crt" \
    -subj "/C=US/ST=CA/L=San Francisco/O=Reynard ECS/OU=Development/CN=Redis CA"

chown "$REDIS_USER:$REDIS_GROUP" "$REDIS_TLS_DIR/ca.crt"
chmod 644 "$REDIS_TLS_DIR/ca.crt"

# Generate Redis server private key
echo -e "${YELLOW}🔑 Generating Redis server private key...${NC}"
openssl genrsa -out "$REDIS_TLS_DIR/redis.key" 2048
chown "$REDIS_USER:$REDIS_GROUP" "$REDIS_TLS_DIR/redis.key"
chmod 600 "$REDIS_TLS_DIR/redis.key"

# Generate Redis server certificate signing request
echo -e "${YELLOW}📝 Generating Redis server CSR...${NC}"
openssl req -new -key "$REDIS_TLS_DIR/redis.key" \
    -out "$REDIS_TLS_DIR/redis.csr" \
    -subj "/C=US/ST=CA/L=San Francisco/O=Reynard ECS/OU=Development/CN=localhost"

# Generate Redis server certificate
echo -e "${YELLOW}📜 Generating Redis server certificate...${NC}"
openssl x509 -req -in "$REDIS_TLS_DIR/redis.csr" \
    -CA "$REDIS_TLS_DIR/ca.crt" \
    -CAkey "$REDIS_TLS_DIR/ca.key" \
    -CAcreateserial \
    -out "$REDIS_TLS_DIR/redis.crt" \
    -days $CERT_VALIDITY_DAYS \
    -extensions v3_req \
    -extfile <(cat <<EOF
[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = redis
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
)

chown "$REDIS_USER:$REDIS_GROUP" "$REDIS_TLS_DIR/redis.crt"
chmod 644 "$REDIS_TLS_DIR/redis.crt"

# Clean up CSR file
rm "$REDIS_TLS_DIR/redis.csr"

# Generate client certificate for testing
echo -e "${YELLOW}🔑 Generating client certificate...${NC}"
openssl genrsa -out "$REDIS_TLS_DIR/client.key" 2048
chown "$REDIS_USER:$REDIS_GROUP" "$REDIS_TLS_DIR/client.key"
chmod 600 "$REDIS_TLS_DIR/client.key"

openssl req -new -key "$REDIS_TLS_DIR/client.key" \
    -out "$REDIS_TLS_DIR/client.csr" \
    -subj "/C=US/ST=CA/L=San Francisco/O=Reynard ECS/OU=Development/CN=redis-client"

openssl x509 -req -in "$REDIS_TLS_DIR/client.csr" \
    -CA "$REDIS_TLS_DIR/ca.crt" \
    -CAkey "$REDIS_TLS_DIR/ca.key" \
    -CAcreateserial \
    -out "$REDIS_TLS_DIR/client.crt" \
    -days $CERT_VALIDITY_DAYS

chown "$REDIS_USER:$REDIS_GROUP" "$REDIS_TLS_DIR/client.crt"
chmod 644 "$REDIS_TLS_DIR/client.crt"

# Clean up client CSR
rm "$REDIS_TLS_DIR/client.csr"

# Set proper permissions
echo -e "${YELLOW}🔒 Setting proper permissions...${NC}"
chown -R "$REDIS_USER:$REDIS_GROUP" "$REDIS_TLS_DIR"
find "$REDIS_TLS_DIR" -type f -name "*.key" -exec chmod 600 {} \;
find "$REDIS_TLS_DIR" -type f -name "*.crt" -exec chmod 644 {} \;

# Verify certificates
echo -e "${YELLOW}🔍 Verifying certificates...${NC}"
openssl verify -CAfile "$REDIS_TLS_DIR/ca.crt" "$REDIS_TLS_DIR/redis.crt"
openssl verify -CAfile "$REDIS_TLS_DIR/ca.crt" "$REDIS_TLS_DIR/client.crt"

echo -e "${GREEN}✅ Redis TLS setup completed successfully!${NC}"
echo -e "${BLUE}📋 Certificate details:${NC}"
echo -e "   CA Certificate: $REDIS_TLS_DIR/ca.crt"
echo -e "   Server Certificate: $REDIS_TLS_DIR/redis.crt"
echo -e "   Server Private Key: $REDIS_TLS_DIR/redis.key"
echo -e "   Client Certificate: $REDIS_TLS_DIR/client.crt"
echo -e "   Client Private Key: $REDIS_TLS_DIR/client.key"
echo -e ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo -e "   1. Update Redis configuration to use TLS"
echo -e "   2. Restart Redis service"
echo -e "   3. Update application connection strings to use rediss://"
echo -e "   4. Test TLS connection with: redis-cli --tls --cert client.crt --key client.key --cacert ca.crt"
