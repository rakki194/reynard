#!/bin/bash
# 🦊 Project Root Utility Tests for Shell Scripts
# ===============================================
#
# Comprehensive tests to ensure the shell project root utility
# behaves consistently with Python and TypeScript versions.
#
# Author: Reynard Development Team
# Version: 1.0.0

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "${BLUE}🧪 Running test: ${test_name}${NC}"
    
    if eval "$test_command" >/dev/null 2>&1; then
        local actual_result
        actual_result=$(eval "$test_command" 2>/dev/null)
        
        if [[ "$actual_result" = "$expected_result" ]; then
            echo -e "  ${GREEN}✅ PASS${NC}: $test_name"
            echo -e "    Expected: $expected_result"
            echo -e "    Got:      $actual_result"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "  ${RED}❌ FAIL${NC}: $test_name"
            echo -e "    Expected: $expected_result"
            echo -e "    Got:      $actual_result"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo -e "  ${RED}❌ FAIL${NC}: $test_name (command failed)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo
}

# Function to test environment variable override
test_env_override() {
    echo -e "${YELLOW}🔧 Testing environment variable override...${NC}"
    
    # Test with custom environment variable
    local custom_root="/tmp/test-reynard-root"
    mkdir -p "$custom_root"
    
    # Set environment variable
    export REYNARD_PROJECT_ROOT="$custom_root"
    
    # Source the project root utility
    source "$(dirname "$0")/project-root.sh"
    
    run_test "Environment variable override" "echo \${PROJECT_ROOT}" "$custom_root"
    
    # Clean up
    unset REYNARD_PROJECT_ROOT
    rm -rf "$custom_root"
}

# Function to test default behavior
test_default_behavior() {
    echo -e "${YELLOW}🔧 Testing default behavior...${NC}"
    
    # Source the project root utility
    source "$(dirname "$0")/project-root.sh"
    
    # Test main project root
    run_test "Default project root" "echo \${PROJECT_ROOT}" "/home/kade/runeset/reynard"
    
    # Test convenience variables
    run_test "Backend directory" "echo \${BACKEND_DIR}" "/home/kade/runeset/reynard/backend"
    run_test "E2E directory" "echo \${E2E_DIR}" "/home/kade/runeset/reynard/e2e"
    run_test "Examples directory" "echo \${EXAMPLES_DIR}" "/home/kade/runeset/reynard/examples"
    run_test "Services directory" "echo \${SERVICES_DIR}" "/home/kade/runeset/reynard/services"
    run_test "Scripts directory" "echo \${SCRIPTS_DIR}" "/home/kade/runeset/reynard/scripts"
    run_test "Experimental directory" "echo \${EXPERIMENTAL_DIR}" "/home/kade/runeset/reynard/experimental"
    run_test "Third party directory" "echo \${THIRD_PARTY_DIR}" "/home/kade/runeset/reynard/third_party"
}

# Function to test convenience functions
test_convenience_functions() {
    echo -e "${YELLOW}🔧 Testing convenience functions...${NC}"
    
    # Source the project root utility
    source "$(dirname "$0")/project-root.sh"
    
    # Test convenience functions
    run_test "get_backend_dir function" "get_backend_dir" "/home/kade/runeset/reynard/backend"
    run_test "get_e2e_dir function" "get_e2e_dir" "/home/kade/runeset/reynard/e2e"
    run_test "get_examples_dir function" "get_examples_dir" "/home/kade/runeset/reynard/examples"
    run_test "get_services_dir function" "get_services_dir" "/home/kade/runeset/reynard/services"
    run_test "get_scripts_dir function" "get_scripts_dir" "/home/kade/runeset/reynard/scripts"
    run_test "get_experimental_dir function" "get_experimental_dir" "/home/kade/runeset/reynard/experimental"
    run_test "get_third_party_dir function" "get_third_party_dir" "/home/kade/runeset/reynard/third_party"
}

# Function to test directory existence
test_directory_existence() {
    echo -e "${YELLOW}🔧 Testing directory existence...${NC}"
    
    # Source the project root utility
    source "$(dirname "$0")/project-root.sh"
    
    # Test that all directories exist
    run_test "Project root exists" "[ -d \"\${PROJECT_ROOT}\" ]] && echo 'exists'" "exists"
    run_test "Backend directory exists" "[ -d \"\${BACKEND_DIR}\" ]] && echo 'exists'" "exists"
    run_test "E2E directory exists" "[ -d \"\${E2E_DIR}\" ]] && echo 'exists'" "exists"
    run_test "Examples directory exists" "[ -d \"\${EXAMPLES_DIR}\" ]] && echo 'exists'" "exists"
    run_test "Services directory exists" "[ -d \"\${SERVICES_DIR}\" ]] && echo 'exists'" "exists"
    run_test "Scripts directory exists" "[ -d \"\${SCRIPTS_DIR}\" ]] && echo 'exists'" "exists"
    run_test "Experimental directory exists" "[ -d \"\${EXPERIMENTAL_DIR}\" ]] && echo 'exists'" "exists"
    run_test "Third party directory exists" "[ -d \"\${THIRD_PARTY_DIR}\" ]] && echo 'exists'" "exists"
}

# Function to test project structure validation
test_project_structure() {
    echo -e "${YELLOW}🔧 Testing project structure validation...${NC}"
    
    # Source the project root utility
    source "$(dirname "$0")/project-root.sh"
    
    # Test that key files exist in project root
    run_test "Package.json exists" "[ -f \"\${PROJECT_ROOT}/package.json\" ]] && echo 'exists'" "exists"
    run_test "Backend directory exists" "[ -d \"\${PROJECT_ROOT}/backend\" ]] && echo 'exists'" "exists"
    run_test "E2E directory exists" "[ -d \"\${PROJECT_ROOT}/e2e\" ]] && echo 'exists'" "exists"
    
    # Test that package.json contains "reynard"
    if [[ -f "${PROJECT_ROOT}/package.json" ]; then
        run_test "Package.json contains reynard" "grep -q 'reynard' \"\${PROJECT_ROOT}/package.json\" && echo 'contains'" "contains"
    fi
}

# Main test function
main() {
    echo -e "${BLUE}🦊 Shell Project Root Utility Tests${NC}"
    echo -e "${BLUE}====================================${NC}"
    echo
    
    # Run all test suites
    test_default_behavior
    test_convenience_functions
    test_directory_existence
    test_project_structure
    test_env_override
    
    # Print summary
    echo -e "${BLUE}📊 Test Summary${NC}"
    echo -e "${BLUE}===============${NC}"
    echo -e "Tests run:    ${TESTS_RUN}"
    echo -e "Tests passed: ${GREEN}${TESTS_PASSED}${NC}"
    echo -e "Tests failed: ${RED}${TESTS_FAILED}${NC}"
    
    if [[ ${TESTS_FAILED} -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}💥 Some tests failed!${NC}"
        exit 1
    fi
}

# Run tests
main "$@"
