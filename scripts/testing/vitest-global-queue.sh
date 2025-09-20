#!/bin/bash

# 🐺> Global Vitest Process Queue Manager
# *alpha wolf coordination* This script ensures only 4 vitest processes
# run concurrently across all agents, creating a disciplined pack formation!

set -euo pipefail

# Configuration
MAX_PROCESSES=4
QUEUE_DIR="/tmp/vitest-global-queue"
PID_FILE="${QUEUE_DIR}/vitest.pids"
LOG_FILE="${QUEUE_DIR}/vitest-queue.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create queue directory if it doesn't exist
mkdir -p "${QUEUE_DIR}"

# Logging function
log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[${timestamp}]${NC} $1" | tee -a "${LOG_FILE}"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "${LOG_FILE}"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "${LOG_FILE}"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "${LOG_FILE}"
}

# Function to get current vitest process count
get_vitest_count() {
    local count
    count=$(pgrep -f "vitest" | wc -l)
    # Don't log here as it interferes with command substitution
    echo "${count}"
}


# Function to wait for available slot
wait_for_slot() {
    local agent_id="${1:-unknown}"
    local timeout="${2:-300}" # 5 minute timeout

    log "Agent ${agent_id} waiting for available vitest slot..."

    local start_time
    start_time=$(date +%s)

    while true; do
        local current_count
        current_count=$(get_vitest_count)

        if [[ "${current_count}" -lt "${MAX_PROCESSES}" ]]; then
            break
        fi

        local current_time
        current_time=$(date +%s)
        local elapsed=$((current_time - start_time))

        if [[ "${elapsed}" -gt "${timeout}" ]]; then
            error "Agent ${agent_id} timed out waiting for vitest slot after ${timeout}s"
            return 1
        fi

        log "Agent ${agent_id} waiting... (${elapsed}s elapsed, ${current_count}/${MAX_PROCESSES} processes running)"

        sleep 5
    done

    success "Agent ${agent_id} acquired vitest slot!"
    return 0
}

# Function to register vitest process
register_process() {
    local agent_id="${1:-unknown}"
    local pid=$$

    local timestamp
    timestamp=$(date)
    echo "${pid}:${agent_id}:${timestamp}" >> "${PID_FILE}"
    log "Agent ${agent_id} registered vitest process (PID: ${pid})"
}

# Function to unregister vitest process
unregister_process() {
    local agent_id="${1:-unknown}"
    local pid=$$

    # Remove this process from the PID file
    sed -i "/^${pid}:/d" "${PID_FILE}" 2>/dev/null || true
    log "Agent ${agent_id} unregistered vitest process (PID: ${pid})"
}

# Function to show queue status
show_status() {
    local count
    local registered_count
    count=$(get_vitest_count)
    registered_count=$(wc -l < "${PID_FILE}" 2>/dev/null || echo "0")

    echo -e "${BLUE}=== Vitest Global Queue Status ===${NC}"
    echo -e "Current vitest processes: ${GREEN}${count}${NC}/${MAX_PROCESSES}"
    echo -e "Registered processes: ${GREEN}${registered_count}${NC}"

    if [[ -f "${PID_FILE}" ]] && [[ -s "${PID_FILE}" ]]; then
        echo -e "\n${YELLOW}Active processes:${NC}"
        while IFS=':' read -r pid agent timestamp; do
            if kill -0 "${pid}" 2>/dev/null; then
                echo -e "  PID ${pid} (Agent: ${agent}, Started: ${timestamp})"
            else
                echo -e "  PID ${pid} (Agent: ${agent}, Started: ${timestamp}) ${RED}[DEAD]${NC}"
            fi
        done < "${PID_FILE}"
    fi

    echo -e "\n${BLUE}Queue directory: ${QUEUE_DIR}${NC}"
    echo -e "${BLUE}Log file: ${LOG_FILE}${NC}"
}

# Function to clean up dead processes
cleanup_dead_processes() {
    if [[ ! -f "${PID_FILE}" ]]; then
        return 0
    fi

    local temp_file
    temp_file=$(mktemp)
    while IFS=':' read -r pid agent timestamp; do
        if kill -0 "${pid}" 2>/dev/null; then
            echo "${pid}:${agent}:${timestamp}" >> "${temp_file}"
        else
            log "Cleaned up dead process PID ${pid} (Agent: ${agent})"
        fi
    done < "${PID_FILE}"

    mv "${temp_file}" "${PID_FILE}"
}

# Function to run vitest with queue management
run_vitest() {
    local agent_id="${1:-unknown}"
    shift # Remove agent_id from arguments

    # Clean up any dead processes first
    cleanup_dead_processes

    # Wait for available slot
    wait_for_slot "${agent_id}"
    local wait_result=$?
    if [[ "${wait_result}" -ne 0 ]]; then
        error "Failed to acquire slot for agent ${agent_id}"
        return 1
    fi

    # Register this process
    register_process "${agent_id}"

    # Set up cleanup trap
    trap 'unregister_process "${agent_id}"' EXIT INT TERM

    # Run vitest with global configuration
    log "Agent ${agent_id} starting vitest with global config..."

    # Set environment variables for global control - FORCE SINGLE PROCESS
    export VITEST_MAX_WORKERS=1
    export VITEST_MAX_FORKS=1
    export VITEST_SINGLE_FORK=true
    export VITEST_FILE_PARALLELISM=false
    export VITEST_GLOBAL_QUEUE=1
    export VITEST_AGENT_ID="${agent_id}"

    # Run vitest with the global config from root directory
    # Change to root directory to ensure proper file resolution
    local root_dir
    root_dir="$(dirname "$0")/../.."
    cd "${root_dir}"

    # Check if vitest.global.config.ts exists
    local current_dir
    current_dir=$(pwd)
    if [[ ! -f "vitest.global.config.ts" ]]; then
        error "vitest.global.config.ts not found in ${current_dir}"
        return 1
    fi

    # Check if pnpm is available
    if ! command -v pnpm >/dev/null 2>&1; then
        error "pnpm command not found in PATH"
        return 1
    fi

    # Check if vitest is available via pnpm
    if ! pnpm exec vitest --version >/dev/null 2>&1; then
        error "vitest not available via pnpm exec"
        return 1
    fi

    # Run vitest with the global config from root directory
    # Use exec to replace the current process, but ensure output goes to terminal
    # The exec will replace this process, so vitest output should appear directly
    exec pnpm exec vitest --config vitest.global.config.ts "$@"
}

# Main script logic
case "${1:-}" in
    "status")
        show_status
        ;;
    "cleanup")
        cleanup_dead_processes
        success "Cleaned up dead processes"
        ;;
    "run")
        if [[ $# -lt 2 ]]; then
            error "Usage: $0 run <agent_id> [vitest_args...]"
            exit 1
        fi
        shift # Remove "run" from arguments
        run_vitest "$@"
        ;;
    *)
        echo -e "${BLUE}Vitest Global Queue Manager${NC}"
        echo ""
        echo "Usage: $0 <command> [args...]"
        echo ""
        echo "Commands:"
        echo "  status                    Show current queue status"
        echo "  cleanup                   Clean up dead processes"
        echo "  run <agent_id> [args...]  Run vitest with queue management"
        echo ""
        echo "Examples:"
        echo "  $0 status"
        echo "  $0 run agent-1 --run"
        echo "  $0 run agent-2 --coverage"
        echo "  $0 run agent-3 test:unit"
        echo ""
        echo "Environment Variables:"
        echo "  VITEST_MAX_WORKERS=1      Limit workers per process"
        echo "  VITEST_MAX_FORKS=1        Limit forks per process"
        echo "  VITEST_SINGLE_FORK=true   Force single fork per agent"
        echo "  VITEST_FILE_PARALLELISM=false  Disable file parallelism"
        echo "  VITEST_GLOBAL_QUEUE=1     Enable global queue mode"
        echo "  VITEST_AGENT_ID           Agent identifier"
        ;;
esac
