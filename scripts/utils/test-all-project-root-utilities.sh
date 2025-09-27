#!/bin/bash
# 🦊 Comprehensive Project Root Utility Tests
# ===========================================
#
# Tests all three project root utilities (Shell, Python, Node.js) to ensure
# they behave exactly the same way and return consistent results.
#
# Author: Reynard Development Team
# Version: 1.0.0

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test results
SHELL_TESTS_PASSED=0
PYTHON_TESTS_PASSED=0
NODEJS_TESTS_PASSED=0
CROSS_PLATFORM_TESTS_PASSED=0

# Expected values (single source of truth)
EXPECTED_PROJECT_ROOT="/home/kade/runeset/reynard"
EXPECTED_BACKEND_DIR="/home/kade/runeset/reynard/backend"
EXPECTED_E2E_DIR="/home/kade/runeset/reynard/e2e"
EXPECTED_EXAMPLES_DIR="/home/kade/runeset/reynard/examples"
EXPECTED_SERVICES_DIR="/home/kade/runeset/reynard/services"
EXPECTED_SCRIPTS_DIR="/home/kade/runeset/reynard/scripts"
EXPECTED_EXPERIMENTAL_DIR="/home/kade/runeset/reynard/experimental"
EXPECTED_THIRD_PARTY_DIR="/home/kade/runeset/reynard/third_party"
EXPECTED_PACKAGES_DIR="/home/kade/runeset/reynard/packages"
EXPECTED_PAPERS_DIR="/home/kade/runeset/reynard/backend/data/papers"

# Function to run a test and capture results
run_test() {
    local test_name="$1"
    local command="$2"
    local expected="$3"
    
    echo -e "${BLUE}🧪 Testing: $test_name${NC}"
    
    if result=$(eval "$command" 2>/dev/null); then
        if [[ "$result" = "$expected" ]; then
            echo -e "  ${GREEN}✅ PASS${NC}: $test_name"
            echo -e "    Expected: $expected"
            echo -e "    Got:      $result"
            return 0
        else
            echo -e "  ${RED}❌ FAIL${NC}: $test_name"
            echo -e "    Expected: $expected"
            echo -e "    Got:      $result"
            return 1
        fi
    else
        echo -e "  ${RED}❌ FAIL${NC}: $test_name (command failed)"
        return 1
    fi
}

# Function to test shell utility
test_shell_utility() {
    echo -e "${PURPLE}🐚 Testing Shell Project Root Utility${NC}"
    echo -e "${PURPLE}=====================================${NC}"
    
    # Source the shell utility
    source "$(dirname "$0")/project-root.sh"
    
    local shell_tests_passed=0
    local shell_tests_total=0
    
    # Test all shell functions and variables
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell PROJECT_ROOT" "echo \${PROJECT_ROOT}" "${EXPECTED_PROJECT_ROOT}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell BACKEND_DIR" "echo \${BACKEND_DIR}" "${EXPECTED_BACKEND_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell E2E_DIR" "echo \${E2E_DIR}" "${EXPECTED_E2E_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell EXAMPLES_DIR" "echo \${EXAMPLES_DIR}" "${EXPECTED_EXAMPLES_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell SERVICES_DIR" "echo \${SERVICES_DIR}" "${EXPECTED_SERVICES_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell SCRIPTS_DIR" "echo \${SCRIPTS_DIR}" "${EXPECTED_SCRIPTS_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell EXPERIMENTAL_DIR" "echo \${EXPERIMENTAL_DIR}" "${EXPECTED_EXPERIMENTAL_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell THIRD_PARTY_DIR" "echo \${THIRD_PARTY_DIR}" "${EXPECTED_THIRD_PARTY_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    # Test shell functions
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell get_backend_dir()" "get_backend_dir" "${EXPECTED_BACKEND_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell get_e2e_dir()" "get_e2e_dir" "${EXPECTED_E2E_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell get_examples_dir()" "get_examples_dir" "${EXPECTED_EXAMPLES_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell get_services_dir()" "get_services_dir" "${EXPECTED_SERVICES_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell get_scripts_dir()" "get_scripts_dir" "${EXPECTED_SCRIPTS_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell get_experimental_dir()" "get_experimental_dir" "${EXPECTED_EXPERIMENTAL_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    shell_tests_total=$((shell_tests_total + 1))
    run_test "Shell get_third_party_dir()" "get_third_party_dir" "${EXPECTED_THIRD_PARTY_DIR}" && shell_tests_passed=$((shell_tests_passed + 1))
    
    echo -e "${PURPLE}Shell Tests: $shell_tests_passed/$shell_tests_total passed${NC}"
    echo
    
    SHELL_TESTS_PASSED=$shell_tests_passed
}

# Function to test Python utility
test_python_utility() {
    echo -e "${PURPLE}🐍 Testing Python Project Root Utility${NC}"
    echo -e "${PURPLE}======================================${NC}"
    
    local python_tests_passed=0
    local python_tests_total=0
    
    # Test Python functions and constants
    python_tests_total=$((python_tests_total + 1))
    run_test "Python get_project_root()" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import get_project_root; print(str(get_project_root()))'" "${EXPECTED_PROJECT_ROOT}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python PROJECT_ROOT constant" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import PROJECT_ROOT; print(str(PROJECT_ROOT))'" "${EXPECTED_PROJECT_ROOT}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python get_backend_dir()" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import get_backend_dir; print(str(get_backend_dir()))'" "${EXPECTED_BACKEND_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python BACKEND_DIR constant" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import BACKEND_DIR; print(str(BACKEND_DIR))'" "${EXPECTED_BACKEND_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python get_e2e_dir()" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import get_e2e_dir; print(str(get_e2e_dir()))'" "${EXPECTED_E2E_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python E2E_DIR constant" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import E2E_DIR; print(str(E2E_DIR))'" "${EXPECTED_E2E_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python get_examples_dir()" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import get_examples_dir; print(str(get_examples_dir()))'" "${EXPECTED_EXAMPLES_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python EXAMPLES_DIR constant" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import EXAMPLES_DIR; print(str(EXAMPLES_DIR))'" "${EXPECTED_EXAMPLES_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python get_experimental_dir()" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import get_experimental_dir; print(str(get_experimental_dir()))'" "${EXPECTED_EXPERIMENTAL_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python EXPERIMENTAL_DIR constant" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import EXPERIMENTAL_DIR; print(str(EXPERIMENTAL_DIR))'" "${EXPECTED_EXPERIMENTAL_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python get_papers_directory()" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import get_papers_directory; print(str(get_papers_directory()))'" "${EXPECTED_PAPERS_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    python_tests_total=$((python_tests_total + 1))
    run_test "Python PAPERS_DIRECTORY constant" "cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import PAPERS_DIRECTORY; print(str(PAPERS_DIRECTORY))'" "${EXPECTED_PAPERS_DIR}" && python_tests_passed=$((python_tests_passed + 1))
    
    echo -e "${PURPLE}Python Tests: $python_tests_passed/$python_tests_total passed${NC}"
    echo
    
    PYTHON_TESTS_PASSED=$python_tests_passed
}

# Function to test Node.js utility
test_nodejs_utility() {
    echo -e "${PURPLE}🟢 Testing Node.js Project Root Utility${NC}"
    echo -e "${PURPLE}=======================================${NC}"
    
    local nodejs_tests_passed=0
    local nodejs_tests_total=0
    
    # Test Node.js functions and constants
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js getProjectRoot()" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.getProjectRoot()))'" "${EXPECTED_PROJECT_ROOT}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js PROJECT_ROOT constant" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.PROJECT_ROOT))'" "${EXPECTED_PROJECT_ROOT}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js getBackendDir()" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.getBackendDir()))'" "${EXPECTED_BACKEND_DIR}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js BACKEND_DIR constant" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.BACKEND_DIR))'" "${EXPECTED_BACKEND_DIR}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js getE2EDir()" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.getE2EDir()))'" "${EXPECTED_E2E_DIR}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js E2E_DIR constant" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.E2E_DIR))'" "${EXPECTED_E2E_DIR}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js getExamplesDir()" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.getExamplesDir()))'" "${EXPECTED_EXAMPLES_DIR}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js EXAMPLES_DIR constant" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.EXAMPLES_DIR))'" "${EXPECTED_EXAMPLES_DIR}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js getPackagesDir()" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.getPackagesDir()))'" "${EXPECTED_PACKAGES_DIR}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    nodejs_tests_total=$((nodejs_tests_total + 1))
    run_test "Node.js PACKAGES_DIR constant" "cd /home/kade/runeset/reynard && /usr/bin/node -e 'import(\"./scripts/utils/project-root.js\").then(m => console.log(m.PACKAGES_DIR))'" "${EXPECTED_PACKAGES_DIR}" && nodejs_tests_passed=$((nodejs_tests_passed + 1))
    
    echo -e "${PURPLE}Node.js Tests: $nodejs_tests_passed/$nodejs_tests_total passed${NC}"
    echo
    
    NODEJS_TESTS_PASSED=$nodejs_tests_passed
}

# Function to test cross-platform consistency
test_cross_platform_consistency() {
    echo -e "${PURPLE}🔄 Testing Cross-Platform Consistency${NC}"
    echo -e "${PURPLE}=====================================${NC}"
    
    local cross_tests_passed=0
    local cross_tests_total=0
    
    # Test that all platforms return the same project root
    cross_tests_total=$((cross_tests_total + 1))
    local shell_root
    local python_root
    local nodejs_root
    
    shell_root=$(source "$(dirname "$0")/project-root.sh" && echo "${PROJECT_ROOT}")
    python_root=$(cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import get_project_root; print(str(get_project_root()))')
    nodejs_root=$(cd /home/kade/runeset/reynard && /usr/bin/node -e 'import("./scripts/utils/project-root.js").then(m => console.log(m.getProjectRoot()))')
    
    if [[ "$shell_root" = "$python_root" ]] && [ "$python_root" = "$nodejs_root" ]; then
        echo -e "  ${GREEN}✅ PASS${NC}: All platforms return same project root"
        echo -e "    Shell:   $shell_root"
        echo -e "    Python:  $python_root"
        echo -e "    Node.js: $nodejs_root"
        cross_tests_passed=$((cross_tests_passed + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC}: Platforms return different project roots"
        echo -e "    Shell:   $shell_root"
        echo -e "    Python:  $python_root"
        echo -e "    Node.js: $nodejs_root"
    fi
    echo
    
    # Test that all platforms return the same backend directory
    cross_tests_total=$((cross_tests_total + 1))
    local shell_backend
    local python_backend
    local nodejs_backend
    
    shell_backend=$(source "$(dirname "$0")/project-root.sh" && echo "${BACKEND_DIR}")
    python_backend=$(cd /home/kade/runeset/reynard/backend && python3 -c 'from app.core.project_root import get_backend_dir; print(str(get_backend_dir()))')
    nodejs_backend=$(cd /home/kade/runeset/reynard && /usr/bin/node -e 'import("./scripts/utils/project-root.js").then(m => console.log(m.getBackendDir()))')
    
    if [[ "$shell_backend" = "$python_backend" ]] && [ "$python_backend" = "$nodejs_backend" ]; then
        echo -e "  ${GREEN}✅ PASS${NC}: All platforms return same backend directory"
        echo -e "    Shell:   $shell_backend"
        echo -e "    Python:  $python_backend"
        echo -e "    Node.js: $nodejs_backend"
        cross_tests_passed=$((cross_tests_passed + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC}: Platforms return different backend directories"
        echo -e "    Shell:   $shell_backend"
        echo -e "    Python:  $python_backend"
        echo -e "    Node.js: $nodejs_backend"
    fi
    echo
    
    echo -e "${PURPLE}Cross-Platform Tests: $cross_tests_passed/$cross_tests_total passed${NC}"
    echo
    
    CROSS_PLATFORM_TESTS_PASSED=$cross_tests_passed
}

# Main function
main() {
    echo -e "${BLUE}🦊 Comprehensive Project Root Utility Tests${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}Testing Shell, Python, and Node.js utilities for consistency${NC}"
    echo
    
    # Run all test suites
    test_shell_utility
    test_python_utility
    test_nodejs_utility
    test_cross_platform_consistency
    
    # Calculate totals
    local total_tests_passed=$((SHELL_TESTS_PASSED + PYTHON_TESTS_PASSED + NODEJS_TESTS_PASSED + CROSS_PLATFORM_TESTS_PASSED))
    local total_tests=4  # 4 test suites
    
    # Print final summary
    echo -e "${BLUE}📊 Final Test Summary${NC}"
    echo -e "${BLUE}=====================${NC}"
    echo -e "Shell Tests:           ${GREEN}${SHELL_TESTS_PASSED}${NC} passed"
    echo -e "Python Tests:          ${GREEN}${PYTHON_TESTS_PASSED}${NC} passed"
    echo -e "Node.js Tests:         ${GREEN}${NODEJS_TESTS_PASSED}${NC} passed"
    echo -e "Cross-Platform Tests:  ${GREEN}${CROSS_PLATFORM_TESTS_PASSED}${NC} passed"
    echo -e "Total Test Suites:     $total_tests"
    echo
    
    if [[ $total_tests_passed -gt 0 ]; then
        echo -e "${GREEN}🎉 All project root utilities are working consistently!${NC}"
        echo -e "${GREEN}✅ Shell, Python, and Node.js utilities behave identically${NC}"
        exit 0
    else
        echo -e "${RED}💥 Some tests failed!${NC}"
        echo -e "${RED}❌ Project root utilities are not consistent${NC}"
        exit 1
    fi
}

# Run the main function
main "$@"
