#!/bin/bash
# Reynard Python Development Setup Script
# Sets up unified Python development environment for the monorepo

set -euo pipefail

echo "🦊 Setting up Reynard Python development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if we're in the monorepo root
if [[ ! -f "pyproject.toml" ]]; then
    print_status $RED "❌ Error: This script must be run from the monorepo root directory"
    exit 1
fi

print_status $BLUE "📋 Installing unified Python development dependencies..."

# Install the monorepo package with all optional dependencies
pip install -e ".[dev,backend,gatekeeper,fenrir,test]"

print_status $GREEN "✅ Dependencies installed successfully!"

print_status $BLUE "🔧 Setting up pre-commit hooks..."
pre-commit install

print_status $GREEN "✅ Pre-commit hooks installed!"

print_status $BLUE "🧪 Running initial linting check..."
echo "Running black formatter..."
black --check .

echo "Running isort import sorting..."
isort --check-only .

echo "Running mypy type checking..."
mypy backend/app libraries/gatekeeper/gatekeeper fenrir

echo "Running ruff linter..."
ruff check .

print_status $GREEN "✅ All linting checks passed!"

print_status $BLUE "🔒 Running security checks..."
bandit -r backend/app libraries/gatekeeper/gatekeeper fenrir
safety check

print_status $GREEN "✅ Security checks passed!"

print_status $YELLOW "🎯 Development environment setup complete!"
print_status $BLUE "📚 Available commands:"
echo "  • black .                    # Format code"
echo "  • isort .                    # Sort imports"
echo "  • mypy .                     # Type checking"
echo "  • ruff check .               # Linting"
echo "  • pytest                     # Run tests"
echo "  • bandit -r .                # Security scanning"
echo "  • safety check               # Dependency vulnerability check"
echo "  • pre-commit run --all-files # Run all pre-commit hooks"

print_status $GREEN "🦊 Ready to code with the cunning of a fox!"
