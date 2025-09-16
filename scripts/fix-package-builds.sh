#!/bin/bash

# Script to fix the malformed build scripts in all packages

PACKAGES=(
  "repository-core"
  "repository-storage"
  "repository-search"
  "repository-multimodal"
  "components-charts"
  "components-themes"
  "components-dashboard"
)

for package in "${PACKAGES[@]}"; do
  echo "Fixing ${package}..."

  # Fix the build script
  sed -i 's|"build": "vite build "build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly","build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly", rm -f tsconfig.tsbuildinfo "build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly","build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly", tsc -p tsconfig.json --declaration --emitDeclarationOnly",|"build": "vite build && rm -f tsconfig.tsbuildinfo && tsc -p tsconfig.json --declaration --emitDeclarationOnly",|g' "packages/${package}/package.json"

  echo "✅ Fixed ${package}"
done

echo "🎉 All packages fixed!"
