#!/bin/bash
# 🦊 CHANGELOG.md File Watcher
# ============================
# Strategic fox specialist tool for monitoring CHANGELOG.md changes
# and triggering markdown linting and formatting.

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CHANGELOG_FILE="CHANGELOG.md"
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

# Function to run markdown linting and formatting
run_markdown_lint() {
    log "🦊 CHANGELOG.md changed - running markdown linting and formatting..."

    # Change to project root
    cd "${PROJECT_ROOT}" || {
        log_error "Failed to change to project root: ${PROJECT_ROOT}"
        return 1
    }

    # Run markdown linting with auto-fix
    log "📝 Running markdownlint with auto-fix..."
    if pnpm run markdown:lint:fix 2>/dev/null; then
        log_success "Markdown linting completed successfully"
    else
        log_warning "Markdown linting had issues, but continuing..."
        log "🦊 This is normal for CHANGELOG.md - some entries are intentionally long"
    fi

    # Run Prettier formatting for markdown
    log "🎨 Running Prettier formatting..."
    if pnpm run format 2>/dev/null; then
        log_success "Prettier formatting completed successfully"
    else
        log_warning "Prettier formatting had issues, but continuing..."
    fi

    # Run line height formatter if available
    if command -v markdownlint >/dev/null 2>&1; then
        log "📏 Running markdownlint directly..."
        if markdownlint --fix "${CHANGELOG_FILE}" 2>/dev/null; then
            log_success "Direct markdownlint completed successfully"
        else
            log_warning "Direct markdownlint had issues, but continuing..."
        fi
    fi

    log_success "CHANGELOG.md processing completed"
}

# Function to setup file watcher
setup_watcher() {
    log "🦊 Setting up CHANGELOG.md file watcher..."
    log "📁 Watching: ${PROJECT_ROOT}/${CHANGELOG_FILE}"
    log "🔄 Debounce delay: ${DEBOUNCE_DELAY}s"
    log "🛠️  Running markdown linting and formatting"

    # Check if CHANGELOG.md exists
    if [[ ! -f "${PROJECT_ROOT}/${CHANGELOG_FILE}" ]]; then
        log_warning "CHANGELOG.md not found at ${PROJECT_ROOT}/${CHANGELOG_FILE}"
        log "Creating empty CHANGELOG.md for monitoring..."
        touch "${PROJECT_ROOT}/${CHANGELOG_FILE}"
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

    log "📝 CHANGELOG.md modified: ${file_path}"

    # Debounce: wait for file to stabilize
    sleep "${DEBOUNCE_DELAY}"

    # Check if file still exists and is readable
    if [[ -f "${file_path}" && -r "${file_path}" ]]; then
        run_markdown_lint
    else
        log_warning "CHANGELOG.md is not accessible, skipping linting"
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
