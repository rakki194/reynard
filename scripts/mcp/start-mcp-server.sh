#!/bin/bash
# Wrapper script to start the MCP server with proper environment

# Activate virtual environment
source ~/venv/bin/activate

# Change to the correct directory
cd /home/kade/runeset/reynard/scripts/mcp || exit

# Start the MCP server
exec python3 reynard_mcp.py
