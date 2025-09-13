#!/bin/bash
# Wrapper script to run test scripts with correct PYTHONPATH

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set PYTHONPATH to include the app directory
export PYTHONPATH="$SCRIPT_DIR/app:$PYTHONPATH"

# Change to the backend directory
cd "$SCRIPT_DIR"

# Run the script passed as argument
if [ $# -eq 0 ]; then
    echo "Usage: $0 <script_path>"
    echo "Example: $0 tests/test_services/test_nlweb_quick.py"
    exit 1
fi

echo "Running: $1"
echo "PYTHONPATH: $PYTHONPATH"
echo "Working directory: $(pwd)"
echo ""

python "$1"
