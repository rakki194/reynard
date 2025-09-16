# Component Rendering Benchmark Suite

🦦 _splashes with enthusiasm_ Comprehensive performance testing framework for Reynard components across different rendering approaches!

## Overview

This benchmark suite tests the performance of Reynard components using different rendering strategies and provides detailed analysis of which approach works best for each component category.

## Features

### 🎯 Component Categories Tested

- **Primitives**: Button, Card, TextField, Checkbox, Select
- **Layouts**: AppLayout, Grid, GridItem, Flex, Stack
- **Data**: DataTable, Charts, Gallery, List, Tree
- **Overlays**: Modal, Drawer, FloatingPanel, Tooltip, Popover

### 🚀 Rendering Approaches

- **CSR (Client-Side Rendering)**: Traditional React/SolidJS rendering
- **SSR (Server-Side Rendering)**: Pre-rendered on server
- **Lazy Loading**: Components loaded on-demand
- **Virtual Scrolling**: Efficient rendering of large lists
- **Static Generation**: Pre-built static components

### 📊 Performance Metrics

- **Render Time**: Time to render components
- **Memory Usage**: Memory consumption during rendering
- **Bundle Size**: Component bundle sizes
- **First Paint**: Time to first visual content
- **First Contentful Paint**: Time to meaningful content

## Quick Start

### Run All Benchmarks

```bash
# Run complete benchmark suite
pnpm run benchmark:components

# Run with visual debugging
pnpm run benchmark:components:headed

# Run with interactive UI
pnpm run benchmark:components:ui
```

### Run Specific Tests

```bash
# Run only primitive components
pnpm exec playwright test --config=configs/playwright.config.benchmark.ts --grep "primitives"

# Run only CSR approach
pnpm exec playwright test --config=configs/playwright.config.benchmark.ts --grep "csr"

# Run specific component count
pnpm exec playwright test --config=configs/playwright.config.benchmark.ts --grep "100 components"
```

## Configuration

### Benchmark Parameters

The benchmark suite can be configured in `component-rendering-benchmark.spec.ts`:

```typescript
const BENCHMARK_CONFIG: BenchmarkConfig = {
  iterations: 10, // Number of benchmark runs
  warmupRuns: 3, // Warmup runs before measurement
  componentCounts: [1, 10, 50, 100, 500], // Component counts to test
  renderingApproaches: ["csr", "ssr", "lazy", "virtual", "static"],
};
```

### Environment Settings

Performance can be affected by:

- **CPU Throttling**: Disabled for consistent results
- **Hardware Acceleration**: Disabled for consistent results
- **Animations**: Reduced motion enabled
- **Service Workers**: Blocked for consistent results

## Results and Reports

### Generated Reports

After running benchmarks, you'll find:

- `results/benchmark-results/` - HTML test reports
- `results/benchmark-results.json` - Raw benchmark data
- `results/benchmark-summary.md` - Human-readable summary
- `results/benchmark-recommendations.json` - Performance recommendations

### Viewing Results

```bash
# View HTML report
pnpm run benchmark:components:report

# View summary report
cat results/benchmark-summary.md

# View recommendations
cat results/benchmark-recommendations.json
```

## Understanding Results

### Performance Categories

**🏆 Best Performance**: Fastest render times
**💾 Memory Efficient**: Lowest memory usage
**📦 Bundle Optimized**: Smallest bundle sizes
**⚡ Scalable**: Best performance with large component counts

### Typical Results

Based on our testing, here are the typical best approaches:

- **Primitives**: CSR - Fastest for simple components
- **Layouts**: SSR - Better initial load performance
- **Data**: Virtual - Scales best with large datasets
- **Overlays**: Lazy - Optimal for on-demand rendering

### Regression Detection

The benchmark suite automatically detects performance regressions by comparing with baseline results. Look for:

- ⚠️ **Performance Regression**: >10% slower than baseline
- 🚨 **Memory Regression**: >20% more memory usage
- 📈 **Bundle Regression**: >5% larger bundle size

## Advanced Usage

### Custom Component Testing

To add your own components to the benchmark:

1. **Add to ComponentCategory**:

```typescript
const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    name: "custom",
    components: ["MyComponent", "AnotherComponent"],
    description: "Custom components for testing",
  },
];
```

2. **Implement Rendering Logic**:

```typescript
// In component-renderer.ts
static generateCustom(index: number): HTMLElement {
  const component = document.createElement('div');
  component.className = 'my-custom-component';
  component.textContent = `Custom Component ${index}`;
  return component;
}
```

### Performance Profiling

For detailed performance analysis:

```bash
# Run with tracing enabled
pnpm exec playwright test --config=configs/playwright.config.benchmark.ts --trace on

# Analyze traces
pnpm exec playwright show-trace results/benchmark-artifacts/
```

### CI Integration

Add to your CI pipeline:

```yaml
# .github/workflows/benchmark.yml
- name: Run Component Benchmarks
  run: |
    cd e2e
    pnpm run benchmark:components

- name: Check for Regressions
  run: |
    # Compare with baseline results
    node scripts/check-regressions.js
```

## Troubleshooting

### Common Issues

**Tests Timing Out**:

- Increase timeout in `playwright.config.benchmark.ts`
- Check if benchmark server is running
- Verify component rendering is completing

**Inconsistent Results**:

- Ensure single worker mode (`workers: 1`)
- Disable hardware acceleration
- Run on dedicated benchmark machine

**Memory Issues**:

- Reduce component counts in config
- Increase Node.js memory limit: `--max-old-space-size=4096`
- Check for memory leaks in components

### Debug Mode

```bash
# Run with debug output
pnpm run benchmark:components:debug

# Run specific test in debug mode
pnpm exec playwright test --config=configs/playwright.config.benchmark.ts --debug --grep "primitives-csr-10"
```

## Contributing

### Adding New Rendering Approaches

1. **Implement in ComponentRenderer**:

```typescript
async renderNewApproach(category: ComponentCategory, count: number): Promise<void> {
  // Implementation here
}
```

2. **Add to Benchmark Config**:

```typescript
renderingApproaches: ["csr", "ssr", "lazy", "virtual", "static", "newApproach"];
```

3. **Update Test Logic**:

```typescript
case 'newApproach':
  await this.renderNewApproach(category, count);
  break;
```

### Performance Improvements

- **Optimize Component Generation**: Faster component creation
- **Reduce Test Overhead**: Minimize setup/teardown time
- **Parallel Testing**: Run independent tests in parallel
- **Caching**: Cache rendered components for reuse

## Best Practices

### Benchmark Design

- **Consistent Environment**: Same hardware, same conditions
- **Multiple Iterations**: Run tests multiple times for accuracy
- **Warmup Runs**: Allow JIT compilation to complete
- **Statistical Analysis**: Use proper statistical methods

### Result Interpretation

- **Focus on Trends**: Look for patterns across component counts
- **Consider Context**: Different approaches suit different use cases
- **Monitor Regressions**: Set up alerts for performance drops
- **Document Findings**: Keep track of performance characteristics

## Resources

- [Playwright Performance Testing](https://playwright.dev/docs/test-performance)
- [Web Performance Best Practices](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [SolidJS Performance Guide](https://www.solidjs.com/guides/performance)

---

🦦 _splashes with satisfaction_ Happy benchmarking! Remember, the best approach depends on your specific use case. Use these benchmarks as a guide, but always test with your actual data and user scenarios.
