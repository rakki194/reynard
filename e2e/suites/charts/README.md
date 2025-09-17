# Chart Components E2E Tests

This directory contains comprehensive End-to-End (E2E) tests for Reynard chart components using Playwright. These tests replace the previous Vitest unit tests that were causing SolidJS client-only API issues.

## Test Suites

### 1. `chart-components.spec.ts`

**Comprehensive component testing for all chart types**

- **BarChart**: Basic rendering, horizontal bars, stacked bars, loading/empty/error states
- **LineChart**: Basic rendering, stepped lines, multiple datasets
- **PieChart**: Basic rendering, doughnut variant, single data points, zero values
- **TimeSeriesChart**: Time series data, large datasets, unsorted timestamps
- **Accessibility**: ARIA labels, keyboard navigation
- **Responsiveness**: Different screen sizes, aspect ratio maintenance
- **Performance**: Large datasets, rapid data updates

### 2. `chart-accessibility.spec.ts`

**Comprehensive accessibility testing**

- **ARIA Labels**: Proper labeling for all chart types
- **Keyboard Navigation**: Arrow keys, Home/End, Enter/Space
- **Screen Reader**: Screen reader only content, live regions
- **Visual Accessibility**: Color contrast, focus indicators
- **Focus Management**: Proper focus handling
- **Responsive Accessibility**: Mobile and tablet accessibility

### 3. `chart-performance.spec.ts`

**Performance and stress testing**

- **Rendering Performance**: Small, medium, large datasets
- **Memory Usage**: Memory leaks, cleanup, garbage collection
- **Data Update Performance**: Quick updates, rapid changes
- **Animation Performance**: FPS monitoring, smooth animations
- **Responsive Performance**: Mobile viewport, viewport changes
- **Stress Testing**: Maximum dataset sizes, concurrent operations

## Running the Tests

### Run All Chart Tests

```bash
cd /home/kade/runeset/reynard/e2e
npm run test -- suites/charts/
```

### Run Specific Test Suite

```bash
# Component tests
npm run test -- suites/charts/chart-components.spec.ts

# Accessibility tests
npm run test -- suites/charts/chart-accessibility.spec.ts

# Performance tests
npm run test -- suites/charts/chart-performance.spec.ts
```

### Run with Different Options

```bash
# Headed mode (see browser)
npm run test -- suites/charts/ --headed

# Debug mode
npm run test -- suites/charts/ --debug

# UI mode
npm run test -- suites/charts/ --ui
```

## Test Data

The tests use realistic test data that mimics real-world usage:

- **Bar Chart Data**: Quarterly revenue and expenses
- **Line Chart Data**: Time series with multiple datasets
- **Pie Chart Data**: Device usage distribution
- **Time Series Data**: Timestamped data points with labels

## Performance Benchmarks

The performance tests establish benchmarks for:

- **Small Datasets** (100 points): < 2 seconds render time
- **Medium Datasets** (1,000 points): < 5 seconds render time
- **Large Datasets** (5,000 points): < 10 seconds render time
- **Maximum Datasets** (10,000 points): < 15 seconds render time
- **Memory Usage**: < 50MB increase for repeated renders
- **Update Performance**: < 1 second for data updates
- **FPS**: > 30 FPS during animations

## Accessibility Standards

The accessibility tests ensure compliance with:

- **WCAG 2.1 AA**: Color contrast, keyboard navigation
- **ARIA 1.1**: Proper labeling and descriptions
- **Section 508**: Screen reader compatibility
- **Mobile Accessibility**: Touch and keyboard support

## Browser Support

Tests run on:

- **Chromium**: Primary testing browser
- **Firefox**: Cross-browser compatibility
- **WebKit**: Safari compatibility
- **Mobile**: iOS Safari, Android Chrome

## Integration with CI/CD

These tests integrate with the existing E2E framework:

- **Playwright Reports**: HTML and JSON reports
- **Screenshots**: On failure capture
- **Videos**: On failure recording
- **Traces**: Performance analysis
- **Parallel Execution**: Multiple workers

## Migration from Vitest

This E2E test suite replaces the following Vitest tests that were removed:

- `BarChart.simple.test.tsx`
- `LineChart.simple.test.tsx`
- `PieChart.simple.test.tsx`
- `TimeSeriesChart.simple.test.tsx`
- `integration.test.tsx`

### Benefits of E2E Approach

1. **Real Browser Environment**: Tests run in actual browsers
2. **No Mocking Issues**: No SolidJS client-only API problems
3. **Comprehensive Testing**: Full user workflows
4. **Performance Monitoring**: Real performance metrics
5. **Accessibility Testing**: Actual screen reader testing
6. **Cross-Browser**: Multiple browser testing

## Maintenance

### Adding New Tests

1. Create test in appropriate spec file
2. Use existing test data patterns
3. Follow accessibility guidelines
4. Include performance considerations
5. Update this README

### Updating Test Data

1. Modify data generators in test files
2. Ensure realistic data patterns
3. Test with various data sizes
4. Verify accessibility with new data

### Performance Tuning

1. Monitor benchmark results
2. Adjust performance thresholds
3. Optimize test execution time
4. Update memory usage limits

## Troubleshooting

### Common Issues

1. **Timeout Errors**: Increase timeout for large datasets
2. **Memory Issues**: Reduce dataset size or add cleanup
3. **Flaky Tests**: Add proper waits and assertions
4. **Browser Issues**: Update Playwright version

### Debug Mode

Use debug mode to step through tests:

```bash
npm run test -- suites/charts/ --debug
```

### Trace Analysis

View detailed traces:

```bash
npm run test -- suites/charts/ --trace on
npm run test:report
```

## Contributing

When contributing to chart E2E tests:

1. Follow existing patterns and structure
2. Include both positive and negative test cases
3. Test accessibility and performance
4. Update documentation
5. Ensure tests are deterministic and reliable

---

_Created by 🦊 The Cunning Fox - Reynard E2E Testing Framework_
