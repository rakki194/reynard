#!/bin/bash

# Open Documentation Validation Traces
# Opens the Playwright trace viewer for documentation validation tests

set -e

echo "🦩 Opening Documentation Validation Traces..."
echo "=============================================="

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Find the most recent trace files
TRACE_DIR=$(find test-results -name "trace.zip" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2- | xargs dirname)

if [[ -z "${TRACE_DIR}" ]; then
    echo "❌ No trace files found. Run the documentation validation tests first:"
    echo "   pnpm run test:documentation"
    exit 1
fi

echo -e "${BLUE}📁 Trace Directory:${NC} ${TRACE_DIR}"
echo -e "${BLUE}🎬 Video File:${NC} ${TRACE_DIR}/video.webm"
echo -e "${BLUE}📸 Screenshot:${NC} ${TRACE_DIR}/test-finished-1.png"
echo ""

# Open the trace viewer
echo -e "${GREEN}🚀 Opening Playwright Trace Viewer...${NC}"
pnpm exec playwright show-trace "${TRACE_DIR}/trace.zip"

echo ""
echo -e "${GREEN}✅ Trace viewer opened!${NC}"
echo ""
echo "💡 Tips for using the trace viewer:"
echo "   - Use the timeline at the bottom to navigate through the test"
echo "   - Click on actions to see detailed information"
echo "   - Use the network tab to see HTTP requests"
echo "   - Check the console tab for any errors or logs"

