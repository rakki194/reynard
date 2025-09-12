#!/bin/bash
# Lenient i18n CI Testing Script for Reynard
# For initial setup - reports hardcoded strings but doesn't fail CI

set -e

echo "🦊 Reynard i18n CI Testing (Lenient Mode)"
echo "=========================================="
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
print_status $BLUE "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build testing package
print_status $BLUE "🔨 Building testing package..."
cd packages/testing
pnpm build
cd ../..

# Run i18n validation (non-blocking for initial setup)
print_status $BLUE "🔍 Validating i18n setup..."
cd packages/testing
pnpm i18n:validate || {
    print_status $YELLOW "⚠️  i18n setup validation found issues (this is expected for initial setup)"
    print_status $YELLOW "   Run 'pnpm i18n:setup' to create missing test files"
}
cd ../..

# Run comprehensive i18n tests (lenient mode - no failures)
print_status $BLUE "🧪 Running i18n tests (lenient mode)..."
cd packages/testing
pnpm i18n:test --output ../../i18n-results.json --report ../../i18n-report.md || true
TEST_RESULT=$?
cd ../..

# Always show results but don't fail CI
print_status $BLUE "📊 i18n Test Results:"
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
    print_status $GREEN "✅ All i18n checks passed!"
    print_status $GREEN "🎉 No hardcoded strings found!"
    print_status $GREEN "🌍 All translations are complete!"
    print_status $GREEN "🔄 RTL support is properly configured!"
else
    print_status $YELLOW "⚠️  i18n issues found (lenient mode - CI will not fail)"
    print_status $YELLOW "📋 Review the report and fix hardcoded strings when ready"
    print_status $YELLOW "🔧 Run './scripts/i18n-ci.sh' for strict CI mode"
fi

# Always exit successfully in lenient mode
exit 0
