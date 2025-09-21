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
AUTO_CLEANUP_TIMEOUT=15  # seconds
AUTO_CLEANUP_PID_FILE="${QUEUE_DIR}/auto-cleanup.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create queue directory if it doesn't exist
mkdir -p "${QUEUE_DIR}"

# Function to ensure auto-cleanup daemon is running
ensure_auto_cleanup_running() {
    # Only start auto-cleanup for commands that need it
    case "${1:-}" in
        "run"|"cleanup"|"force-cleanup")
            start_auto_cleanup_daemon
            ;;
    esac
}

# Logging function
log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[${timestamp}]${NC} $1"
    echo -e "${BLUE}[${timestamp}]${NC} $1" >> "${LOG_FILE}"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo -e "${RED}[ERROR]${NC} $1" >> "${LOG_FILE}"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo -e "${GREEN}[SUCCESS]${NC} $1" >> "${LOG_FILE}"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo -e "${YELLOW}[WARNING]${NC} $1" >> "${LOG_FILE}"
}

# Function to get current vitest process count
get_vitest_count() {
    local count=0
    
    # Count only processes that are registered in our PID file and still running
    if [[ -f "${PID_FILE}" ]] && [[ -s "${PID_FILE}" ]]; then
        while IFS=':' read -r pid agent timestamp; do
            if kill -0 "${pid}" 2>/dev/null; then
                count=$((count + 1))
            fi
        done < "${PID_FILE}"
    fi
    
    # Don't log here as it interferes with command substitution
    echo "${count}"
}


# Function to wait for available slot
wait_for_slot() {
    local agent_id="${1:-unknown}"
    local timeout="${2:-120}" # 2 minute timeout (reduced from 5 minutes)

    log "Agent ${agent_id} waiting for available vitest slot..."

    local start_time
    start_time=$(date +%s)

    while true; do
        # Clean up dead processes before checking count
        cleanup_dead_processes
        
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
            warning "Forcing cleanup of potentially stuck processes..."
            force_cleanup_stuck_processes
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

    # Show auto-cleanup daemon status
    if [[ -f "${AUTO_CLEANUP_PID_FILE}" ]]; then
        local cleanup_pid
        cleanup_pid=$(cat "${AUTO_CLEANUP_PID_FILE}" 2>/dev/null || echo "")
        if [[ -n "${cleanup_pid}" ]] && kill -0 "${cleanup_pid}" 2>/dev/null; then
            echo -e "Auto-cleanup daemon: ${GREEN}RUNNING${NC} (PID: ${cleanup_pid}, Timeout: ${AUTO_CLEANUP_TIMEOUT}s)"
        else
            echo -e "Auto-cleanup daemon: ${RED}STOPPED${NC}"
        fi
    else
        echo -e "Auto-cleanup daemon: ${RED}STOPPED${NC}"
    fi

    if [[ -f "${PID_FILE}" ]] && [[ -s "${PID_FILE}" ]]; then
        echo -e "\n${YELLOW}Active processes:${NC}"
        while IFS=':' read -r pid agent timestamp; do
            if kill -0 "${pid}" 2>/dev/null; then
                # Calculate runtime
                local start_time
                start_time=$(date -d "${timestamp}" +%s 2>/dev/null || echo "0")
                local current_time
                current_time=$(date +%s)
                local runtime=$((current_time - start_time))
                echo -e "  PID ${pid} (Agent: ${agent}, Started: ${timestamp}, Runtime: ${runtime}s)"
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

# Function to force cleanup of stuck processes
force_cleanup_stuck_processes() {
    warning "Force cleaning up all vitest processes..."
    
    # Kill all vitest processes that might be stuck
    pkill -f "vitest" 2>/dev/null || true
    
    # Clear the PID file
    > "${PID_FILE}"
    
    # Wait a moment for processes to die
    sleep 2
    
    log "Force cleanup completed"
}

# Function to start automatic cleanup daemon
start_auto_cleanup_daemon() {
    # Check if auto-cleanup daemon is already running
    if [[ -f "${AUTO_CLEANUP_PID_FILE}" ]]; then
        local cleanup_pid
        cleanup_pid=$(cat "${AUTO_CLEANUP_PID_FILE}" 2>/dev/null || echo "")
        if [[ -n "${cleanup_pid}" ]] && kill -0 "${cleanup_pid}" 2>/dev/null; then
            log "Auto-cleanup daemon already running (PID: ${cleanup_pid})"
            return 0
        else
            # Remove stale PID file
            rm -f "${AUTO_CLEANUP_PID_FILE}"
        fi
    fi

    log "Starting auto-cleanup daemon with ${AUTO_CLEANUP_TIMEOUT}s timeout..."
    
    # Create a separate script file for the daemon
    local daemon_script="${QUEUE_DIR}/auto-cleanup-daemon.sh"
    cat > "${daemon_script}" << 'EOF'
#!/bin/bash
set -euo pipefail

# Configuration (will be replaced by actual values)
MAX_PROCESSES=4
QUEUE_DIR="/tmp/vitest-global-queue"
PID_FILE="${QUEUE_DIR}/vitest.pids"
LOG_FILE="${QUEUE_DIR}/vitest-queue.log"
AUTO_CLEANUP_TIMEOUT=15

while true; do
    sleep "${AUTO_CLEANUP_TIMEOUT}"
    
    # Check for stuck processes
    if [[ -f "${PID_FILE}" ]] && [[ -s "${PID_FILE}" ]]; then
        stuck_processes=()
        temp_file=$(mktemp)
        
        while IFS=':' read -r pid agent timestamp; do
            if kill -0 "${pid}" 2>/dev/null; then
                # Check if process has been running too long
                start_time=$(date -d "${timestamp}" +%s 2>/dev/null || echo "0")
                current_time=$(date +%s)
                runtime=$((current_time - start_time))
                
                if [[ "${runtime}" -gt "${AUTO_CLEANUP_TIMEOUT}" ]]; then
                    stuck_processes+=("${pid}:${agent}")
                    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] Auto-cleanup: Killing stuck process PID ${pid} (Agent: ${agent}, Runtime: ${runtime}s)" >> "${LOG_FILE}"
                    kill -TERM "${pid}" 2>/dev/null || true
                    sleep 2
                    # Force kill if still running
                    if kill -0 "${pid}" 2>/dev/null; then
                        echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] Auto-cleanup: Force killing stubborn process PID ${pid}" >> "${LOG_FILE}"
                        kill -KILL "${pid}" 2>/dev/null || true
                    fi
                else
                    # Keep the process in the file
                    echo "${pid}:${agent}:${timestamp}" >> "${temp_file}"
                fi
            else
                echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Auto-cleanup: Process PID ${pid} (Agent: ${agent}) already dead, cleaning up" >> "${LOG_FILE}"
            fi
        done < "${PID_FILE}"
        
        # Update PID file
        mv "${temp_file}" "${PID_FILE}"
        
        if [[ ${#stuck_processes[@]} -gt 0 ]]; then
            echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] Auto-cleanup: Cleaned up ${#stuck_processes[@]} stuck processes" >> "${LOG_FILE}"
        fi
    fi
done
EOF
    
    # Make the script executable
    chmod +x "${daemon_script}"
    
    # Start the daemon script in background with proper detachment
    # Use setsid to create a new session and redirect stdin to prevent hanging
    setsid "${daemon_script}" < /dev/null > /dev/null 2>&1 &
    
    local daemon_pid=$!
    # Fully detach the process from the terminal
    disown
    
    echo "${daemon_pid}" > "${AUTO_CLEANUP_PID_FILE}"
    log "Auto-cleanup daemon started (PID: ${daemon_pid})"
}

# Function to stop automatic cleanup daemon
stop_auto_cleanup_daemon() {
    if [[ -f "${AUTO_CLEANUP_PID_FILE}" ]]; then
        local cleanup_pid
        cleanup_pid=$(cat "${AUTO_CLEANUP_PID_FILE}" 2>/dev/null || echo "")
        if [[ -n "${cleanup_pid}" ]] && kill -0 "${cleanup_pid}" 2>/dev/null; then
            log "Stopping auto-cleanup daemon (PID: ${cleanup_pid})"
            kill -TERM "${cleanup_pid}" 2>/dev/null || true
            sleep 1
            if kill -0 "${cleanup_pid}" 2>/dev/null; then
                kill -KILL "${cleanup_pid}" 2>/dev/null || true
            fi
        fi
        rm -f "${AUTO_CLEANUP_PID_FILE}"
        # Clean up the daemon script
        rm -f "${QUEUE_DIR}/auto-cleanup-daemon.sh"
        log "Auto-cleanup daemon stopped"
    else
        log "Auto-cleanup daemon not running"
    fi
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

# Ensure auto-cleanup daemon is running for relevant commands
ensure_auto_cleanup_running "${1:-}"

# Main script logic
case "${1:-}" in
    "status")
        show_status
        exit 0
        ;;
    "cleanup")
        cleanup_dead_processes
        success "Cleaned up dead processes"
        exit 0
        ;;
    "force-cleanup")
        force_cleanup_stuck_processes
        success "Force cleaned up all vitest processes"
        exit 0
        ;;
    "start-auto-cleanup")
        start_auto_cleanup_daemon
        success "Auto-cleanup daemon started"
        exit 0
        ;;
    "stop-auto-cleanup")
        stop_auto_cleanup_daemon
        success "Auto-cleanup daemon stopped"
        exit 0
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
        echo "  force-cleanup             Force cleanup all vitest processes"
        echo "  start-auto-cleanup        Start automatic cleanup daemon"
        echo "  stop-auto-cleanup         Stop automatic cleanup daemon"
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
        echo ""
        echo "Auto-Cleanup:"
        echo "  Auto-cleanup daemon starts automatically for 'run', 'status', 'cleanup' commands"
        echo "  Kills stuck processes after ${AUTO_CLEANUP_TIMEOUT} seconds"
        echo "  Use 'stop-auto-cleanup' to disable, 'start-auto-cleanup' to enable manually"
        ;;
esac
