#!/bin/bash

# Component Rendering Benchmark Demo Script
#
# This script demonstrates how to run the Reynard component rendering benchmarks
# and view the results.
#
# @author Pool-Theorist-35 (Reynard Otter Specialist)
# @since 1.0.0

set -e

echo "🦦 Reynard Component Rendering Benchmark Demo"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "suites/benchmark" ]]; then
    echo "❌ Error: Please run this script from the e2e directory"
    echo "   cd e2e && ./scripts/run-benchmark-demo.sh"
    exit 1
fi

# Check if dependencies are installed
if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo ""
fi

# Check if Playwright browsers are installed
echo "🔍 Checking Playwright browsers..."
if ! pnpm exec playwright --version > /dev/null 2>&1; then
    echo "📦 Installing Playwright browsers..."
    pnpm exec playwright install
    echo ""
fi

echo "🚀 Starting benchmark demo..."
echo ""

# Create results directory
mkdir -p results/benchmark-demo

# Run a quick benchmark demo (limited scope)
echo "Running quick benchmark demo (primitives only, 10 components)..."
echo ""

pnpm exec playwright test \
    --config=configs/playwright.config.benchmark.ts \
    --grep "primitives.*10 components" \
    --reporter=list \
    --output-dir=results/benchmark-demo

echo ""
echo "📊 Benchmark Results:"
echo "===================="

# Display results if they exist
if [[ -f "results/benchmark-demo/benchmark-results.json" ]]; then
    echo "✅ Benchmark completed successfully!"
    echo ""
    echo "Results saved to:"
    echo "  - results/benchmark-demo/benchmark-results.json"
    echo "  - results/benchmark-demo/benchmark-summary.md"
    echo ""

    # Show summary if available
    if [[ -f "results/benchmark-demo/benchmark-summary.md" ]]; then
        echo "📋 Summary:"
        cat results/benchmark-demo/benchmark-summary.md
    fi
else
    echo "⚠️  No results found. This might be expected for a demo run."
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "To run the full benchmark suite:"
echo "  pnpm run benchmark:components"
echo ""
echo "To run with visual debugging:"
echo "  pnpm run benchmark:components:headed"
echo ""
echo "To view detailed reports:"
echo "  pnpm run benchmark:components:report"
echo ""
echo "To run specific component categories:"
echo "  pnpm exec playwright test --config=configs/playwright.config.benchmark.ts --grep 'primitives'"
echo "  pnpm exec playwright test --config=configs/playwright.config.benchmark.ts --grep 'layouts'"
echo "  pnpm exec playwright test --config=configs/playwright.config.benchmark.ts --grep 'data'"
echo "  pnpm exec playwright test --config=configs/playwright.config.benchmark.ts --grep 'overlays'"
echo ""
echo "🦦 *splashes with satisfaction* Demo complete!"
echo ""
echo "For more information, see:"
echo "  - e2e/suites/benchmark/README.md"
echo "  - e2e/configs/playwright.config.benchmark.ts"
echo ""
