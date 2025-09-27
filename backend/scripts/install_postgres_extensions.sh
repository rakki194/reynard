#!/bin/bash
# PostgreSQL Extension Installation Script
# This script installs required PostgreSQL extensions with superuser privileges

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"

# Required extensions
EXTENSIONS=(
    "uuid-ossp"
    "vector"
    "pgcrypto"
)

# Databases to install extensions in
DATABASES=(
    "reynard"
    "reynard_ecs"
    "reynard_auth"
    "reynard_keys"
)

echo -e "${BLUE}🔧 Installing PostgreSQL Extensions...${NC}"

# Check if running as root or with sudo
if [[ ${EUID} -ne 0 ]]; then
   echo -e "${YELLOW}⚠️ This script should be run as root or with sudo for best results${NC}"
fi

# Function to install extension in a database
install_extension_in_db() {
    local db_name="$1"
    local extension="$2"
    
    echo -e "${YELLOW}Installing ${extension} in database ${db_name}...${NC}"
    
    # Use PGPASSWORD to avoid password prompts
    export PGPASSWORD="${POSTGRES_PASSWORD}"
    
    if psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${db_name}" -c "CREATE EXTENSION IF NOT EXISTS \"${extension}\";" 2>/dev/null; then
        echo -e "${GREEN}✅ Successfully installed ${extension} in ${db_name}${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to install ${extension} in ${db_name}${NC}"
        return 1
    fi
}

# Function to check if extension is already installed
check_extension() {
    local db_name="$1"
    local extension="$2"
    
    export PGPASSWORD="${POSTGRES_PASSWORD}"
    
    if psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${db_name}" -t -c "SELECT 1 FROM pg_extension WHERE extname = '${extension}';" 2>/dev/null | grep -q "1"; then
        return 0  # Extension exists
    else
        return 1  # Extension doesn't exist
    fi
}

# Main installation loop
total_installations=0
successful_installations=0

for db in "${DATABASES[@]}"; do
    echo -e "\n${BLUE}📊 Processing database: ${db}${NC}"
    
    for ext in "${EXTENSIONS[@]}"; do
        if check_extension "${db}" "${ext}"; then
            echo -e "${GREEN}✅ Extension ${ext} already installed in ${db}${NC}"
        else
            if install_extension_in_db "${db}" "${ext}"; then
                ((successful_installations++))
            fi
            ((total_installations++))
        fi
    done
done

# Summary
echo -e "\n${BLUE}📋 Installation Summary:${NC}"
echo -e "Total attempted installations: ${total_installations}"
echo -e "Successful installations: ${successful_installations}"

if [[ ${successful_installations} -eq ${total_installations} ]]; then
    echo -e "${GREEN}🎉 All extensions installed successfully!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️ Some extensions failed to install. Check the logs above.${NC}"
    exit 1
fi
