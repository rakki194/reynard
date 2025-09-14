#!/bin/bash

# 🐺> Test Script for Single Process Verification
# *alpha wolf testing* This script verifies that each agent truly runs
# only ONE vitest process, not multiple child processes!

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

# Function to show detailed process info
show_vitest_processes() {
    echo -e "${BLUE}=== Current Vitest Processes ===${NC}"
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
    log "Cleaning up test processes..."
    pkill -f "vitest.*test-agent" 2>/dev/null || true
    ./scripts/vitest-global-queue.sh cleanup
    success "Cleanup completed"
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

log "🐺> Testing Single Process Enforcement"
log "This test verifies that each agent runs exactly ONE vitest process"
echo ""

# Source the global environment
source vitest.env.global

# Test 1: Check initial state
log "Test 1: Checking initial process count..."
initial_count=$(count_vitest_processes)
log "Initial vitest processes: ${initial_count}"
show_vitest_processes

# Test 2: Start a single agent and monitor
log "Test 2: Starting single agent and monitoring process count..."
(
    VITEST_AGENT_ID="test-single-agent" \
    ./scripts/vitest-global-queue.sh run "test-single-agent" --run \
    packages/core/src/__tests__/index.test.ts 2>&1 | \
    sed "s/^/[Single-Agent] /"
) &

agent_pid=$!
log "Agent started with PID: ${agent_pid}"

# Monitor process count for 30 seconds
log "Test 3: Monitoring process count for 30 seconds..."
max_processes=0
for i in {1..6}; do
    sleep 5
    current_count=$(count_vitest_processes)
    if [[ "${current_count}" -gt "${max_processes}" ]]; then
        max_processes=${current_count}
    fi
    
    log "Check ${i}/6: ${current_count} vitest processes (max seen: ${max_processes})"
    show_vitest_processes
    
    if [[ "${current_count}" -gt 1 ]]; then
        warning "WARNING: More than 1 vitest process detected!"
    fi
done

# Test 4: Wait for completion
log "Test 4: Waiting for agent to complete..."
wait "${agent_pid}"

# Test 5: Final verification
echo ""
log "Test 5: Final verification..."
final_count=$(count_vitest_processes)
log "Final vitest processes: ${final_count}"

echo ""
if [[ "${max_processes}" -le 1 ]]; then
    success "🐺> SINGLE PROCESS ENFORCEMENT WORKING!"
    log "Maximum processes seen: ${max_processes}"
    log "Each agent is properly limited to 1 vitest process!"
else
    error "🐺> SINGLE PROCESS ENFORCEMENT FAILED!"
    error "Maximum processes seen: ${max_processes}"
    error "Expected maximum: 1"
    error "The global queue system needs further tuning!"
fi

echo ""
log "Process monitoring complete. Check the logs above for details."
