#!/bin/bash

# 🦊 Frontend-Backend Relationship Diagram Generator Script
# 
# This script generates a comprehensive Mermaid diagram showing
# the relationships between frontend packages and backend services.

set -e

echo "🐉 Generating Frontend-Backend Relationship Diagram..."

# Navigate to the diagram generator package
cd "$(dirname "$0")/.."

# Ensure we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: Not in diagram-generator package directory"
    exit 1
fi

# Create diagrams directory if it doesn't exist
mkdir -p diagrams

# Run the diagram generation
echo "📊 Analyzing codebase and generating diagram..."
npx tsx src/cli/generate-frontend-backend-diagram.ts

echo "✅ Frontend-Backend relationship diagram generated successfully!"
echo "📁 Check the 'diagrams/' directory for output files"