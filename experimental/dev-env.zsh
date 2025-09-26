#!/usr/bin/env zsh
# CPython Development Environment Setup
# This script sets up a zsh environment for CPython development
# Usage: source ./experimental/dev-env.zsh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-${(%):-%x}}")" && pwd)"
PYTHON_DEV_ROOT="/home/kade/source/repos/python-dev-install"

echo -e "${BLUE}🦊 Setting up CPython development environment...${NC}"

# Set CPython installation paths
export PYTHON_DEV_INSTALL="$PYTHON_DEV_ROOT"
export PYTHON_DEV_BIN="$PYTHON_DEV_INSTALL/bin"
export PYTHON_DEV_LIB="$PYTHON_DEV_INSTALL/lib"
export PYTHON_DEV_INCLUDE="$PYTHON_DEV_INSTALL/include"
export PYTHON_DEV_SHARE="$PYTHON_DEV_INSTALL/share"

# Add CPython binaries to PATH (prepend to ensure they take precedence)
export PATH="$PYTHON_DEV_BIN:$PATH"

# Create symlinks to make dev Python the default python/python3 commands
# This ensures that 'python' and 'python3' point to our development installation
if [[ -x "$PYTHON_DEV_BIN/python3.15" ]]; then
    # Create temporary symlinks in a directory we control
    temp_bin_dir="/tmp/python-dev-$$"
    mkdir -p "$temp_bin_dir"

    # Create symlinks for common Python commands
    ln -sf "$PYTHON_DEV_BIN/python3.15" "$temp_bin_dir/python"
    ln -sf "$PYTHON_DEV_BIN/python3.15" "$temp_bin_dir/python3"
    ln -sf "$PYTHON_DEV_BIN/python3.15" "$temp_bin_dir/python3.15"
    ln -sf "$PYTHON_DEV_BIN/pip3" "$temp_bin_dir/pip"
    ln -sf "$PYTHON_DEV_BIN/pip3" "$temp_bin_dir/pip3"
    ln -sf "$PYTHON_DEV_BIN/idle3" "$temp_bin_dir/idle"
    ln -sf "$PYTHON_DEV_BIN/idle3" "$temp_bin_dir/idle3"
    ln -sf "$PYTHON_DEV_BIN/pydoc3" "$temp_bin_dir/pydoc"
    ln -sf "$PYTHON_DEV_BIN/pydoc3" "$temp_bin_dir/pydoc3"

    # Add our temp bin directory to the front of PATH
    export PATH="$temp_bin_dir:$PATH"

    # Store the temp directory for cleanup
    export PYTHON_DEV_TEMP_BIN="$temp_bin_dir"
fi

# Set Python-specific environment variables
export PYTHONHOME="$PYTHON_DEV_INSTALL"
export PYTHONPATH="$PYTHON_DEV_LIB/python3.15:$PYTHON_DEV_LIB/python3.15/site-packages"

# Set library paths for dynamic linking
export LD_LIBRARY_PATH="$PYTHON_DEV_LIB:${LD_LIBRARY_PATH:-}"
export PKG_CONFIG_PATH="$PYTHON_DEV_LIB/pkgconfig:${PKG_CONFIG_PATH:-}"

# Set compiler flags for building extensions
export CPPFLAGS="-I$PYTHON_DEV_INCLUDE/python3.15 ${CPPFLAGS:-}"
export LDFLAGS="-L$PYTHON_DEV_LIB ${LDFLAGS:-}"

# Python development specific settings
export PYTHON_CONFIGURE_OPTS="--enable-shared --enable-optimizations --with-lto"
export PYTHON_CFLAGS="-O3 -g -fPIC"

# Set up aliases for common Python development tasks
alias python-dev="$PYTHON_DEV_BIN/python3"
alias pip-dev="$PYTHON_DEV_BIN/pip3"
alias idle-dev="$PYTHON_DEV_BIN/idle3"
alias pydoc-dev="$PYTHON_DEV_BIN/pydoc3"

# Development workflow aliases
alias py-test="python-dev -m pytest"
alias py-build="python-dev setup.py build_ext --inplace"
alias py-install="python-dev setup.py install --user"
alias py-clean="find . -type f -name '*.pyc' -delete && find . -type d -name '__pycache__' -delete"

# Git workflow for CPython development
alias py-git-status="git status --porcelain"
alias py-git-diff="git diff --name-only"
alias py-git-log="git log --oneline -10"

# Build and test aliases
alias py-configure="./configure --prefix=$PYTHON_DEV_INSTALL $PYTHON_CONFIGURE_OPTS"
alias py-make="make -j$(nproc)"
alias py-make-install="make install"
alias py-test-all="python-dev -m test"
alias py-test-quick="python-dev -m test -x"

# Debugging aliases
alias py-gdb="gdb --args $PYTHON_DEV_BIN/python3"
alias py-valgrind="valgrind --tool=memcheck --leak-check=full $PYTHON_DEV_BIN/python3"
alias py-strace="strace -f $PYTHON_DEV_BIN/python3"

# Environment information functions
py-info() {
    echo -e "${BLUE}🐍 CPython Development Environment Info:${NC}"
    echo -e "  Install Root: ${GREEN}$PYTHON_DEV_INSTALL${NC}"
    echo -e "  Python Binary: ${GREEN}$PYTHON_DEV_BIN/python3${NC}"
    echo -e "  Python Version: ${GREEN}$(python-dev --version)${NC}"
    echo -e "  Default Python: ${GREEN}$(which python)${NC}"
    echo -e "  Default Python3: ${GREEN}$(which python3)${NC}"
    echo -e "  Default Pip: ${GREEN}$(which pip)${NC}"
    echo -e "  Python Path: ${GREEN}$PYTHONPATH${NC}"
    echo -e "  Library Path: ${GREEN}$LD_LIBRARY_PATH${NC}"
    echo -e "  Include Path: ${GREEN}$PYTHON_DEV_INCLUDE${NC}"
    echo -e "  Pkg-Config Path: ${GREEN}$PKG_CONFIG_PATH${NC}"
    if [[ -n "$PYTHON_DEV_TEMP_BIN" ]]; then
        echo -e "  Temp Symlinks: ${GREEN}$PYTHON_DEV_TEMP_BIN${NC}"
    fi
}

py-check() {
    echo -e "${BLUE}🔍 Checking CPython installation...${NC}"

    # Check if Python binary exists and works
    if [[ -x "$PYTHON_DEV_BIN/python3" ]]; then
        echo -e "  Python binary: ${GREEN}✓${NC} $PYTHON_DEV_BIN/python3"
        echo -e "  Version: ${GREEN}$("$PYTHON_DEV_BIN/python3" --version)${NC}"
    else
        echo -e "  Python binary: ${RED}✗${NC} Not found at $PYTHON_DEV_BIN/python3"
    fi

    # Check if shared library exists
    if [[ -f "$PYTHON_DEV_LIB/libpython3.15.so" ]]; then
        echo -e "  Shared library: ${GREEN}✓${NC} $PYTHON_DEV_LIB/libpython3.15.so"
    else
        echo -e "  Shared library: ${RED}✗${NC} Not found at $PYTHON_DEV_LIB/libpython3.15.so"
    fi

    # Check if headers exist
    if [[ -d "$PYTHON_DEV_INCLUDE/python3.15" ]]; then
        echo -e "  Headers: ${GREEN}✓${NC} $PYTHON_DEV_INCLUDE/python3.15"
    else
        echo -e "  Headers: ${RED}✗${NC} Not found at $PYTHON_DEV_INCLUDE/python3.15"
    fi

    # Test Python import
    if python-dev -c "import sys; print('Python path:', sys.executable)" 2>/dev/null; then
        echo -e "  Python import test: ${GREEN}✓${NC}"
    else
        echo -e "  Python import test: ${RED}✗${NC}"
    fi
}

# Function to switch to CPython source directory (if it exists)
py-src() {
    local cpython_src="/home/kade/source/repos/cpython"
    if [[ -d "$cpython_src" ]]; then
        echo -e "${BLUE}📁 Switching to CPython source: $cpython_src${NC}"
        cd "$cpython_src" || return
    else
        echo -e "${YELLOW}⚠️  CPython source directory not found at: $cpython_src${NC}"
        echo -e "   You may need to clone it with: git clone https://github.com/python/cpython.git"
    fi
}

# Function to create a virtual environment using the dev Python
py-venv() {
    local venv_name="${1:-venv}"
    echo -e "${BLUE}🐍 Creating virtual environment: $venv_name${NC}"
    python-dev -m venv "$venv_name"
    echo -e "${GREEN}✓ Virtual environment created. Activate with: source $venv_name/bin/activate${NC}"
}

# Function to install development tools
py-install-dev-tools() {
    echo -e "${BLUE}🛠️  Installing development tools...${NC}"
    pip-dev install --upgrade pip setuptools wheel
    pip-dev install pytest pytest-cov black flake8 mypy
    pip-dev install ipython jupyter notebook
    echo -e "${GREEN}✓ Development tools installed${NC}"
}

# Function to run CPython tests
py-test-cpython() {
    local test_args=("${@:-}")
    echo -e "${BLUE}🧪 Running CPython tests...${NC}"
    local cpython_src="/home/kade/source/repos/cpython"
    if [[ -d "$cpython_src" ]]; then
        cd "$cpython_src" || return
        python-dev -m test "${test_args[@]}"
    else
        echo -e "${RED}✗ CPython source directory not found${NC}"
        echo -e "   Run 'py-src' to navigate to the source directory first"
    fi
}

# Set up completion for our custom functions (if available)
if command -v compdef >/dev/null 2>&1; then
    compdef _py-info py-info
    compdef _py-check py-check
    compdef _py-src py-src
    compdef _py-venv py-venv
    compdef _py-install-dev-tools py-install-dev-tools
    compdef _py-test-cpython py-test-cpython
fi

# Create a function to deactivate the environment
py-deactivate() {
    echo -e "${BLUE}🦊 Deactivating CPython development environment...${NC}"

    # Clean up temporary symlinks
    if [[ -n "${PYTHON_DEV_TEMP_BIN:-}" && -d "$PYTHON_DEV_TEMP_BIN" ]]; then
        rm -rf "$PYTHON_DEV_TEMP_BIN"
        unset PYTHON_DEV_TEMP_BIN
    fi

    # Clean up any leftover temp directories from previous sessions
    rm -rf /tmp/python-dev-* 2>/dev/null || true

    # Remove from PATH - clean up both dev bin and any temp directories
    local new_path
    new_path=$(echo "$PATH" | sed "s|$PYTHON_DEV_BIN:||g")
    # Remove any temp python-dev directories from PATH
    new_path=$(echo "$new_path" | sed "s|/tmp/python-dev-[0-9]*:||g")
    export PATH="$new_path"

    # Unset environment variables
    unset PYTHON_DEV_INSTALL
    unset PYTHON_DEV_BIN
    unset PYTHON_DEV_LIB
    unset PYTHON_DEV_INCLUDE
    unset PYTHON_DEV_SHARE
    unset PYTHON_DEV_TEMP_BIN
    unset PYTHONHOME
    unset PYTHONPATH
    unset LD_LIBRARY_PATH
    unset PKG_CONFIG_PATH
    unset CPPFLAGS
    unset LDFLAGS
    unset PYTHON_CONFIGURE_OPTS
    unset PYTHON_CFLAGS

    # Remove aliases
    unalias python-dev pip-dev idle-dev pydoc-dev 2>/dev/null
    unalias py-test py-build py-install py-clean 2>/dev/null
    unalias py-git-status py-git-diff py-git-log 2>/dev/null
    unalias py-configure py-make py-make-install py-test-all py-test-quick 2>/dev/null
    unalias py-gdb py-valgrind py-strace 2>/dev/null

    echo -e "${GREEN}✓ CPython development environment deactivated${NC}"
}

# Display welcome message
echo -e "${GREEN}✓ CPython development environment activated${NC}"
echo -e "${BLUE}Available commands:${NC}"
echo -e "  ${YELLOW}py-info${NC}          - Show environment information"
echo -e "  ${YELLOW}py-check${NC}         - Check installation status"
echo -e "  ${YELLOW}py-src${NC}           - Navigate to CPython source directory"
echo -e "  ${YELLOW}py-venv [name]${NC}   - Create virtual environment"
echo -e "  ${YELLOW}py-install-dev-tools${NC} - Install development tools"
echo -e "  ${YELLOW}py-test-cpython${NC}  - Run CPython test suite"
echo -e "  ${YELLOW}py-deactivate${NC}    - Deactivate this environment"
echo -e ""
echo -e "Use ${YELLOW}py-info${NC} to see detailed environment information"
