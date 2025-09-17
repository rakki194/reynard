#!/bin/bash
# 🦊 Reynard Project Diagram Generation Script
# 
# Generates comprehensive diagrams for the entire Reynard project

set -e

echo "🦊 Reynard Project Diagram Generator"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    echo "❌ Error: Please run this script from the Reynard project root"
    exit 1
fi

# Set up paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIAGRAM_PACKAGE="$PROJECT_ROOT/packages/diagram-generator"
OUTPUT_DIR="$PROJECT_ROOT/docs/diagrams"

echo "📁 Project Root: $PROJECT_ROOT"
echo "📦 Diagram Package: $DIAGRAM_PACKAGE"
echo "📊 Output Directory: $OUTPUT_DIR"
echo ""

# Check if diagram generator package exists
if [ ! -d "$DIAGRAM_PACKAGE" ]; then
    echo "❌ Error: Diagram generator package not found at $DIAGRAM_PACKAGE"
    exit 1
fi

# Build the diagram generator package
echo "🔨 Building diagram generator package..."
cd "$DIAGRAM_PACKAGE"
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to build diagram generator package"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Generate diagrams
echo "🎨 Generating project diagrams..."
cd "$PROJECT_ROOT"

# Run the diagram generation
node "$DIAGRAM_PACKAGE/dist/cli/generate-all.js" \
    --output "$OUTPUT_DIR" \
    --theme neutral \
    --high-res \
    --root "$PROJECT_ROOT"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Diagram generation complete!"
    echo "📁 Diagrams saved to: $OUTPUT_DIR"
    echo ""
    echo "📋 Generated files:"
    ls -la "$OUTPUT_DIR"/*.svg 2>/dev/null || echo "  No SVG files generated"
    ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || echo "  No PNG files generated"
    ls -la "$OUTPUT_DIR"/*.mmd 2>/dev/null || echo "  No Mermaid files generated"
    ls -la "$OUTPUT_DIR"/*.json 2>/dev/null || echo "  No JSON files generated"
    echo ""
    echo "💡 Next steps:"
    echo "  1. View the SVG files in your browser or image viewer"
    echo "  2. Use the Mermaid source files (.mmd) for customization"
    echo "  3. Check the generation report for detailed information"
    echo "  4. Integrate these diagrams into your documentation"
else
    echo "❌ Error: Diagram generation failed"
    exit 1
fi
