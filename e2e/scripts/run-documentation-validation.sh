#!/bin/bash

# Documentation Validation Test Runner
# Runs comprehensive validation of all code examples in documentation files

set -e

echo "🦩 Starting Documentation Validation Tests..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/results/documentation-validation-results"
CONFIG_FILE="$PROJECT_ROOT/configs/playwright.config.documentation.ts"

# Create results directory
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}📁 Project Root:${NC} $PROJECT_ROOT"
echo -e "${BLUE}📊 Results Directory:${NC} $RESULTS_DIR"
echo -e "${BLUE}⚙️  Config File:${NC} $CONFIG_FILE"
echo ""

# Check if Playwright is installed
if ! command -v playwright &> /dev/null; then
    echo -e "${RED}❌ Playwright not found. Installing...${NC}"
    pnpm exec playwright install
fi

# Check if required dependencies are available
echo -e "${BLUE}🔍 Checking dependencies...${NC}"

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm not found. Please install pnpm first.${NC}"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check for Python (for some examples)
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python3 not found. Some Python examples may fail.${NC}"
fi

# Check for Docker (for Dockerfile examples)
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Dockerfile examples will be syntax-checked only.${NC}"
fi

echo -e "${GREEN}✅ Dependencies check complete${NC}"
echo ""

# Run the documentation validation tests
echo -e "${BLUE}🧪 Running Documentation Validation Tests...${NC}"
echo ""

# Run with different verbosity levels based on environment
if [ "$CI" = "true" ]; then
    # CI mode - minimal output
    pnpm exec playwright test --config="$CONFIG_FILE" --reporter=line
else
    # Local mode - detailed output
    pnpm exec playwright test --config="$CONFIG_FILE" --reporter=list
fi

TEST_EXIT_CODE=$?

echo ""
echo "=============================================="

# Generate summary report
if [ -f "$RESULTS_DIR/results.json" ]; then
    echo -e "${BLUE}📊 Generating Summary Report...${NC}"
    
    # Extract test results using Node.js
    node -e "
        const fs = require('fs');
        const results = JSON.parse(fs.readFileSync('$RESULTS_DIR/results.json', 'utf8'));
        
        const total = results.stats.total;
        const passed = results.stats.expected;
        const failed = results.stats.unexpected;
        const skipped = results.stats.skipped;
        
        console.log('📈 Test Summary:');
        console.log('  Total Tests:', total);
        console.log('  Passed:', passed);
        console.log('  Failed:', failed);
        console.log('  Skipped:', skipped);
        console.log('  Success Rate:', total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%');
        
        if (failed > 0) {
            console.log('');
            console.log('❌ Failed Tests:');
            results.suites.forEach(suite => {
                suite.specs.forEach(spec => {
                    spec.tests.forEach(test => {
                        if (test.results.some(r => r.status === 'failed')) {
                            console.log('  -', spec.title);
                            test.results.forEach(result => {
                                if (result.status === 'failed') {
                                    console.log('    Error:', result.error?.message || 'Unknown error');
                                }
                            });
                        }
                    });
                });
            });
        }
    "
fi

# Show results location
echo ""
echo -e "${BLUE}📁 Results Location:${NC} $RESULTS_DIR"
echo -e "${BLUE}🌐 HTML Report:${NC} file://$RESULTS_DIR/index.html"

# Exit with appropriate code
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Documentation validation tests completed successfully!${NC}"
else
    echo -e "${RED}❌ Documentation validation tests failed!${NC}"
    echo -e "${YELLOW}💡 Check the HTML report for detailed results.${NC}"
fi

exit $TEST_EXIT_CODE

