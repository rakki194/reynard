#!/bin/bash

# 🔍 Shell Script Validation Script for Reynard
# Validates all shell scripts using shellcheck

set -e

echo "🦊 Reynard Shell Script Validation"
echo "=================================="

# Check if shellcheck is installed
if ! command -v shellcheck &> /dev/null; then
    echo "❌ shellcheck is not installed!"
    echo "📦 Install it with: sudo pacman -S shellcheck"
    exit 1
fi

if shellcheck --version | head -1 > /tmp/shellcheck_version 2>/dev/null; then
    shellcheck_version=$(cat /tmp/shellcheck_version)
    echo "✅ shellcheck found: ${shellcheck_version}"
    rm -f /tmp/shellcheck_version
else
    echo "✅ shellcheck found: (version check failed)"
fi
echo ""

# Find all shell scripts (excluding third_party and node_modules)
SHELL_FILES=$(find . -type f \( -name "*.sh" -o -name "*.bash" -o -name "*.zsh" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./venv/*" \
  -not -path "./backend/venv/*" \
  -not -path "./third_party/*" \
  -not -path "./packages/*/node_modules/*" \
  -not -path "./examples/*/node_modules/*" \
  -not -path "./templates/*/node_modules/*")

if [[ -z "${SHELL_FILES}" ]]; then
    echo "✅ No shell scripts found to validate"
    exit 0
fi

# Count shell files
SHELL_COUNT=$(echo "${SHELL_FILES}" | wc -l)
echo "📊 Found ${SHELL_COUNT} shell scripts to validate"
echo ""

# List all shell files
echo "📋 Shell scripts found:"
echo "${SHELL_FILES}" | sed 's|^\./||' | sed 's/^/  - /' || true
echo ""

# Validate each shell script
echo "🔍 Validating shell scripts..."
echo ""

VALIDATION_FAILED=false

for script in ${SHELL_FILES}; do
    filename=$(basename "${script}")
    script_path="${script#./}"
    
    echo "🔍 Validating ${filename}..."
    echo "   Path: ${script_path}"
    
    if shellcheck --rcfile=.shellcheckrc "${script}"; then
        echo "✅ ${filename} - Valid"
    else
        echo "❌ ${filename} - Issues found"
        VALIDATION_FAILED=true
    fi
    echo ""
done

# Summary
echo "=================================="
if [[ "${VALIDATION_FAILED}" = true ]]; then
    echo "❌ Shell script validation failed!"
    echo "🔧 Fix the issues above and run this script again."
    echo ""
    echo "💡 Tips:"
    echo "  - Run 'shellcheck --rcfile=.shellcheckrc <script>' for detailed issues"
    echo "  - Check the .shellcheckrc configuration file"
    echo "  - Use 'shellcheck --help' for more options"
    exit 1
else
    echo "✅ All shell scripts are valid!"
    echo "🚀 Ready for deployment!"
fi
