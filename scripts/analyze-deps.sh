#!/bin/bash
# analyze-deps.sh
# Analyze package dependencies and identify optimization opportunities

set -e

echo "🦦 Reynard Package Dependency Analysis"
echo "======================================"

# Create temporary file for results
temp_file=$(mktemp)

echo "📊 Internal Dependencies per Package:"
echo "------------------------------------"

for pkg in packages/*/package.json; do
    if [[ -f "${pkg}" ]]; then
        name=$(jq -r '.name' "${pkg}" 2>/dev/null || echo "unknown")
        deps=$(jq -r '.dependencies | keys[]' "${pkg}" 2>/dev/null | grep "reynard-" | wc -l)
        peer_deps=$(jq -r '.peerDependencies | keys[]' "${pkg}" 2>/dev/null | wc -l)
        total_deps=$(jq -r '.dependencies | keys[]' "${pkg}" 2>/dev/null | wc -l)

        printf "%-35s | %2d internal | %2d peer | %2d total\n" "${name}" "${deps}" "${peer_deps}" "${total_deps}"
        echo "${name},${deps},${peer_deps},${total_deps}" >> "${temp_file}"
    fi
done

echo ""
echo "🔍 Top 10 Packages with Most Internal Dependencies:"
echo "--------------------------------------------------"
sort -t',' -k2 -nr "${temp_file}" | head -10 | while IFS=',' read -r name deps peer total; do
    printf "%-35s: %2d internal dependencies\n" "${name}" "${deps}"
done

echo ""
echo "📈 Summary Statistics:"
echo "---------------------"

total_packages=$(wc -l < "${temp_file}")
avg_internal=$(awk -F',' '{sum+=$2} END {printf "%.1f", sum/NR}' "${temp_file}")
avg_peer=$(awk -F',' '{sum+=$3} END {printf "%.1f", sum/NR}' "${temp_file}")
avg_total=$(awk -F',' '{sum+=$4} END {printf "%.1f", sum/NR}' "${temp_file}")

echo "Total packages analyzed: ${total_packages}"
echo "Average internal dependencies: ${avg_internal}"
echo "Average peer dependencies: ${avg_peer}"
echo "Average total dependencies: ${avg_total}"

echo ""
echo "🎯 Optimization Opportunities:"
echo "-----------------------------"

# Find packages with > 5 internal dependencies
heavy_packages=$(awk -F',' '$2 > 5 {print $1 " (" $2 " deps)"}' "${temp_file}")
if [[ -n "${heavy_packages}" ]]; then
    echo "Packages with > 5 internal dependencies (candidates for splitting):"
    echo "${heavy_packages}"
else
    echo "✅ No packages with > 5 internal dependencies found!"
fi

# Find packages with no peer dependencies
no_peer=$(awk -F',' '$3 == 0 {print $1}' "${temp_file}")
if [[ -n "${no_peer}" ]]; then
    echo ""
    echo "Packages with no peer dependencies (candidates for peer dep optimization):"
    echo "${no_peer}"
fi

# Clean up
rm "${temp_file}"

echo ""
echo "🦦 Analysis complete! Check the dependency-optimization-plan.md for detailed solutions."

