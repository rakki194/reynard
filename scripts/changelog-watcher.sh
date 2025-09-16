#!/bin/bash
# 🦊 CHANGELOG.md File Watcher
# ============================
# Strategic fox specialist tool for monitoring CHANGELOG.md changes
# and triggering comprehensive codebase scans.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CHANGELOG_FILE="CHANGELOG.md"
SCAN_SCRIPT="scripts/changelog-scanner.py"
PROJECT_ROOT="/home/kade/runeset/reynard"
DEBOUNCE_DELAY=2  # seconds

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to log success
log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

# Function to log error
log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

# Function to run the codebase scanner
run_scanner() {
    log "🦊 CHANGELOG.md changed - triggering codebase scan..."

    # Change to project root
    cd "${PROJECT_ROOT}" || {
        log_error "Failed to change to project root: ${PROJECT_ROOT}"
        return 1
    }

    # Activate virtual environment and run scanner
    if source ~/venv/bin/activate 2>/dev/null; then
        log "🐍 Virtual environment activated"
        if python3 "${SCAN_SCRIPT}"; then
            log_success "Codebase scan completed successfully"
        else
            log_error "Codebase scan failed"
            return 1
        fi
    else
        log_warning "Virtual environment not found, running without it"
        if python3 "${SCAN_SCRIPT}"; then
            log_success "Codebase scan completed successfully"
        else
            log_error "Codebase scan failed"
            return 1
        fi
    fi
}

# Function to setup file watcher
setup_watcher() {
    log "🦊 Setting up CHANGELOG.md file watcher..."
    log "📁 Watching:${$PROJECT_ROO}T${$CHANGELOG_FIL}E"
    log "🔄 Debounce delay: ${DEBOUNCE_DELAY}s"
    log "🛠️  Scanner script:${$SCAN_SCRIP}T"

    # Check if CHANGELOG.md exists
    if [[ ! -f "${PROJECT_ROOT}/${CHANGELOG_FILE}" ]]; then
        log_warning "CHANGELOG.md not found at ${PROJECT_ROOT}/${CHANGELOG_FILE}"
        log "Creating empty CHANGELOG.md for monitoring..."
        touch "${PROJECT_ROOT}/${CHANGELOG_FILE}"
    fi

    # Check if scanner script exists
    if [[ ! -f "${PROJECT_ROOT}/${SCAN_SCRIPT}" ]]; then
        log_error "Scanner script not found: ${PROJECT_ROOT}/${SCAN_SCRIPT}"
        exit 1
    fi

    log_success "File watcher setup complete"
    log "Press Ctrl+C to stop watching"
    echo ""
}

# Function to handle file changes with debouncing
handle_file_change() {
    local file_path="$1"
    local event="$2"

    # Only process CHANGELOG.md
    if [[ "$(basename "${file_path}")" != "${CHANGELOG_FILE}" ]]; then
        return
    fi

    # Only process modification events
    if [[ "${event}" != "MODIFY" ]]; then
        return
    fi

    log "📝 CHANGELOG.md modified:${$file_pat}h"

    # Debounce: wait for file to stabilize
    sleep "${DEBOUNCE_DELAY}"

    # Check if file still exists and is readable
    if [[ -f "${file_path}" && -r "${file_path}" ]]; then
        run_scanner
    else
        log_warning "CHANGELOG.md is not accessible, skipping scan"
    fi
}

# Main function
main() {
    log "🦊 Reynard CHANGELOG.md Watcher Starting..."
    log "=========================================="

    setup_watcher

    # Use inotifywait to monitor file changes
    if command -v inotifywait >/dev/null 2>&1; then
        log "👀 Using inotifywait for file monitoring"

        # Monitor CHANGELOG.md for modifications
        inotifywait -m -e modify "${PROJECT_ROOT}/${CHANGELOG_FILE}" 2>/dev/null | while read -r directory events filename; do
            handle_file_change "${directory}${filename}" "MODIFY"
        done
    else
        log_error "inotifywait not found. Please install inotify-tools:"
        log "  Ubuntu/Debian: sudo apt-get install inotify-tools"
        log "  CentOS/RHEL: sudo yum install inotify-tools"
        log "  macOS: brew install inotify-tools"
        exit 1
    fi
}

# Handle script interruption
trap 'log "🛑 CHANGELOG.md watcher stopped"; exit 0' INT TERM

# Run main function
main "$@"
