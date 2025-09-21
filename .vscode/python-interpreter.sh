#!/bin/bash
# 🦊 Reynard Python Interpreter Detection Script
# Automatically detects the best Python interpreter to use

# Check if virtual environment exists
if [[ -f "${HOME}/venv/bin/python" ]]; then
    echo "${HOME}/venv/bin/python"
    exit 0
fi

# Check if virtual environment exists with python3
if [[ -f "${HOME}/venv/bin/python3" ]]; then
    echo "${HOME}/venv/bin/python3"
    exit 0
fi

# Fall back to system python3
if command -v python3 >/dev/null 2>&1; then
    echo "$(which python3)"
    exit 0
fi

# Last resort: system python
if command -v python >/dev/null 2>&1; then
    echo "$(which python)"
    exit 0
fi

# Error if no Python found
echo "Error: No Python interpreter found" >&2
exit 1
