#!/bin/bash
#
# Test runner script for Reynard Backend
#
# This script provides a comprehensive test runner with various options
# for running different types of tests and generating reports.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
COVERAGE=true
VERBOSE=false
PARALLEL=false
REPORT_FORMAT="html"
CLEANUP=true

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
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --type TYPE        Test type: all, unit, integration, security, api, auth (default: all)"
    echo "  -c, --coverage         Enable coverage reporting (default: true)"
    echo "  -v, --verbose          Verbose output (default: false)"
    echo "  -p, --parallel         Run tests in parallel (default: false)"
    echo "  -r, --report FORMAT    Report format: html, xml, term (default: html)"
    echo "  --no-cleanup           Don't cleanup test artifacts (default: false)"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     # Run all tests with coverage"
    echo "  $0 -t unit             # Run only unit tests"
    echo "  $0 -t security -v      # Run security tests with verbose output"
    echo "  $0 -p -r xml           # Run tests in parallel with XML report"
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
    all|unit|integration|security|api|auth)
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

print_status "Starting Reynard Backend Test Suite"
print_status "Test Type: $TEST_TYPE"
print_status "Coverage: $COVERAGE"
print_status "Verbose: $VERBOSE"
print_status "Parallel: $PARALLEL"
print_status "Report Format: $REPORT_FORMAT"

# Check if we're in the right directory
if [[ ! -f "main.py" ]]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

# Check if virtual environment exists
if [[ ! -d "venv" ]]; then
    print_warning "Virtual environment not found. Creating one..."
    python -m venv venv
fi

# Activate virtual environment and install dependencies
#print_status "Activating virtual environment and installing dependencies..."
#bash -c "source venv/bin/activate && pip install -q -r requirements.txt && pip install -q -r requirements-test.txt"

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

# Build pytest command
PYTEST_CMD="pytest"

# Add test path based on type
case $TEST_TYPE in
    unit)
        PYTEST_CMD="$PYTEST_CMD tests/test_auth/ tests/test_security/test_input_validation.py"
        ;;
    integration)
        PYTEST_CMD="$PYTEST_CMD tests/test_integration/"
        ;;
    security)
        PYTEST_CMD="$PYTEST_CMD tests/test_security/"
        ;;
    api)
        PYTEST_CMD="$PYTEST_CMD tests/test_api/"
        ;;
    auth)
        PYTEST_CMD="$PYTEST_CMD tests/test_auth/"
        ;;
    all)
        PYTEST_CMD="$PYTEST_CMD tests/"
        ;;
esac

# Add coverage options
if [[ "$COVERAGE" == "true" ]]; then
    PYTEST_CMD="$PYTEST_CMD --cov=app --cov-report=term-missing"
    
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
PYTEST_CMD="$PYTEST_CMD --tb=short --strict-markers"

# Run tests
print_status "Running tests..."
print_status "Command: $PYTEST_CMD"

# Execute the test command with proper venv activation
if bash -c "source venv/bin/activate && $PYTEST_CMD"; then
    print_success "All tests passed!"
    
    # Show coverage summary if enabled
    if [[ "$COVERAGE" == "true" ]]; then
        print_status "Coverage report generated"
        if [[ "$REPORT_FORMAT" == "html" ]]; then
            print_status "HTML coverage report available at: htmlcov/index.html"
        fi
    fi
    
    # Show test artifacts
    if [[ "$CLEANUP" == "false" ]]; then
        print_status "Test artifacts preserved"
    fi
    
    exit 0
else
    print_error "Tests failed!"
    exit 1
fi
