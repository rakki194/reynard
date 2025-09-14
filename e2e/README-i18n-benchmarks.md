# I18n Performance Benchmarking Suite

🦦 *splashes with benchmarking enthusiasm* Comprehensive performance benchmarking suite for comparing different internationalization (i18n) approaches in the Reynard framework.

## Overview

This benchmarking suite provides detailed performance analysis comparing:

- **Hardcoded strings** vs **i18n implementations**
- **Different i18n rendering approaches** (static, dynamic, cached, namespace-based)
- **Bundle size impact** of i18n implementations
- **Memory usage patterns** across different approaches
- **Language switching performance**
- **Pluralization and RTL support performance**

## Test Suites

### 1. Core I18n Benchmarks (`i18n-benchmark.spec.ts`)

Comprehensive performance testing including:

- Hardcoded strings baseline performance
- Dynamic i18n loading performance
- Language switching performance
- Cached vs uncached i18n comparison
- Memory usage analysis
- Bundle size impact analysis
- RTL language performance
- Pluralization performance

### 2. Rendering Approaches (`i18n-rendering-approaches.spec.ts`)

Compares different i18n rendering strategies:

- **Hardcoded Strings**: Baseline with no i18n overhead
- **Static I18n**: All translations loaded at build time
- **Dynamic I18n**: Translations loaded on-demand
- **Cached I18n**: Intelligent caching with preloading
- **Namespace I18n**: Modular loading by feature/namespace

### 3. Bundle Analysis (`i18n-bundle-analysis.spec.ts`)

Detailed bundle size analysis:

- Bundle composition analysis
- I18n overhead measurement
- Language-specific bundle sizes
- Compression effectiveness
- Loading strategy comparison

## Configuration

### Benchmark Configuration

```typescript
const benchmarkConfig = {
  testLanguages: ['en', 'ja', 'fr', 'ru', 'zh', 'ar'],
  testIterations: 10,
  warmupIterations: 3,
  performanceThresholds: {
    maxLoadTime: 1000,        // 1 second
    maxRenderTime: 100,       // 100ms
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    maxLanguageSwitchTime: 500, // 500ms
    maxPluralizationTime: 50,   // 50ms
  },
};
```

### Performance Thresholds

- **Load Time**: < 1000ms
- **Render Time**: < 100ms
- **Memory Usage**: < 50MB
- **Language Switch Time**: < 500ms
- **Pluralization Time**: < 50ms

## Running the Benchmarks

### Prerequisites

1. Ensure the i18n demo and basic app examples are running:

   ```bash
   # Terminal 1: Backend
   cd backend && ./start.sh
   
   # Terminal 2: I18n Demo
   cd examples/i18n-demo && pnpm run dev
   
   # Terminal 3: Basic App
   cd examples/basic-app && pnpm run dev
   ```

2. Install Playwright browsers:

   ```bash
   cd e2e
   pnpm run install:browsers
   ```

### Running Individual Test Suites

```bash
# Core i18n benchmarks
pnpm run benchmark:i18n

# Rendering approaches comparison
pnpm run benchmark:i18n:rendering

# Bundle size analysis
pnpm run benchmark:i18n:bundles

# All benchmarks
pnpm run benchmark:i18n:all
```

### Running with Different Options

```bash
# Run with UI for debugging
pnpm run test:i18n:ui

# Run in headed mode to see browser
pnpm run test:i18n:headed

# Run in debug mode
pnpm run test:i18n:debug

# Generate HTML report
pnpm run test:i18n:report
```

## Understanding the Results

### Performance Metrics

Each benchmark measures:

- **Load Time**: Time to load and initialize the application
- **Render Time**: Time to render translated content
- **Memory Usage**: JavaScript heap memory consumption
- **Language Switch Time**: Time to switch between languages
- **Pluralization Time**: Time to process pluralization rules
- **Bundle Size**: Total size of loaded resources
- **Cache Hit Rate**: Effectiveness of caching mechanisms

### Report Generation

The benchmarks generate comprehensive reports including:

1. **Performance Reports**: Detailed metrics for each approach
2. **Comparison Tables**: Side-by-side performance comparisons
3. **Bundle Analysis**: Size and composition analysis
4. **Recommendations**: Optimization suggestions based on results

### Sample Output

```
## Hardcoded Strings Performance Report

### Metrics
- Load Time: 245.67ms
- Render Time: 12.34ms
- Memory Usage: 15.23MB
- Bundle Size: 125.45KB

### Status
✅ All performance metrics within acceptable thresholds

## Dynamic I18n Performance Report

### Metrics
- Load Time: 456.78ms
- Render Time: 23.45ms
- Memory Usage: 28.67MB
- Bundle Size: 234.56KB
- Language Switch Time: 123.45ms
- Pluralization Time: 8.90ms

### Status
✅ All performance metrics within acceptable thresholds
```

## Key Findings

### Performance Characteristics

1. **Hardcoded Strings**: Fastest load and render times, lowest memory usage
2. **Static I18n**: Good performance with all translations pre-loaded
3. **Dynamic I18n**: Balanced performance with on-demand loading
4. **Cached I18n**: Excellent performance after initial load
5. **Namespace I18n**: Good for large applications with modular loading

### Bundle Size Impact

- I18n typically adds 10-25% to bundle size
- Dynamic loading reduces initial bundle size
- Caching improves subsequent load performance
- Tree-shaking eliminates unused translations

### Memory Usage Patterns

- I18n systems use 2-3x more memory than hardcoded strings
- Memory usage scales with number of loaded languages
- Caching reduces memory fragmentation
- Garbage collection patterns vary by approach

## Optimization Recommendations

### For Maximum Performance

- Use hardcoded strings for single-language applications
- Implement aggressive caching for i18n systems
- Use tree-shaking to eliminate unused translations

### For Large Applications

- Use namespace-based loading to reduce initial bundle size
- Implement lazy loading for less common languages
- Consider CDN delivery for translation files

### For Dynamic Content

- Use dynamic i18n with intelligent preloading
- Implement background loading for likely language switches
- Cache frequently used translations in memory

## Troubleshooting

### Common Issues

1. **Tests failing due to timeouts**:
   - Ensure all example apps are running
   - Check network connectivity
   - Increase timeout values in configuration

2. **Memory usage exceeding thresholds**:
   - Check for memory leaks in test setup
   - Ensure proper cleanup between tests
   - Consider reducing test iterations

3. **Bundle size analysis failing**:
   - Ensure network requests are being captured
   - Check that translation files are being loaded
   - Verify browser performance API is available

### Debug Mode

Run tests in debug mode to step through issues:

```bash
pnpm run test:i18n:debug
```

This opens the Playwright debugger where you can:

- Step through test execution
- Inspect network requests
- Monitor performance metrics
- Debug memory usage

## Contributing

When adding new benchmarks:

1. Follow the existing test structure
2. Include comprehensive performance metrics
3. Add appropriate assertions for thresholds
4. Generate detailed reports
5. Update this README with new findings

## Architecture

The benchmarking suite uses:

- **Playwright**: Browser automation and performance testing
- **Performance API**: Native browser performance measurement
- **Custom Helpers**: Reusable benchmark utilities
- **Report Generation**: Automated report creation
- **Threshold Validation**: Performance requirement checking

---

*🦦 Splashing with performance testing precision - Making i18n performance measurable and optimizable!*
