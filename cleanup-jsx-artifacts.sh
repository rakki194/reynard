#!/bin/bash

# Reynard JSX Artifacts Cleanup Script
# Removes .jsx and .js files from src/ that should be .tsx/.ts files

set -e

echo "🦊 Starting Reynard JSX artifacts cleanup..."

# Function to clean a specific package
clean_package() {
    local package_dir="$1"
    local package_name=$(basename "$package_dir")

    echo "  📦 Cleaning $package_name..."

    # Remove .jsx files from src/ (these should be .tsx)
    find "$package_dir/src" -name "*.jsx" \
        -not -path "*/node_modules/*" \
        -not -path "*/__tests__/*" \
        -not -path "*/test/*" \
        -not -name "*.test.jsx" \
        -not -name "*.spec.jsx" \
        -delete 2>/dev/null || true

    # Remove .js files from src/ (except legitimate source files)
    find "$package_dir/src" -name "*.js" \
        -not -path "*/node_modules/*" \
        -not -path "*/__tests__/*" \
        -not -path "*/test/*" \
        -not -name "*.test.js" \
        -not -name "*.spec.js" \
        -not -name "vite.config.js" \
        -not -name "vitest.config.js" \
        -not -name "setup.js" \
        -not -name "test-setup.js" \
        -not -name "*.config.js" \
        -delete 2>/dev/null || true

    # Remove .d.ts files from src/ (except legitimate source files)
    find "$package_dir/src" -name "*.d.ts" \
        -not -path "*/node_modules/*" \
        -not -path "*/__tests__/*" \
        -not -path "*/test/*" \
        -not -name "*.test.d.ts" \
        -not -name "*.spec.d.ts" \
        -not -name "vite.config.d.ts" \
        -not -name "vitest.config.d.ts" \
        -not -name "setup.d.ts" \
        -not -name "test-setup.d.ts" \
        -not -name "*.config.d.ts" \
        -delete 2>/dev/null || true

    # Remove tsconfig.tsbuildinfo files
    find "$package_dir" -name "tsconfig.tsbuildinfo" -delete 2>/dev/null || true

    # Clean dist directory if it exists
    if [ -d "$package_dir/dist" ]; then
        rm -rf "$package_dir/dist"
    fi

    echo "    ✅ Cleaned $package_name"
}

# List of packages that need cleaning
declare -a packages_to_clean=(
    "3d"
    "adr-system"
    "ai-shared"
    "annotating-core"
    "annotating-florence2"
    "annotating-joy"
    "annotating-jtp2"
    "annotating-ui"
    "annotating-wdv3"
    "api-client"
    "components"
    "code-quality"
    "colors"
    "components-themes"
    "algorithms"
    "animation"
)

# Clean each package
echo "🧹 Cleaning packages with JSX artifacts..."
for package_name in "${packages_to_clean[@]}"; do
    package_dir="/home/kade/runeset/reynard/packages/$package_name"
    if [ -d "$package_dir" ]; then
        clean_package "$package_dir"
    else
        echo "  ⚠️  Package $package_name not found, skipping..."
    fi
done

echo ""
echo "🦊 JSX artifacts cleanup complete!"
echo "📋 All .jsx, .js, and .d.ts files removed from src/ directories"
echo "📋 All packages cleaned and ready for proper TypeScript build"
