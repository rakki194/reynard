#!/bin/bash

# 🐺> Simple Single Process Test
# *alpha wolf testing* Quick test to verify single process enforcement

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

# Function to count vitest processes
count_vitest_processes() {
    pgrep -f "vitest" | wc -l
}

# Function to show vitest processes
show_vitest_processes() {
    echo -e "${BLUE}=== Vitest Processes ===${NC}"
    pgrep -f "vitest" | while read -r pid; do
        if [[ -n "${pid}" ]]; then
            local cmd_output
            cmd_output=$(ps -p "${pid}" -o cmd= 2>/dev/null || echo 'Process not found')
            echo -e "PID: ${GREEN}${pid}${NC} - ${cmd_output}"
        fi
    done
    echo ""
}

# Clean up function
cleanup() {
    log "Cleaning up..."
    pkill -f "vitest.*test-simple" 2>/dev/null || true
    ./scripts/vitest-global-queue.sh cleanup 2>/dev/null || true
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

log "🐺> Simple Single Process Test"
echo ""

# Source the global environment
source vitest.env.global

# Check initial state
initial_count=$(count_vitest_processes)
log "Initial vitest processes: ${initial_count}"
show_vitest_processes

# Start a single agent in background
log "Starting single agent..."
(
    VITEST_AGENT_ID="test-simple-agent" \
    ./scripts/vitest-global-queue.sh run "test-simple-agent" --run \
    packages/core/src/__tests__/index.test.ts 2>&1 | \
    sed "s/^/[Agent] /"
) &

agent_pid=$!
log "Agent started with PID: ${agent_pid}"

# Wait a moment for the agent to start
sleep 3

# Check process count
log "Checking process count after 3 seconds..."
current_count=$(count_vitest_processes)
log "Current vitest processes: ${current_count}"
show_vitest_processes

# Wait for completion
log "Waiting for agent to complete..."
wait "${agent_pid}"

# Final check
final_count=$(count_vitest_processes)
log "Final vitest processes: ${final_count}"
show_vitest_processes

echo ""
if [[ "${current_count}" -le 1 ]]; then
    success "🐺> SINGLE PROCESS ENFORCEMENT WORKING!"
    log "Maximum processes seen: ${current_count}"
else
    error "🐺> SINGLE PROCESS ENFORCEMENT FAILED!"
    error "Maximum processes seen: ${current_count}"
    error "Expected maximum: 1"
fi

echo ""
log "Test complete!"
