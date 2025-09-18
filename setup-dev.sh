#!/bin/bash
# Enhanced Development Setup Script for Reynard Services
# =====================================================

set -e  # Exit on any error

echo "🦊 Setting up Reynard development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "pyproject.toml" ]]; then
    print_error "Please run this script from the Reynard root directory"
    exit 1
fi

# Check if virtual environment exists
if [[ ! -d "venv" ]]; then
    print_status "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
# shellcheck source=/dev/null
source ~/venv/bin/activate
print_success "Virtual environment activated"

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip
print_success "Pip upgraded"

# Install root dependencies
print_status "Installing root dependencies..."
pip install -e .
print_success "Root dependencies installed"

# Install all services in development mode
print_status "Installing services in development mode..."

services=("agent-naming" "ecs-world" "gatekeeper" "mcp-server")

for service in "${services[@]}"; do
    if [[ -d "services/${service}" ]]; then
        print_status "Installing ${service}..."
        cd "services/${service}"
        pip install -e .
        cd ../..
        print_success "${service} installed"
    else
        print_warning "Service ${service} not found, skipping..."
    fi
done

# Install development dependencies
print_status "Installing development dependencies..."
pip install -e ".[dev]"
print_success "Development dependencies installed"

# Run basic tests
print_status "Running basic tests..."
if python -c "
import sys
try:
    from reynard_agent_naming import AgentNameManager
    print('✅ Agent naming import successful')
except ImportError as e:
    print(f'❌ Agent naming import failed: {e}')
    sys.exit(1)

try:
    from reynard_ecs_world import AgentWorld
    print('✅ ECS world import successful')
except ImportError as e:
    print(f'❌ ECS world import failed: {e}')
    sys.exit(1)

try:
    from reynard_gatekeeper import AuthManager
    print('✅ Gatekeeper import successful')
except ImportError as e:
    print(f'❌ Gatekeeper import failed: {e}')
    sys.exit(1)

print('✅ All basic imports successful!')
"; then
    print_success "All services are properly installed and importable!"
else
    print_error "Some services failed to import. Check the output above."
    exit 1
fi

print_success "🎉 Reynard development environment setup complete!"
print_status "To activate the environment in the future, run: source venv/bin/activate"
print_status "To run the MCP server: cd services/mcp-server && python main.py"
