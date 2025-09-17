#!/bin/bash

# 🦦 Vitest Configuration Cleanup Script
# 
# This script helps clean up redundant individual vitest.config files
# after migrating to the centralized workspace configuration.
#
# *splashes with enthusiasm* Run this to streamline your testing setup!

set -e

echo "🦦 Starting Vitest configuration cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "vitest.workspace.ts" ]; then
    print_error "vitest.workspace.ts not found. Please run this script from the project root."
    exit 1
fi

print_status "Found centralized workspace configuration ✅"

# List of packages that should keep their individual configs (if they have unique requirements)
KEEP_CONFIGS=(
    "packages/components"  # Has solid plugin
    "packages/segmentation"  # Has unique pool settings
    "packages/testing"  # Has unique setup
)

# Function to check if a package should keep its config
should_keep_config() {
    local package_path="$1"
    for keep_package in "${KEEP_CONFIGS[@]}"; do
        if [[ "$package_path" == "$keep_package" ]]; then
            return 0
        fi
    done
    return 1
}

# Find all vitest config files
print_status "Scanning for vitest configuration files..."

VITEST_CONFIGS=($(find . -name "vitest.config.*" -type f | grep -v node_modules | sort))

print_status "Found ${#VITEST_CONFIGS[@]} vitest configuration files"

# Process each config file
REMOVED_COUNT=0
KEPT_COUNT=0

for config_file in "${VITEST_CONFIGS[@]}"; do
    # Get the directory containing the config file
    config_dir=$(dirname "$config_file")
    
    # Skip if this is the root workspace config
    if [[ "$config_file" == "./vitest.workspace.ts" ]]; then
        print_status "Skipping workspace config: $config_file"
        continue
    fi
    
    # Check if this package should keep its config
    if should_keep_config "$config_dir"; then
        print_warning "Keeping config for $config_dir (has unique requirements)"
        ((KEPT_COUNT++))
    else
        print_status "Removing redundant config: $config_file"
        rm "$config_file"
        ((REMOVED_COUNT++))
        
        # Also remove any .js versions if they exist
        js_config="${config_file%.*}.js"
        if [ -f "$js_config" ]; then
            print_status "Removing redundant JS config: $js_config"
            rm "$js_config"
        fi
        
        # Remove .d.ts versions if they exist
        dts_config="${config_file%.*}.d.ts"
        if [ -f "$dts_config" ]; then
            print_status "Removing redundant TypeScript declaration: $dts_config"
            rm "$dts_config"
        fi
    fi
done

print_success "Cleanup complete!"
print_status "Removed $REMOVED_COUNT redundant configuration files"
print_status "Kept $KEPT_COUNT configuration files with unique requirements"

# Test the new configuration
print_status "Testing the new workspace configuration..."

if command -v pnpm &> /dev/null; then
    print_status "Running workspace test to verify configuration..."
    if pnpm test --run --reporter=verbose 2>/dev/null; then
        print_success "Workspace configuration test passed! ✅"
    else
        print_warning "Workspace test had issues - you may need to adjust configurations"
    fi
else
    print_warning "pnpm not found - skipping test verification"
fi

print_success "🎉 Vitest configuration cleanup complete!"
print_status "Your monorepo now uses the centralized workspace configuration"
print_status "VS Code should no longer show the 'multiple projects' warning"


