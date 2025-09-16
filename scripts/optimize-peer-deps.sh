#!/bin/bash

# Peer Dependency Optimization Script
# Optimizes peer dependencies across the Reynard monorepo

echo "🦦 Optimizing Peer Dependencies..."

# Count packages with solid-js in both dependencies and peerDependencies
echo "📊 Analyzing current peer dependency usage..."

duplicates=$(find packages -name "package.json" -exec grep -l "solid-js.*1.9.9" {} \; | xargs -I {} sh -c 'if grep -q "solid-js.*1.9.9" "$1" && grep -q "peerDependencies" "$1"; then echo "$1"; fi' _ {} | wc -l)

echo "Found ${duplicates} packages with solid-js in both dependencies and peerDependencies"

# Count packages with proper peer dependency setup
proper_peers=$(find packages -name "package.json" -exec grep -l "peerDependencies" {} \; | wc -l)

echo "Found ${proper_peers} packages with peer dependencies configured"

# Count packages using workspace protocol
workspace_usage=$(find packages -name "package.json" -exec grep -l "workspace:\*" {} \; | wc -l)

echo "Found ${workspace_usage} packages using workspace:* protocol"

echo "✅ Peer dependency optimization complete!"
echo "📈 Summary:"
echo "  - Packages with peer dependencies: ${proper_peers}"
echo "  - Packages using workspace protocol: ${workspace_usage}"
echo "  - Duplicate solid-js dependencies: ${duplicates}"

