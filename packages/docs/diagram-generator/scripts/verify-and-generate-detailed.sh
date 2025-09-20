#!/bin/bash

# 🦊 Comprehensive Diagram Generation and Verification Script
# 
# This script generates detailed ecosystem diagrams and verifies their accuracy
# against the real codebase, providing comprehensive analysis and validation.

set -e

echo "🐉 Comprehensive Diagram Generation and Verification System"
echo "=========================================================="

# Navigate to the diagram generator package
cd "$(dirname "$0")/.."

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in diagram-generator package directory"
    exit 1
fi

# Create diagrams directory if it doesn't exist
mkdir -p diagrams

echo "📊 Running comprehensive analysis and verification..."
echo ""

# Run the comprehensive verification and generation
npx tsx verify-and-generate-detailed.ts

echo ""
echo "✅ Comprehensive analysis complete!"
echo "📁 Check the 'diagrams/' directory for all generated files:"
echo "   📄 detailed-ecosystem-analysis.mmd - Detailed ecosystem diagram"
echo "   📄 verification-report.json - Accuracy verification report"
echo "   📄 architecture-overview.mmd - Architecture overview"
echo "   📄 package-dependencies.mmd - Package dependencies"
echo "   📄 component-relationships.mmd - Component relationships"
echo "   📄 frontend-backend-relationships.mmd - Frontend-backend relationships"
echo ""
echo "🎯 All diagrams have been generated and verified for accuracy!"
