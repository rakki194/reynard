#!/bin/bash

# Open Latest Documentation Validation Trace
# Opens the most recent trace file from the documentation validation tests

set -e

echo "🦩 Opening Latest Documentation Validation Trace..."
echo "=================================================="

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Find the most recent trace file
LATEST_TRACE=$(find test-results -name "trace.zip" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)

if [ -z "$LATEST_TRACE" ]; then
    echo "❌ No trace files found. Run the documentation validation tests first:"
    echo "   pnpm run test:documentation"
    exit 1
fi

TRACE_DIR=$(dirname "$LATEST_TRACE")
TRACE_FILE="$LATEST_TRACE"

echo -e "${BLUE}📁 Latest Trace Directory:${NC} $TRACE_DIR"
echo -e "${BLUE}🎬 Video File:${NC} $TRACE_DIR/video.webm"
echo -e "${BLUE}📸 Screenshot:${NC} $TRACE_DIR/test-finished-1.png"
echo -e "${BLUE}📊 Trace File:${NC} $TRACE_FILE"
echo ""

# Check trace file size
TRACE_SIZE=$(du -h "$TRACE_FILE" | cut -f1)
echo -e "${BLUE}📏 Trace File Size:${NC} $TRACE_SIZE"

# Open the trace viewer
echo -e "${GREEN}🚀 Opening Playwright Trace Viewer...${NC}"
pnpm exec playwright show-trace "$TRACE_FILE"

echo ""
echo -e "${GREEN}✅ Trace viewer opened!${NC}"
echo ""
echo "💡 Tips for using the trace viewer:"
echo "   - Use the timeline at the bottom to navigate through the test"
echo "   - Click on actions to see detailed information"
echo "   - Use the network tab to see HTTP requests"
echo "   - Check the console tab for any errors or logs"
echo "   - Use the video player to see the test execution in real-time"
