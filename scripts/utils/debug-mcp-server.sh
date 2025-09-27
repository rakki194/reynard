#!/bin/bash
# Debug wrapper script to start the MCP server with verbose output

echo "Starting MCP server debug mode..." >&2
echo "Current directory: $(pwd)" >&2
echo "Python version: $(python3 --version)" >&2
echo "Virtual env: ${VIRTUAL_ENV}" >&2

# Activate virtual environment
source ~/venv/bin/activate

echo "After venv activation:" >&2
echo "Python version: $(python3 --version)" >&2
echo "Virtual env: ${VIRTUAL_ENV}" >&2

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "${SCRIPT_DIR}")")"

# Change to the correct directory
cd "${PROJECT_ROOT}/services/mcp-server" || exit

echo "Changed to directory: $(pwd)" >&2
echo "Files in directory:" >&2
ls -la >&2

# Start the MCP server
echo "Starting MCP server..." >&2
exec python3 main.py
