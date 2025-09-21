#!/bin/bash

# 🦊 CSS Variable Validator Migration Script
# Helps migrate from the old JavaScript version to the new TypeScript version

set -e

echo "🦊 CSS Variable Validator Migration"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the packages/dev-tools/validation/css directory"
    echo "   cd packages/dev-tools/validation/css"
    echo "   ./migrate.sh"
    exit 1
fi

echo "📋 Migration Steps:"
echo "1. Installing dependencies..."
pnpm install

echo "2. Building TypeScript project..."
pnpm run build

echo "3. Running tests to ensure everything works..."
pnpm test

echo "4. Running linter..."
pnpm run lint

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "🎉 New TypeScript version is ready to use!"
echo ""
echo "Usage examples:"
echo "  pnpm start                           # Basic validation"
echo "  pnpm start --verbose                 # Verbose output"
echo "  pnpm start --strict                  # Strict mode for CI/CD"
echo "  pnpm start --output report.md        # Generate report"
echo "  pnpm start --format json             # JSON output"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "🔄 The old JavaScript version will show deprecation warnings"
echo "   but will continue to work for backward compatibility."
echo ""

