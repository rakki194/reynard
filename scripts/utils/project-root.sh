#!/bin/bash
# 🦊 Project Root Utility for Shell Scripts
# =========================================
#
# Centralized utility for determining the Reynard project root directory
# across all shell scripts and automation tools.
#
# Usage:
#   source "$(dirname "$0")/project-root.sh"
#   cd "${PROJECT_ROOT}"
#
# Author: Reynard Development Team
# Version: 1.0.0

# Function to get the project root directory
get_project_root() {
    # Check environment variable first
    if [[ -n "${REYNARD_PROJECT_ROOT:-}" ]] && [[ -d "${REYNARD_PROJECT_ROOT:-}" ]]; then
        echo "${REYNARD_PROJECT_ROOT:-}"
        return 0
    fi
    
    # Get the directory of this script
    local script_dir
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Walk up from scripts/utils to find project root
    # scripts/utils -> scripts -> project root
    local current_dir="${script_dir}"
    for _ in {1..2}; do
        current_dir="$(dirname "${current_dir}")"
        
        # Check if this directory contains package.json with "reynard" in name
        if [[ -f "${current_dir}/package.json" ]]; then
            if grep -q "reynard" "${current_dir}/package.json" 2>/dev/null; then
                # Also check if there's an e2e directory to confirm this is the project root
                if [[ -d "${current_dir}/e2e" ]] && [[ -d "${current_dir}/backend" ]]; then
                    echo "${current_dir}"
                    return 0
                fi
            fi
        fi
    done
    
    # Fallback: assume we're in the project structure and go up 2 levels
    # from scripts/utils to project root
    local fallback_root
    fallback_root="$(dirname "$(dirname "${script_dir}")")"
    
    if [[ -d "${fallback_root}" ]]; then
        echo "${fallback_root}"
        return 0
    fi
    
    # Last resort: use current working directory
    pwd
    return 1
}

# Set the project root variable
PROJECT_ROOT="$(get_project_root)"
export PROJECT_ROOT

# Convenience functions
get_backend_dir() {
    echo "${PROJECT_ROOT}/backend"
}

get_e2e_dir() {
    echo "${PROJECT_ROOT}/e2e"
}

get_examples_dir() {
    echo "${PROJECT_ROOT}/examples"
}

get_services_dir() {
    echo "${PROJECT_ROOT}/services"
}

get_scripts_dir() {
    echo "${PROJECT_ROOT}/scripts"
}

get_experimental_dir() {
    echo "${PROJECT_ROOT}/experimental"
}

get_third_party_dir() {
    echo "${PROJECT_ROOT}/third_party"
}

# Export convenience variables
BACKEND_DIR="$(get_backend_dir)"
export BACKEND_DIR
E2E_DIR="$(get_e2e_dir)"
export E2E_DIR
EXAMPLES_DIR="$(get_examples_dir)"
export EXAMPLES_DIR
SERVICES_DIR="$(get_services_dir)"
export SERVICES_DIR
SCRIPTS_DIR="$(get_scripts_dir)"
export SCRIPTS_DIR
EXPERIMENTAL_DIR="$(get_experimental_dir)"
export EXPERIMENTAL_DIR
THIRD_PARTY_DIR="$(get_third_party_dir)"
export THIRD_PARTY_DIR

# Function to safely change to project root
cd_project_root() {
    cd "${PROJECT_ROOT}" || {
        echo "Error: Could not change to project root: ${PROJECT_ROOT}" >&2
        return 1
    }
}

# Function to safely change to a subdirectory
cd_project_dir() {
    local subdir="$1"
    if [[ -z "${subdir}" ]]; then
        echo "Usage: cd_project_dir <subdirectory>" >&2
        return 1
    fi
    
    local target_dir="${PROJECT_ROOT}/${subdir}"
    if [[ ! -d "${target_dir}" ]]; then
        echo "Error: Directory does not exist: ${target_dir}" >&2
        return 1
    fi
    
    cd "${target_dir}" || {
        echo "Error: Could not change to directory: ${target_dir}" >&2
        return 1
    }
}

# Print project root info (useful for debugging)
print_project_info() {
    echo "🦊 Reynard Project Root Information:"
    echo "  Project Root: ${PROJECT_ROOT}"
    echo "  Backend Dir:  ${BACKEND_DIR}"
    echo "  E2E Dir:      ${E2E_DIR}"
    echo "  Examples Dir: ${EXAMPLES_DIR}"
    echo "  Services Dir: ${SERVICES_DIR}"
    echo "  Scripts Dir:  ${SCRIPTS_DIR}"
    echo "  Experimental Dir: ${EXPERIMENTAL_DIR}"
    echo "  Third Party Dir:  ${THIRD_PARTY_DIR}"
}

# If this script is executed directly, print project info
if [[ "${BASH_SOURCE[0]}" = "${0}" ]]; then
    print_project_info
fi
