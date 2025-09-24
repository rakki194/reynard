#!/bin/bash
# Python 3.15.0a0 Experimental Launcher
# Convenient script to launch Python 3.15 with proper environment setup

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Python 3.15 installation path
PYTHON315_PATH="/home/kade/source/repos/python-dev-install"
PYTHON315_BIN="${PYTHON315_PATH}/bin/python3.15"

# Function to print colored output
print_header() {
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}🐍 PYTHON 3.15.0a0 EXPERIMENTAL LAUNCHER${NC}"
    echo -e "${CYAN}============================================================${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Python 3.15 is available
check_python315() {
    if [[ ! -f "${PYTHON315_BIN}" ]]; then
        print_error "Python 3.15.0a0 not found at ${PYTHON315_BIN}"
        print_info "Please ensure Python 3.15 is compiled and installed"
        exit 1
    fi
    print_success "Python 3.15.0a0 found"
}

# Set up environment
setup_environment() {
    # Set library path for shared libraries
    export LD_LIBRARY_PATH="${PYTHON315_PATH}/lib:${LD_LIBRARY_PATH}"

    # Add Python 3.15 to PATH
    export PATH="${PYTHON315_PATH}/bin:${PATH}"

    # Set Python path for modules
    export PYTHONPATH="${PYTHON315_PATH}/lib/python3.15/site-packages:${PYTHONPATH}"

    print_success "Environment configured"
    print_info "LD_LIBRARY_PATH: ${LD_LIBRARY_PATH}"
    print_info "PATH: ${PATH}"
}

# Show Python 3.15 information
show_python_info() {
    echo
    print_info "Python 3.15.0a0 Information:"
    ${PYTHON315_BIN} --version
    ${PYTHON315_BIN} -c "import sys; print(f'Executable: {sys.executable}')"
    ${PYTHON315_BIN} -c "import sys; print(f'Version info: {sys.version_info}')"
    echo
}

# Launch Python 3.15 with different modes
launch_interactive() {
    print_info "Launching Python 3.15.0a0 interactive shell..."
    echo
    ${PYTHON315_BIN} -i
}

launch_script() {
    local script="$1"
    if [[ -f "${script}" ]]; then
        print_info "Running script: ${script}"
        echo
        ${PYTHON315_BIN} "${script}"
    else
        print_error "Script not found: ${script}"
        exit 1
    fi
}

launch_test_suite() {
    print_info "Running Python 3.15 experimental test suite..."
    echo

    # Run all test files
    for test_file in test_*.py; do
        if [[ -f "${test_file}" ]]; then
            print_info "Running ${test_file}..."
            echo
            ${PYTHON315_BIN} "${test_file}"
            echo
            echo -e "${PURPLE}Press Enter to continue to next test...${NC}"
            read -r
        fi
    done
}

# Show available options
show_help() {
    echo "Usage: $0 [OPTION] [SCRIPT]"
    echo
    echo "Options:"
    echo "  -i, --interactive    Launch interactive Python 3.15 shell"
    echo "  -s, --script SCRIPT  Run a specific Python script"
    echo "  -t, --test           Run all experimental tests"
    echo "  -h, --help           Show this help message"
    echo "  --info               Show Python 3.15 information"
    echo
    echo "Examples:"
    echo "  $0 -i                                    # Interactive shell"
    echo "  $0 -s test_basic_features.py            # Run specific script"
    echo "  $0 -t                                    # Run all tests"
    echo "  $0 --info                               # Show Python info"
    echo
    echo "Available test scripts:"
    for test_file in test_*.py; do
        if [[ -f "${test_file}" ]]; then
            echo "  - ${test_file}"
        fi
    done
}

# Main function
main() {
    print_header

    # Check if Python 3.15 is available
    check_python315

    # Set up environment
    setup_environment

    # Parse arguments
    case "$1" in
        -i|--interactive)
            show_python_info
            launch_interactive
            ;;
        -s|--script)
            if [[ -z "$2" ]]; then
                print_error "No script specified"
                show_help
                exit 1
            fi
            show_python_info
            launch_script "$2"
            ;;
        -t|--test)
            show_python_info
            launch_test_suite
            ;;
        --info)
            show_python_info
            ;;
        -h|--help)
            show_help
            ;;
        "")
            # No arguments - show help
            show_help
            ;;
        *)
            # Try to run as script
            show_python_info
            launch_script "$1"
            ;;
    esac
}

# Run main function
main "$@"
