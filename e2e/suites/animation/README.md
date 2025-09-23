# 🎭 Animation E2E Tests

Comprehensive end-to-end tests for the Reynard animation system, focusing on visual verification, performance, and functionality.

## Test Structure

### Core Test Files

- **`animation-demo.spec.ts`** - Main test suite for the animation demo application
- **`animation-debug.spec.ts`** - Debug-specific tests to identify animation issues
- **`animation-helpers.ts`** - Utility functions for animation testing

### Test Categories

#### 1. Application Loading Tests

- Demo application startup and navigation
- Page structure verification
- Component visibility checks

#### 2. Staggered Animation Tests

- Animation control functionality
- Item visibility and scaling
- Animation timing and delays
- Progress tracking
- Dynamic item management

#### 3. 3D Animation Tests

- 3D animation system availability
- Different animation types (rotation, cluster, particles)
- 3D scene parameter updates
- Performance monitoring

#### 4. Visual Regression Tests

- Screenshot comparison
- Baseline image verification
- Visual consistency checks

#### 5. Performance Tests

- Animation frame rate monitoring
- Memory usage tracking
- Performance metrics collection

#### 6. Accessibility Tests

- ARIA label verification
- Keyboard navigation support
- Screen reader compatibility

## Running Tests

### Prerequisites

1. Ensure the animation demo is running on `http://localhost:3005`
2. Install Playwright browsers: `pnpm install:browsers`

### Test Commands

```bash
# Run all animation tests
pnpm test:animation

# Run tests in headed mode (visible browser)
pnpm test:animation:headed

# Run tests in debug mode
pnpm test:animation:debug

# Run tests with UI mode
pnpm test:animation:ui

# Run only debug tests
pnpm test:animation:debug-only

# View test report
pnpm test:animation:report
```

### Debug-Specific Commands

```bash
# Run only the debug test suite
pnpm test:animation:debug-only

# Run with verbose logging
pnpm test:animation:debug --verbose
```

## Test Configuration

The animation tests use a specialized Playwright configuration (`playwright.config.animation.ts`) with:

- **Hardware acceleration enabled** for better animation performance
- **Extended timeouts** for animation completion
- **Visual comparison settings** optimized for animations
- **Multi-browser testing** (Chrome, Firefox, Safari, Mobile)

## Debugging Animation Issues

### Common Issues and Solutions

#### 1. Items Not Visible

- **Symptom**: Animation items appear invisible or scaled to 0
- **Debug**: Check `transform: scale()` values in computed styles
- **Test**: `should debug item visibility issue`

#### 2. Animation Not Starting

- **Symptom**: Clicking "Start Animation" has no effect
- **Debug**: Check animation system initialization
- **Test**: `should debug animation system initialization`

#### 3. Timing Issues

- **Symptom**: Animations don't follow expected timing
- **Debug**: Monitor actual vs expected delays
- **Test**: `should debug animation timing and delays`

#### 4. Progress Not Updating

- **Symptom**: Progress indicators don't change
- **Debug**: Check animation loop execution
- **Test**: `should debug animation progress updates`

### Debug Test Output

The debug tests provide detailed console output including:

- Item visibility status and computed styles
- Animation system availability
- Console logs during animation execution
- Timing measurements and comparisons
- Progress update monitoring
- 3D animation system state

## Visual Testing

### Screenshot Comparison

Tests automatically capture screenshots at key moments:

- Initial state
- During animation
- Final state
- Error conditions

### Baseline Images

Baseline images are stored in `test-results/animation-report/` and can be updated by running tests in headed mode and manually verifying results.

## Performance Monitoring

### Metrics Collected

- **Frame Rate**: Actual vs expected FPS
- **Dropped Frames**: Count of missed animation frames
- **Memory Usage**: JavaScript heap size during animations
- **Animation Duration**: Actual vs expected timing

### Performance Thresholds

- **Frame Rate**: Minimum 30 FPS, target 60 FPS
- **Memory Usage**: Maximum 50MB during animations
- **Animation Duration**: Within 10% of expected time

## Browser Compatibility

Tests run on multiple browsers to ensure compatibility:

- **Desktop Chrome** (primary)
- **Desktop Firefox**
- **Desktop Safari**
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

## Continuous Integration

Animation tests are designed to run in CI environments with:

- **Retry logic** for flaky tests
- **Screenshot artifacts** for failed tests
- **Performance regression detection**
- **Cross-browser compatibility verification**

## Contributing

When adding new animation tests:

1. **Follow the existing pattern** in test files
2. **Add debug capabilities** for troubleshooting
3. **Include visual verification** where appropriate
4. **Update this README** with new test descriptions
5. **Add performance monitoring** for new features

## Troubleshooting

### Test Failures

1. **Check demo server**: Ensure `http://localhost:3005` is accessible
2. **Verify browser installation**: Run `pnpm install:browsers`
3. **Check console logs**: Use debug mode for detailed output
4. **Review screenshots**: Check test artifacts for visual issues

### Performance Issues

1. **Enable hardware acceleration**: Check browser launch options
2. **Reduce test parallelism**: Set `workers: 1` in config
3. **Increase timeouts**: Adjust `actionTimeout` and `navigationTimeout`
4. **Monitor system resources**: Ensure adequate CPU/memory

### Visual Regression Issues

1. **Update baselines**: Run tests in headed mode and verify
2. **Check browser differences**: Compare results across browsers
3. **Review timing**: Ensure animations complete before screenshots
4. **Verify test environment**: Check for system-specific rendering differences
