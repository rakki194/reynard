#!/bin/bash
# detect-circular.sh
# Detect potential circular dependencies in the monorepo

set -e

echo "🦦 Detecting Circular Dependencies"
echo "================================="

# Create a temporary file to store dependency relationships
deps_file=$(mktemp)

echo "📊 Analyzing dependency relationships..."

# Extract all internal dependencies
for pkg in packages/*/package.json; do
    if [[ -f "${pkg}" ]]; then
        name=$(jq -r '.name' "${pkg}" 2>/dev/null || echo "unknown")
        jq -r '.dependencies | keys[]' "${pkg}" 2>/dev/null | grep "reynard-" | while read -r dep; do
            echo "${name} -> ${dep}" >> "${deps_file}"
        done
    fi
done

echo ""
echo "🔍 Dependency Chain Analysis:"
echo "-----------------------------"

# Find potential circular dependencies by looking for reverse relationships
echo "Checking for potential circular dependencies..."

circular_found=false

while IFS=' -> ' read -r from to; do
    # Check if there's a reverse dependency
    if grep -q "^${to} -> ${from}$" "${deps_file}"; then
        echo "⚠️  Potential circular dependency: ${from} ↔ ${to}"
        circular_found=true
    fi
done < "${deps_file}"

if [[ "${circular_found}" = false ]]; then
    echo "✅ No obvious circular dependencies detected!"
fi

echo ""
echo "📈 Dependency Usage Statistics:"
echo "------------------------------"

# Count how many packages depend on each package
echo "Most depended-upon packages:"
grep -o "reynard-[^[:space:]]*" "${deps_file}" | sort | uniq -c | sort -nr | head -10 | while read -r count pkg; do
    printf "%-35s: %2d dependents\n" "${pkg}" "${count}"
done

echo ""
echo "🔗 Longest Dependency Chains:"
echo "-----------------------------"

# Find packages with the longest dependency chains
for pkg in packages/*/package.json; do
    if [[ -f "${pkg}" ]]; then
        name=$(jq -r '.name' "${pkg}" 2>/dev/null || echo "unknown")
        chain_length=$(jq -r '.dependencies | keys[]' "${pkg}" 2>/dev/null | grep "reynard-" | wc -l)
        if [[ "${chain_length}" -gt 3 ]]; then
            printf "%-35s: %2d dependencies\n" "${name}" "${chain_length}"
        fi
    fi
done

echo ""
echo "🎯 Recommendations:"
echo "------------------"

# Find packages that are both depended upon and have many dependencies
echo "Packages that are both heavily used and have many dependencies (refactor candidates):"
grep -o "reynard-[^[:space:]]*" "${deps_file}" | sort | uniq -c | sort -nr | head -5 | while read -r count pkg; do
    # Check if this package also has many dependencies
    pkg_file="packages/${pkg#reynard-}/package.json"
    if [[ -f "${pkg_file}" ]]; then
        deps_count=$(jq -r '.dependencies | keys[]' "${pkg_file}" 2>/dev/null | grep "reynard-" | wc -l)
        if [[ "${deps_count}" -gt 3 ]]; then
            printf "%-35s: %2d dependents, %2d dependencies (REFACTOR CANDIDATE)\n" "${pkg}" "${count}" "${deps_count}"
        fi
    fi
done

# Clean up
rm "${deps_file}"

echo ""
echo "🦦 Circular dependency analysis complete!"
echo "Check the dependency-optimization-plan.md for detailed refactoring strategies."

