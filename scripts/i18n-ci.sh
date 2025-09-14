#!/bin/bash
# i18n CI Testing Script for Reynard
# Comprehensive hardcoded string detection and i18n validation for CI/CD

set -e

echo "🦊 Reynard i18n CI Testing"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "packages" ]]; then
    print_status "${RED}" "❌ Error: Must be run from Reynard root directory"
    exit 1
fi

# Check if testing package exists
if [[ ! -d "packages/testing" ]]; then
    print_status "${RED}" "❌ Error: packages/testing directory not found"
    exit 1
fi

# Install dependencies if needed
print_status "${BLUE}" "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build testing package
print_status "${BLUE}" "🔨 Building testing package..."
cd packages/testing
pnpm build
cd ../..

# Run i18n validation (non-blocking for initial setup)
print_status "${BLUE}" "🔍 Validating i18n setup..."
cd packages/testing
pnpm i18n:validate || {
    print_status "${YELLOW}" "⚠️  i18n setup validation found issues (this is expected for initial setup)"
    print_status "${YELLOW}" "   Run 'pnpm i18n:setup' to create missing test files"
}
cd ../..

# Run comprehensive i18n tests with CI-specific options
print_status "${BLUE}" "🧪 Running i18n CI tests..."
cd packages/testing
pnpm i18n:ci --fail-on-hardcoded --fail-on-missing --coverage-threshold 80
CI_RESULT=$?
cd ../..

# Check CI results
if [[ "${CI_RESULT}" -eq 0 ]]; then
    print_status "${GREEN}" "✅ All i18n CI checks passed!"
    print_status "${GREEN}" "🎉 No hardcoded strings found!"
    print_status "${GREEN}" "🌍 All translations are complete!"
    print_status "${GREEN}" "🔄 RTL support is properly configured!"
    exit 0
else
    print_status "${RED}" "❌ i18n CI checks failed!"
    print_status "${RED}" "💥 Please fix the issues above before merging."
    exit 1
fi
