#!/bin/bash
# convert-to-workspace.sh
# Convert all internal dependencies from link: to workspace: protocol

set -e

echo "🦦 Converting internal dependencies to workspace: protocol..."

# Find all package.json files in packages directory
find packages -name "package.json" -type f | while read -r pkg_file; do
    echo "Processing: ${pkg_file}"

    # Create backup
    cp "${pkg_file}" "${pkg_file}.backup"

    # Convert link:packages/... to workspace:*
    sed -i 's/"reynard-\([^"]*\)": "link:packages\/\([^"]*\)"/"reynard-\1": "workspace:*"/g' "${pkg_file}"

    # Check if any changes were made
    if ! diff -q "${pkg_file}" "${pkg_file}.backup" > /dev/null; then
        echo "  ✅ Updated dependencies in ${pkg_file}"
    else
        echo "  ⏭️  No changes needed in ${pkg_file}"
        rm "${pkg_file}.backup"
    fi
done

echo "🎯 Conversion complete! Run 'pnpm install' to update dependencies."

