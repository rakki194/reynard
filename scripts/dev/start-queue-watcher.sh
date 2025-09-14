#!/bin/bash

# 🦊 Reynard Queue-Based Watcher Starter
# This script starts the queue-based file watcher

echo "🦊 Starting Reynard Queue-Based Watcher..."
echo "📁 This will watch for file changes and process them in perfect sequence"
echo "🔄 Each file gets its own processing queue to prevent race conditions"
echo "⏹️  Press Ctrl+C to stop the watcher"
echo ""

# Function to start the watcher with auto-restart
start_watcher() {
    while true; do
        echo "🚀 Starting queue-based watcher..."
        node scripts/dev/queue-watcher.js
        exit_code=$?

        if [[ "${exit_code}" -eq 0 ]]; then
            echo "✅ Watcher stopped normally"
            break
        else
            echo "⚠️  Watcher crashed with exit code ${exit_code}, restarting in 2 seconds..."
            sleep 2
        fi
    done
}

# Handle Ctrl+C gracefully
trap 'echo ""; echo "🛑 Stopping queue-based watcher..."; exit 0' INT

# Start the watcher
start_watcher
