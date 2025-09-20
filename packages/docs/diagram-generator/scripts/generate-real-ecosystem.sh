#!/bin/bash

# 🦊 Real Ecosystem Frontend-Backend Relationship Diagram Generator Script
# 
# This script generates a comprehensive Mermaid diagram showing
# the relationships between ALL frontend packages and backend services
# in the actual Reynard ecosystem.

set -e

echo "🐉 Generating Real Reynard Ecosystem Diagram..."

# Navigate to the diagram generator package
cd "$(dirname "$0")/.."

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in diagram-generator package directory"
    exit 1
fi

# Create diagrams directory if it doesn't exist
mkdir -p diagrams

# Run the real ecosystem diagram generation
echo "📊 Analyzing real codebase and generating comprehensive diagram..."
npx tsx generate-real-ecosystem.ts

echo "✅ Real ecosystem diagram generated successfully!"
echo "📁 Check the 'diagrams/' directory for output files"
echo "📄 Main file: diagrams/real-ecosystem-relationships.mmd"
