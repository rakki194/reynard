#!/bin/bash

# Start Backend Server Script
# This script starts the Python backend server in a way that VS Code can display in a task panel

echo "🦊 Starting Reynard Backend Server..."
echo "=================================="

# Activate virtual environment
VENV_PATH="${HOME}/venv/bin/activate"
if [[ -f "${VENV_PATH}" ]]; then
    # shellcheck source=/dev/null
    source "${VENV_PATH}"
else
    echo "❌ Virtual environment not found at ${VENV_PATH}"
    exit 1
fi

# Change to backend directory
cd backend || exit

# Start the Python server
echo "🐍 Starting Python backend on port 8000..."
python main.py
