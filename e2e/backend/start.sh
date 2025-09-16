#!/bin/bash
# E2E Test Backend Startup Script

set -e

echo "🦦 Starting E2E Test Backend..."

# Change to the e2e backend directory
cd "$(dirname "$0")"

# Start the backend server
echo "🚀 Starting backend server on port 8000..."
python3 main.py
