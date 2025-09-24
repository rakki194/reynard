#!/bin/bash
# Python 3.15.0a0 Debugger Launcher
# Launch Python with debugging enabled

export PYTHONDEBUG=1
export PYTHONDEVMODE=1
export PYTHONHASHSEED=0

# Set library path for Python 3.15
export LD_LIBRARY_PATH="/home/kade/source/repos/python-dev-install/lib:$LD_LIBRARY_PATH"
export PATH="/home/kade/source/repos/python-dev-install/bin:$PATH"

# Launch Python with debugging
exec /home/kade/source/repos/python-dev-install/bin/python3.15 "$@"
