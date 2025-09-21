#!/bin/bash

# 🦊 CSS Variable Validator Build Script
# Builds the TypeScript project and sets up the development environment

set -e

echo "🦊 Building CSS Variable Validator..."

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build TypeScript
echo "🔨 Building TypeScript..."
pnpm run build

# Run tests
echo "🧪 Running tests..."
pnpm test

# Run linting
echo "🔍 Running linter..."
pnpm run lint

echo "✅ Build completed successfully!"
echo ""
echo "Usage:"
echo "  pnpm start                    # Run the validator"
echo "  pnpm start --help            # Show help"
echo "  pnpm start --verbose         # Verbose output"
echo "  pnpm start --strict          # Strict mode"
echo ""

