#!/bin/bash

# Build script for SIMD WebAssembly ECS experiment
# This script compiles the Rust code to WebAssembly with SIMD support

set -e

echo "🦊> Building SIMD WebAssembly ECS Experiment"
echo "=========================================="

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack is not installed. Installing..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first."
    echo "Visit: https://rustup.rs/"
    exit 1
fi

# Navigate to Rust source directory
cd rust-src

echo "📦 Building WebAssembly module with SIMD support..."

# Build with wasm-pack
wasm-pack build \
    --target web \
    --out-dir ../pkg \
    --release \
    -- --features simd

echo "✅ WebAssembly build complete!"

# Check if the build was successful
if [[ -f "../pkg/ecs_simd.js" ]]; then
    echo "✅ Generated files:"
    ls -la ../pkg/
else
    echo "❌ Build failed - pkg/ecs_simd.js not found"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Update position-system-simd.ts to load the real WASM module"
echo "2. Run the benchmark: pnpm run test:simd"
echo "3. Compare performance results"
echo ""
echo "📁 Generated files are in: pkg/"
echo "   - ecs_simd.js (JavaScript wrapper)"
echo "   - ecs_simd_bg.wasm (WebAssembly binary)"
echo "   - ecs_simd.d.ts (TypeScript definitions)"
