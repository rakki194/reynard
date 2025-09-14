#!/bin/bash

# NLWeb Test Runner for Reynard Backend
# 🦦> Comprehensive testing with otter-like thoroughness!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
COVERAGE=false
VERBOSE=false
PARALLEL=false
REPORT_FORMAT="term"
CLEANUP=true
OLLAMA_URL="http://localhost:11434"

# Function to print colored output
print_status() {
    echo -e "${BLUE}🦦>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ️${NC} $1"
}

# Function to show usage
show_usage() {
    echo "NLWeb Test Runner for Reynard Backend"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --type TYPE        Test type: all, api, integration, service, performance (default: all)"
    echo "  -c, --coverage         Enable coverage reporting"
    echo "  --no-coverage          Disable coverage reporting"
    echo "  -v, --verbose          Verbose output"
    echo "  -p, --parallel         Run tests in parallel"
    echo "  -r, --report FORMAT    Report format: term, html, xml (default: term)"
    echo "  --no-cleanup           Don't cleanup test artifacts"
    echo "  --ollama-url URL       Ollama server URL (default: http://localhost:11434)"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Test Types:"
    echo "  all         Run all NLWeb tests"
    echo "  api         Test NLWeb API endpoints"
    echo "  integration Test NLWeb + Ollama integration and full app integration"
    echo "  service     Test NLWeb service layer"
    echo "  performance Test NLWeb performance characteristics"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run all tests"
    echo "  $0 -t api -c -v                      # Run API tests with coverage and verbose output"
    echo "  $0 -t integration -p                 # Run integration tests in parallel"
    echo "  $0 -t performance --ollama-url http://localhost:11435  # Run performance tests with custom Ollama URL"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        --no-coverage)
            COVERAGE=false
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -p|--parallel)
            PARALLEL=true
            shift
            ;;
        -r|--report)
            REPORT_FORMAT="$2"
            shift 2
            ;;
        --no-cleanup)
            CLEANUP=false
            shift
            ;;
        --ollama-url)
            OLLAMA_URL="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate test type
case $TEST_TYPE in
    all|api|integration|service|performance)
        ;;
    *)
        print_error "Invalid test type: $TEST_TYPE"
        show_usage
        exit 1
        ;;
esac

# Validate report format
case $REPORT_FORMAT in
    html|xml|term)
        ;;
    *)
        print_error "Invalid report format: $REPORT_FORMAT"
        show_usage
        exit 1
        ;;
esac

print_status "Starting NLWeb Test Suite for Reynard Backend"
print_info "Test Type: $TEST_TYPE"
print_info "Coverage: $COVERAGE"
print_info "Verbose: $VERBOSE"
print_info "Parallel: $PARALLEL"
print_info "Report Format: $REPORT_FORMAT"
print_info "Ollama URL: $OLLAMA_URL"

# Check if we're in the right directory
if [[ ! -f "main.py" ]]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

# Check if virtual environment exists
if [[ ! -d "$HOME/venv" ]]; then
    print_warning "Virtual environment not found at $HOME/venv. Creating one..."
    python -m venv "$HOME/venv"
fi

# Activate virtual environment and install dependencies
print_status "Activating virtual environment and installing dependencies..."
bash -c "source $HOME/venv/bin/activate && pip install -q -r requirements.txt && pip install -q -r requirements.dev.txt && pip install -q -e . --no-deps"

# Clean up previous test artifacts
if [[ "$CLEANUP" == "true" ]]; then
    print_status "Cleaning up previous test artifacts..."
    rm -rf htmlcov/
    rm -f .coverage
    rm -f coverage.xml
    rm -rf .pytest_cache/
    rm -rf __pycache__/
    find . -name "*.pyc" -delete
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
fi

# Check Ollama availability for integration tests
if [[ "$TEST_TYPE" == "integration" || "$TEST_TYPE" == "all" ]]; then
    print_status "Checking Ollama availability..."
    if curl -s "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
        print_success "Ollama is available at $OLLAMA_URL"
    else
        print_warning "Ollama is not available at $OLLAMA_URL"
        print_warning "Integration tests may fail or be skipped"
    fi
fi

# Set environment variables
export OLLAMA_BASE_URL="$OLLAMA_URL"
export TESTING_MODE="true"
export LOG_LEVEL="warning"  # Reduce log noise during tests

# Build pytest command
PYTEST_CMD="pytest"

# Add test path based on type
case $TEST_TYPE in
    api)
        PYTEST_CMD="$PYTEST_CMD tests/test_api/test_nlweb_endpoints.py"
        ;;
    integration)
        PYTEST_CMD="$PYTEST_CMD tests/test_integration/test_nlweb_ollama_integration.py tests/test_integration/test_nlweb_full_integration.py tests/test_integration/test_nlweb_elaborate_tool_calls.py"
        ;;
    service)
        PYTEST_CMD="$PYTEST_CMD tests/test_services/test_nlweb_service.py"
        ;;
    performance)
        PYTEST_CMD="$PYTEST_CMD tests/test_performance/test_nlweb_performance.py"
        ;;
    all)
        PYTEST_CMD="$PYTEST_CMD tests/test_api/test_nlweb_endpoints.py tests/test_integration/test_nlweb_ollama_integration.py tests/test_integration/test_nlweb_full_integration.py tests/test_integration/test_nlweb_elaborate_tool_calls.py tests/test_services/test_nlweb_service.py tests/test_performance/test_nlweb_performance.py"
        ;;
esac

# Add coverage options
if [[ "$COVERAGE" == "true" ]]; then
    PYTEST_CMD="$PYTEST_CMD --cov=app.services.nlweb --cov=app.api.nlweb --cov-report=term-missing"
    
    case $REPORT_FORMAT in
        html)
            PYTEST_CMD="$PYTEST_CMD --cov-report=html:htmlcov"
            ;;
        xml)
            PYTEST_CMD="$PYTEST_CMD --cov-report=xml:coverage.xml"
            ;;
    esac
fi

# Add parallel execution
if [[ "$PARALLEL" == "true" ]]; then
    PYTEST_CMD="$PYTEST_CMD -n auto"
fi

# Add verbose output
if [[ "$VERBOSE" == "true" ]]; then
    PYTEST_CMD="$PYTEST_CMD -v -s"
fi

# Add other options
PYTEST_CMD="$PYTEST_CMD --tb=short --strict-markers --asyncio-mode=auto"

# Run tests
print_status "Running NLWeb tests..."
print_info "Command: $PYTEST_CMD"

# Execute the test command with proper venv activation
if bash -c "source $HOME/venv/bin/activate && $PYTEST_CMD"; then
    print_success "All NLWeb tests passed! 🎉"
    
    if [[ "$COVERAGE" == "true" && "$REPORT_FORMAT" == "html" ]]; then
        print_info "Coverage report generated in htmlcov/index.html"
    fi
    
    if [[ "$COVERAGE" == "true" && "$REPORT_FORMAT" == "xml" ]]; then
        print_info "Coverage report generated in coverage.xml"
    fi
    
    exit 0
else
    print_error "Some NLWeb tests failed! 💥"
    exit 1
fi
