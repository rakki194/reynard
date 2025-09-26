#!/bin/bash

# 🔍 Workflow Validation Script for Reynard
# Validates all GitHub Actions workflows using actionlint

set -e

echo "🦊 Reynard Workflow Validation"
echo "=============================="

# Check if actionlint is installed
if ! command -v actionlint &> /dev/null; then
    echo "❌ actionlint is not installed!"
    echo "📦 Install it with: sudo pacman -S actionlint"
    exit 1
fi

actionlint_version=$(actionlint --version || echo "unknown")
echo "✅ actionlint found: ${actionlint_version}"
echo ""

# Validate all workflow files
echo "🔍 Validating GitHub Actions workflows..."
echo ""

WORKFLOW_DIR=".github/workflows"
VALIDATION_FAILED=false

if [[ ! -d "${WORKFLOW_DIR}" ]]; then
    echo "❌ No .github/workflows directory found!"
    exit 1
fi

# Count workflow files
WORKFLOW_COUNT=$(find "${WORKFLOW_DIR}" -name "*.yml" -o -name "*.yaml" | wc -l || true)
echo "📊 Found ${WORKFLOW_COUNT} workflow files"
echo ""

# Validate each workflow
for workflow in "${WORKFLOW_DIR}"/*.yml "${WORKFLOW_DIR}"/*.yaml; do
    if [[ -f "${workflow}" ]]; then
        filename=$(basename "${workflow}")
        echo "🔍 Validating ${filename}..."
        
        if actionlint "${workflow}"; then
            echo "✅ ${filename} - Valid"
        else
            echo "❌ ${filename} - Issues found"
            VALIDATION_FAILED=true
        fi
        echo ""
    fi
done

# Summary
echo "=============================="
if [[ "${VALIDATION_FAILED}" = true ]]; then
    echo "❌ Workflow validation failed!"
    echo "🔧 Fix the issues above and run this script again."
    exit 1
else
    echo "✅ All workflows are valid!"
    echo "🚀 Ready for deployment!"
fi
