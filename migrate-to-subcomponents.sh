#!/bin/bash

# Reynard Components Migration Script
# Updates all packages to use subcomponents instead of main components package

set -e

echo "🦊 Starting Reynard components migration to subpackages..."

# Function to update package.json dependencies
update_package_dependencies() {
    local package_dir="$1"
    local package_name=$(basename "$package_dir")

    echo "  📦 Updating dependencies for $package_name..."

    # Check if package uses reynard-components
    if grep -q '"reynard-components"' "$package_dir/package.json"; then
        echo "    🔄 Replacing reynard-components with subpackages..."

        # Create backup
        cp "$package_dir/package.json" "$package_dir/package.json.backup"

        # Replace reynard-components with all subpackages
        # This ensures all components are available
        sed -i 's/"reynard-components": "workspace:\*"/"reynard-components-core": "workspace:*",\n    "reynard-components-charts": "workspace:*",\n    "reynard-components-dashboard": "workspace:*",\n    "reynard-components-themes": "workspace:*",\n    "reynard-components-utils": "workspace:*"/g' "$package_dir/package.json"

        echo "    ✅ Updated $package_name dependencies"
    else
        echo "    ⚠️  $package_name doesn't use reynard-components"
    fi
}

# Function to update import statements in a file
update_imports() {
    local file="$1"

    # Update imports from reynard-components to specific subpackages
    # This is a simplified approach - we'll use components-core as the default
    # and let developers update specific imports as needed

    # Replace common imports
    sed -i 's/from "reynard-components"/from "reynard-components-core"/g' "$file"

    # Update specific component imports that should go to other packages
    # Charts components
    sed -i 's/from "reynard-components-core".*Charts/from "reynard-components-charts"/g' "$file"
    sed -i 's/from "reynard-components-core".*Chart/from "reynard-components-charts"/g' "$file"
    sed -i 's/from "reynard-components-core".*ThreeD/from "reynard-components-charts"/g' "$file"

    # Dashboard components
    sed -i 's/from "reynard-components-core".*Dashboard/from "reynard-components-dashboard"/g' "$file"
    sed -i 's/from "reynard-components-core".*Debug/from "reynard-components-dashboard"/g' "$file"
    sed -i 's/from "reynard-components-core".*Performance/from "reynard-components-dashboard"/g' "$file"

    # Theme components
    sed -i 's/from "reynard-components-core".*OKLCH/from "reynard-components-themes"/g' "$file"
    sed -i 's/from "reynard-components-core".*Theme/from "reynard-components-themes"/g' "$file"
    sed -i 's/from "reynard-components-core".*Color/from "reynard-components-themes"/g' "$file"

    # Utility components
    sed -i 's/from "reynard-components-core".*Notification/from "reynard-components-utils"/g' "$file"
    sed -i 's/from "reynard-components-core".*Playground/from "reynard-components-utils"/g' "$file"
    sed -i 's/from "reynard-components-core".*Feature/from "reynard-components-utils"/g' "$file"
    sed -i 's/from "reynard-components-core".*Counter/from "reynard-components-utils"/g' "$file"
    sed -i 's/from "reynard-components-core".*IconGallery/from "reynard-components-utils"/g' "$file"
    sed -i 's/from "reynard-components-core".*IconShowcase/from "reynard-components-utils"/g' "$file"
    sed -i 's/from "reynard-components-core".*Storage/from "reynard-components-utils"/g' "$file"
    sed -i 's/from "reynard-components-core".*Golden/from "reynard-components-utils"/g' "$file"
}

# Function to update package imports
update_package_imports() {
    local package_dir="$1"
    local package_name=$(basename "$package_dir")

    echo "  📦 Updating imports for $package_name..."

    # Find all TypeScript/JavaScript files
    find "$package_dir/src" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | while read -r file; do
        if grep -q 'from "reynard-components"' "$file"; then
            echo "    🔄 Updating imports in $(basename "$file")..."
            update_imports "$file"
        fi
    done

    echo "    ✅ Updated $package_name imports"
}

# List of packages that use reynard-components (from our analysis)
declare -a packages_to_migrate=(
    "3d"
    "auth"
    "gallery"
    "rag"
    "caption"
    "annotating-ui"
    "email"
    "games"
    "multimodal"
    "dashboard"
    "comfy"
    "caption-ui"
    "docs-site"
    "video"
    "audio"
    "docs-components"
    "image"
    "code-quality"
    "settings"
    "unified-repository"
    "docs-core"
    "ui"
    "gallery-dl"
    "gallery-ai"
)

# Update package dependencies
echo "🔄 Updating package dependencies..."
for package_name in "${packages_to_migrate[@]}"; do
    package_dir="/home/kade/runeset/reynard/packages/$package_name"
    if [ -d "$package_dir" ] && [ -f "$package_dir/package.json" ]; then
        update_package_dependencies "$package_dir"
    else
        echo "  ⚠️  Package $package_name not found, skipping..."
    fi
done

# Update import statements
echo "🔄 Updating import statements..."
for package_name in "${packages_to_migrate[@]}"; do
    package_dir="/home/kade/runeset/reynard/packages/$package_name"
    if [ -d "$package_dir" ] && [ -d "$package_dir/src" ]; then
        update_package_imports "$package_dir"
    else
        echo "  ⚠️  Package $package_name not found or no src directory, skipping..."
    fi
done

echo ""
echo "🦊 Components migration complete!"
echo "📋 All packages updated to use subpackages instead of main components"
echo "📋 Dependencies updated in package.json files"
echo "📋 Import statements updated in source files"
echo ""
echo "⚠️  IMPORTANT: You should now:"
echo "   1. Run 'pnpm install' to install the new dependencies"
echo "   2. Test each package to ensure imports work correctly"
echo "   3. Update specific imports based on what components are actually used"
echo "   4. Remove any unused subpackage dependencies"

