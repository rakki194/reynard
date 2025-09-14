#!/bin/bash

# 🐺> Test Script for Global Vitest Queue System
# *alpha wolf testing* This script demonstrates the global queue system
# with multiple simulated agents to verify the 4-process limit works!

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    local timestamp
    timestamp=$(date '+%H:%M:%S')
    echo -e "${BLUE}[${timestamp}]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Clean up function
cleanup() {
    log "Cleaning up test processes..."
    pkill -f "vitest.*test-agent" 2>/dev/null || true
    ./scripts/vitest-global-queue.sh cleanup
    success "Cleanup completed"
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

log "🐺> Testing Global Vitest Queue System"
log "This test will simulate 5 agents trying to run vitest simultaneously"
log "Only 4 should be allowed to run at once, with the 5th waiting in queue"
echo ""

# Source the global environment
source vitest.env.global

# Test 1: Check initial status
log "Test 1: Checking initial queue status..."
./scripts/vitest-global-queue.sh status
echo ""

# Test 2: Start 5 agents in background
log "Test 2: Starting 5 test agents simultaneously..."

# Start agents in background
for i in {1..5}; do
    log "Starting agent-${i}..."
    (
        VITEST_AGENT_ID="test-agent-${i}" \
        ./scripts/vitest-global-queue.sh run "test-agent-${i}" --run --reporter=verbose \
        packages/core/src/__tests__/index.test.ts 2>&1 | \
        sed "s/^/[Agent-${i}] /"
    ) &
    sleep 1  # Small delay between starts
done

# Test 3: Monitor queue status
log "Test 3: Monitoring queue status for 30 seconds..."
for i in {1..6}; do
    echo ""
    log "Status check ${i}/6:"
    ./scripts/vitest-global-queue.sh status
    sleep 5
done

# Test 4: Wait for completion
log "Test 4: Waiting for all agents to complete..."
wait

# Test 5: Final status check
echo ""
log "Test 5: Final status check..."
./scripts/vitest-global-queue.sh status

echo ""
success "🐺> Global Vitest Queue System test completed!"
log "If you saw only 4 processes running at any time, the system is working correctly!"
log "The 5th agent should have waited in queue until a slot became available."

