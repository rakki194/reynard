#!/bin/bash
# Wrapper script to start the MCP server with proper environment

# Activate virtual environment
# shellcheck source=/home/kade/venv/bin/activate
source ~/venv/bin/activate

# Change to the correct directory
cd /home/kade/runeset/reynard/scripts/mcp || exit

# Start the MCP server with banner
exec python3 main.py --banner
