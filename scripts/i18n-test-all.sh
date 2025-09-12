#!/bin/bash
# i18n Testing Script for All Reynard Packages
# Runs comprehensive i18n tests across all packages

set -e

echo "🦊 Reynard i18n Testing - All Packages"
echo "======================================"
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
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_status $RED "❌ Error: Must be run from Reynard root directory"
    exit 1
fi

# Check if testing package exists
if [ ! -d "packages/testing" ]; then
    print_status $RED "❌ Error: packages/testing directory not found"
    exit 1
fi

# Install dependencies if needed
print_status $BLUE "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_status $YELLOW "Installing dependencies..."
    pnpm install
fi

# Build testing package
print_status $BLUE "🔨 Building testing package..."
cd packages/testing
pnpm build
cd ../..

# Run i18n validation
print_status $BLUE "🔍 Validating i18n setup..."
cd packages/testing
pnpm i18n:validate
if [ $? -ne 0 ]; then
    print_status $RED "❌ i18n setup validation failed"
    exit 1
fi
cd ../..

# Run ESLint with i18n rules
print_status $BLUE "🔍 Running ESLint with i18n rules..."
cd packages/testing
pnpm i18n:eslint
if [ $? -ne 0 ]; then
    print_status $YELLOW "⚠️  ESLint found i18n issues (see output above)"
fi
cd ../..

# Run comprehensive i18n tests
print_status $BLUE "🧪 Running comprehensive i18n tests..."
cd packages/testing
pnpm i18n:test --output ../../i18n-results.json --report ../../i18n-report.md
TEST_RESULT=$?
cd ../..

# Check test results
if [ $TEST_RESULT -eq 0 ]; then
    print_status $GREEN "✅ All i18n tests passed!"
else
    print_status $RED "❌ Some i18n tests failed"
fi

# Display summary
echo ""
print_status $BLUE "📊 Test Results Summary:"
if [ -f "i18n-results.json" ]; then
    # Extract summary from JSON (requires jq)
    if command -v jq &> /dev/null; then
        echo "   Total Packages: $(jq -r '.summary.totalPackages' i18n-results.json)"
        echo "   Successful: $(jq -r '.summary.successfulPackages' i18n-results.json)"
        echo "   Failed: $(jq -r '.summary.failedPackages' i18n-results.json)"
        echo "   Hardcoded Strings: $(jq -r '.summary.totalHardcodedStrings' i18n-results.json)"
        echo "   Missing Translations: $(jq -r '.summary.totalMissingTranslations' i18n-results.json)"
        echo "   RTL Issues: $(jq -r '.summary.totalRTLIssues' i18n-results.json)"
        echo "   Duration: $(jq -r '.summary.duration' i18n-results.json)ms"
    else
        echo "   Results saved to: i18n-results.json"
    fi
fi

if [ -f "i18n-report.md" ]; then
    print_status $BLUE "📄 Detailed report saved to: i18n-report.md"
fi

echo ""
if [ $TEST_RESULT -eq 0 ]; then
    print_status $GREEN "🎉 All i18n checks completed successfully!"
    exit 0
else
    print_status $RED "💥 i18n checks failed. See details above."
    exit 1
fi
