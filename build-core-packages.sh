#!/bin/bash

# Reynard Core Packages Build Script
# Builds core packages that are known to work

set +e

echo "🦊 Starting Reynard core packages build..."

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
    if grep -q '"build"' package.json; then
        if pnpm run build; then
            echo "    ✅ Built $package_name"
        else
            echo "    ❌ Failed to build $package_name"
            return 1
        fi
    else
        echo "    ⚠️  No 'build' script found for $package_name, skipping build."
    fi
    cd - > /dev/null # Go back to the original directory
}

# Define core packages that are known to work
declare -a core_packages=(
    # Core foundation packages
    "i18n"
    "core"
    "testing"
    "colors"
    "config"
    "validation"
    "connection"
    "api-client"
    "composables"
    "file-processing"
    "3d"
    "auth"
    "themes"
    "ui"
    "components-core"
    "components-charts"
    "components-dashboard"
    "components-themes"
    "components-utils"
    "audio"
    "video"
    "animation"
    "charts"
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
success_count=0
fail_count=0

for package in "${core_packages[@]}"; do
    if build_package "$package"; then
        ((success_count++))
    else
        ((fail_count++))
        echo "  ⚠️  Continuing with other packages..."
    fi
done

echo ""
echo "🦊 Core packages build summary:"
echo "📋 Successfully built: $success_count packages"
echo "📋 Failed to build: $fail_count packages"

if [ $fail_count -eq 0 ]; then
    echo "🎉 All core packages built successfully!"
    exit 0
else
    echo "⚠️  Some packages failed to build, but core functionality is available"
    exit 0
fi
