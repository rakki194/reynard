#!/bin/bash
# Wrapper script to start the MCP server with proper environment

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Activate virtual environment
# shellcheck source=/home/kade/venv/bin/activate
source ~/venv/bin/activate

# Change to the correct directory
cd "$PROJECT_ROOT/services/mcp-server" || exit

# Start the MCP server with banner
exec python3 main.py --banner
