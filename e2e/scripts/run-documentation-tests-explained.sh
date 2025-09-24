#!/bin/bash

# Documentation Validation Test Runner with Explanations
# Explains the difference between headless and headed modes

set -e

echo "🦩 Documentation Validation Test Runner"
echo "======================================"
echo ""

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Available Test Modes:${NC}"
echo ""
echo -e "${GREEN}1. Headless Mode (Recommended):${NC}"
echo "   pnpm run test:documentation"
echo "   - Runs tests in background without opening browser windows"
echo "   - Faster execution, no visual distractions"
echo "   - Perfect for CI/CD and automated testing"
echo "   - Generates traces, screenshots, and videos for later viewing"
echo ""

echo -e "${YELLOW}2. Headed Mode (Debug Only):${NC}"
echo "   pnpm run test:documentation:headed"
echo "   - Opens browser windows during test execution"
echo "   - Useful for debugging test issues"
echo "   - ⚠️  WARNING: Browser windows may appear empty when navigating to file:// URLs"
echo "   - This is normal behavior for documentation validation tests"
echo ""

echo -e "${BLUE}3. Trace Viewer (Best for Analysis):${NC}"
echo "   pnpm run test:documentation:latest-trace"
echo "   - Opens the Playwright trace viewer with rich timeline"
echo "   - Shows all browser actions, screenshots, and videos"
echo "   - Interactive timeline with detailed step-by-step analysis"
echo "   - This is the recommended way to view test execution"
echo ""

echo -e "${BLUE}4. HTML Report:${NC}"
echo "   pnpm run test:documentation:report"
echo "   - Opens the full HTML test report"
echo "   - Shows test results, screenshots, and trace links"
echo ""

echo -e "${RED}🚨 Why Browser Windows Appear Empty:${NC}"
echo ""
echo "The documentation validation tests navigate to local files using file:// URLs."
echo "When running in headed mode, the browser window opens but may appear empty"
echo "because:"
echo "  - Tests navigate to file:///path/to/README.md"
echo "  - No web server is running to serve content"
echo "  - Browser shows the file content but it may not be visible"
echo ""
echo "This is completely normal and expected behavior!"
echo ""

echo -e "${GREEN}💡 Recommendation:${NC}"
echo "Use headless mode for regular testing and the trace viewer for analysis."
echo "Only use headed mode when you need to debug specific browser behavior."
echo ""

# Ask user which mode they want to run
echo -e "${BLUE}Which mode would you like to run?${NC}"
echo "1) Headless (recommended)"
echo "2) Headed (debug mode)"
echo "3) Just show trace viewer"
echo "4) Just show HTML report"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Running tests in headless mode...${NC}"
        pnpm run test:documentation
        echo ""
        echo -e "${BLUE}📊 To view results:${NC}"
        echo "  pnpm run test:documentation:latest-trace"
        echo "  pnpm run test:documentation:report"
        ;;
    2)
        echo -e "${YELLOW}🚀 Running tests in headed mode...${NC}"
        echo -e "${YELLOW}⚠️  Browser windows may appear empty - this is normal!${NC}"
        pnpm run test:documentation:headed
        ;;
    3)
        echo -e "${BLUE}🎬 Opening trace viewer...${NC}"
        pnpm run test:documentation:latest-trace
        ;;
    4)
        echo -e "${BLUE}📊 Opening HTML report...${NC}"
        pnpm run test:documentation:report
        ;;
    5)
        echo -e "${GREEN}👋 Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac
