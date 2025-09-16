#!/bin/bash
# 🦊 CHANGELOG.md Scan Trigger
# ============================
# Simple script to trigger codebase scan when CHANGELOG.md is saved

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to log success
log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

# Main function
main() {
    log "🦊 CHANGELOG.md scan triggered!"

    # Change to project root
    cd /home/kade/runeset/reynard || {
        echo "❌ Failed to change to project root"
        exit 1
    }

    # Run the efficient scanner
    if python3 scripts/efficient-changelog-scanner.py; then
        log_success "Codebase scan completed successfully"
    else
        echo "❌ Codebase scan failed"
        exit 1
    fi
}

# Run main function
main "$@"
