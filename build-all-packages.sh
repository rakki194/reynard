#!/bin/bash

# Reynard Complete Build Script
# Builds all packages in proper dependency order

set -e

echo "🦊 Starting complete Reynard project build..."

# Function to build a specific package
build_package() {
    local package_name="$1"
    local package_dir="/home/kade/runeset/reynard/packages/$package_name"

    if [ ! -d "$package_dir" ]; then
        echo "  ⚠️  Package $package_name not found, skipping..."
        return 0
    fi

    if [ ! -f "$package_dir/package.json" ]; then
        echo "  ⚠️  No package.json found for $package_name, skipping..."
        return 0
    fi

    echo "  🔨 Building $package_name..."

    cd "$package_dir"

    # Check if package has a build script
    if grep -q '\"build\"' package.json; then
        if pnpm run build; then
            echo "    ✅ Built $package_name"
        else
            echo "    ❌ Failed to build $package_name"
            exit 1
        fi
    else
        echo "    ⚠️  No 'build' script found for $package_name, skipping build."
    fi
    cd - > /dev/null # Go back to the original directory
}

# Define build order (core packages first, then dependent packages)
declare -a build_order=(
    # Core foundation packages (no dependencies)
    "i18n"
    "core"
    "testing"
    "colors"
    "config"
    "validation"
    "connection"

    # API client (needed by auth)
    "api-client"

    # Basic utilities (depend on core)
    "composables"
    "file-processing"
    "image"
    "audio"
    "video"
    "3d"
    "animation"
    "charts"

    # UI foundation (depend on core + colors)
    "themes"
    "ui"
    "components-core"
    "components-charts"
    "components-dashboard"
    "components-themes"
    "components-utils"

    # Auth (depends on api-client and components)
    "auth"

    # Specialized components and features
    "floating-panel"
    "error-boundaries"
    "monaco"
    "multimodal"
    "chat"
    "gallery"
    "gallery-ai"
    "gallery-dl"
    "scraping"
    "segmentation"
    "service-manager"
    "settings"
    "tools"
    "unified-repository"
    "repository-core"
    "repository-multimodal"
    "repository-search"
    "repository-storage"
    "nlweb"
    "dev-server-management"
    "diagram-generator"
    "fluent-icons"
    "queue-watcher"
    "docs-components"
    "docs-core"
    "docs-generator"
    "docs-site"
    "ecs-world"
    "email"
    "features"
    "git-automation"
    "model-management"
    "algorithms"
    "adr-system"
    "ai-shared"
    "dashboard"
)

# Build packages in defined order
for package in "${build_order[@]}"; do
    build_package "$package"
done

echo ""
echo "🦊 Complete Reynard project build finished!"
echo "📋 All packages built successfully"
echo "📋 Ready for production deployment"

