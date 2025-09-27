#!/bin/bash

# Games Demo E2E Test Runner
# 
# Comprehensive test runner for the Games Demo application with various
# testing modes and configurations.
#
# @author 🦊 The Cunning Fox

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
CONFIG_FILE="configs/playwright.config.games.ts"
HEADED=false
DEBUG=false
UI=false
BROWSER="chromium"
REPORT=false
PERFORMANCE=false
STRESS=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Games Demo E2E Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -c, --config FILE       Use custom config file (default: configs/playwright.config.games.ts)"
    echo "  -b, --browser BROWSER   Run tests on specific browser (chromium, firefox, webkit)"
    echo "  -H, --headed            Run tests in headed mode (visible browser)"
    echo "  -d, --debug             Run tests in debug mode"
    echo "  -u, --ui                Run tests with Playwright UI"
    echo "  -r, --report            Show test report after completion"
    echo "  -p, --performance       Run only performance tests"
    echo "  -s, --stress            Run stress tests"
    echo "  --install               Install Playwright browsers"
    echo "  --clean                 Clean test results and reports"
    echo ""
    echo "Examples:"
    echo "  $0                      # Run all games tests"
    echo "  $0 --headed             # Run tests with visible browser"
    echo "  $0 --browser firefox    # Run tests on Firefox only"
    echo "  $0 --performance        # Run only performance tests"
    echo "  $0 --stress             # Run stress tests"
    echo "  $0 --ui                 # Run tests with Playwright UI"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm first."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the e2e directory."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install browsers
install_browsers() {
    print_status "Installing Playwright browsers..."
    pnpm exec playwright install
    print_success "Browsers installed successfully"
}

# Function to clean test results
clean_results() {
    print_status "Cleaning test results and reports..."
    
    # Remove test results
    if [[ -d "test-results" ]; then
        rm -rf test-results
        print_status "Removed test-results directory"
    fi
    
    # Remove playwright report
    if [[ -d "playwright-report" ]; then
        rm -rf playwright-report
        print_status "Removed playwright-report directory"
    fi
    
    # Remove results directory
    if [[ -d "results" ]; then
        rm -rf results
        print_status "Removed results directory"
    fi
    
    print_success "Cleanup completed"
}

# Function to start games demo server
start_games_demo() {
    print_status "Starting Games Demo server..."
    
    # Check if games demo is already running
    if curl -s http://localhost:3002 > /dev/null 2>&1; then
        print_warning "Games Demo server is already running on port 3002"
        return 0
    fi
    
    # Start the server in background
    cd ../../examples/games-demo
    pnpm dev > /dev/null 2>&1 &
    SERVER_PID=$!
    cd ../../e2e
    
    # Wait for server to start
    print_status "Waiting for Games Demo server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3002 > /dev/null 2>&1; then
            print_success "Games Demo server started successfully"
            return 0
        fi
        sleep 2
    done
    
    print_error "Failed to start Games Demo server"
    kill ${SERVER_PID} 2>/dev/null || true
    exit 1
}

# Function to stop games demo server
stop_games_demo() {
    print_status "Stopping Games Demo server..."
    
    # Kill any process running on port 3002
    if command -v lsof &> /dev/null; then
        PID=$(lsof -ti:3002)
        if [[ ! -z "${PID}" ]; then
            kill ${PID} 2>/dev/null || true
            print_success "Games Demo server stopped"
        fi
    fi
}

# Function to run tests
run_tests() {
    print_status "Running Games Demo E2E tests..."
    
    # Build command
    CMD="pnpm exec playwright test --config=${CONFIG_FILE}"
    
    # Add browser filter if specified
    if [[ "${BROWSER}" != "all" ]; then
        CMD="${CMD} --project=${BROWSER}"
    fi
    
    # Add headed mode
    if [[ "${HEADED}" = true ]; then
        CMD="${CMD} --headed"
    fi
    
    # Add debug mode
    if [[ "${DEBUG}" = true ]; then
        CMD="${CMD} --debug"
    fi
    
    # Add UI mode
    if [[ "${UI}" = true ]; then
        CMD="${CMD} --ui"
    fi
    
    # Add specific test filters
    if [[ "${PERFORMANCE}" = true ]; then
        CMD="${CMD} --grep='Performance'"
    fi
    
    if [[ "${STRESS}" = true ]; then
        CMD="${CMD} --grep='Stress'"
    fi
    
    print_status "Executing: ${CMD}"
    
    # Run the tests
    if eval ${CMD}; then
        print_success "Tests completed successfully"
        
        # Show report if requested
        if [[ "${REPORT}" = true ]; then
            print_status "Opening test report..."
            pnpm exec playwright show-report
        fi
        
        return 0
    else
        print_error "Tests failed"
        return 1
    fi
}

# Function to run specific test suites
run_test_suite() {
    local suite=$1
    print_status "Running $suite test suite..."
    
    case $suite in
        "main")
            pnpm exec playwright test --config=${CONFIG_FILE} suites/games/games-demo.spec.ts
            ;;
        "roguelike")
            pnpm exec playwright test --config=${CONFIG_FILE} suites/games/roguelike-game.spec.ts
            ;;
        "3d-games")
            pnpm exec playwright test --config=${CONFIG_FILE} suites/games/3d-games.spec.ts
            ;;
        "performance")
            pnpm exec playwright test --config=${CONFIG_FILE} suites/games/games-performance.spec.ts
            ;;
        *)
            print_error "Unknown test suite: $suite"
            return 1
            ;;
    esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -H|--headed)
            HEADED=true
            shift
            ;;
        -d|--debug)
            DEBUG=true
            shift
            ;;
        -u|--ui)
            UI=true
            shift
            ;;
        -r|--report)
            REPORT=true
            shift
            ;;
        -p|--performance)
            PERFORMANCE=true
            shift
            ;;
        -s|--stress)
            STRESS=true
            shift
            ;;
        --install)
            check_prerequisites
            install_browsers
            exit 0
            ;;
        --clean)
            clean_results
            exit 0
            ;;
        --suite)
            SUITE="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "🦊 Starting Games Demo E2E Test Runner"
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        pnpm install
    fi
    
    # Start games demo server
    start_games_demo
    
    # Set up cleanup trap
    trap stop_games_demo EXIT
    
    # Run tests
    if [[ ! -z "${SUITE}" ]; then
        run_test_suite "${SUITE}"
    else
        run_tests
    fi
    
    # Stop server
    stop_games_demo
    
    print_success "🎮 Games Demo E2E tests completed!"
}

# Run main function
main "$@"
