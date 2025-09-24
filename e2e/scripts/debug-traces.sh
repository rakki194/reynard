#!/bin/bash

# Debug Traces Script
# Helps diagnose trace viewer issues

set -e

echo "🔍 Debugging Playwright Traces..."
echo "=================================="

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if test-results directory exists
if [ ! -d "test-results" ]; then
    echo -e "${RED}❌ test-results directory not found. Run tests first:${NC}"
    echo "   pnpm run test:documentation"
    exit 1
fi

echo -e "${BLUE}📁 Test Results Directory:${NC}"
ls -la test-results/

echo ""
echo -e "${BLUE}🔍 Finding Trace Files:${NC}"
find test-results -name "trace.zip" -type f

echo ""
echo -e "${BLUE}📊 Trace File Details:${NC}"
for trace_file in $(find test-results -name "trace.zip" -type f); do
    echo -e "${YELLOW}📄 $trace_file:${NC}"
    echo "   Size: $(du -h "$trace_file" | cut -f1)"
    echo "   Contents:"
    unzip -l "$trace_file" | head -10
    echo ""
done

echo -e "${BLUE}🎬 Video Files:${NC}"
find test-results -name "*.webm" -type f

echo ""
echo -e "${BLUE}📸 Screenshot Files:${NC}"
find test-results -name "*.png" -type f

echo ""
echo -e "${BLUE}🌐 HTML Report Status:${NC}"
if [ -f "results/documentation-validation-results/index.html" ]; then
    echo -e "${GREEN}✅ HTML report exists${NC}"
    echo "   Location: results/documentation-validation-results/index.html"
    echo "   Size: $(du -h results/documentation-validation-results/index.html | cut -f1)"
else
    echo -e "${RED}❌ HTML report not found${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Playwright Version:${NC}"
pnpm exec playwright --version

echo ""
echo -e "${BLUE}💡 Troubleshooting Tips:${NC}"
echo "1. If traces are empty, try running tests with --headed mode:"
echo "   pnpm run test:documentation:headed"
echo ""
echo "2. Check if browser is properly installed:"
echo "   pnpm exec playwright install"
echo ""
echo "3. Try opening trace directly:"
echo "   pnpm exec playwright show-trace test-results/*/trace.zip"
echo ""
echo "4. Check browser console for errors:"
echo "   Open browser dev tools (F12) when viewing the report"
echo ""
echo "5. Try clearing test results and running again:"
echo "   rm -rf test-results results/documentation-validation-results"
echo "   pnpm run test:documentation"

echo ""
echo -e "${GREEN}✅ Debug information collected!${NC}"
