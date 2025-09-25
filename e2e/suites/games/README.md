# 🎮 Games Demo E2E Tests

Comprehensive end-to-end tests for the Reynard Games Demo application, covering game functionality, performance, user interactions, and cross-browser compatibility.

## 📋 Test Coverage

### 🎯 Main Application Tests (`games-demo.spec.ts`)

- **Main Menu Navigation**: Game selection, UI components, theme toggle
- **Responsive Design**: Mobile, tablet, and desktop viewports
- **Accessibility**: ARIA attributes, keyboard navigation, screen reader support
- **Error Handling**: Invalid navigation, network errors, graceful degradation
- **Performance**: Loading times, resource optimization, network efficiency

### 🏰 Rogue-like Game Tests (`roguelike-game.spec.ts`)

- **Game Initialization**: ECS system setup, component rendering
- **Game Mechanics**: Click interactions, keyboard input, mouse controls
- **ECS System**: Entity management, component updates, system interactions
- **Procedural Generation**: Dungeon layout generation, navigation testing
- **AI Systems**: Enemy behavior, interaction handling, AI responsiveness
- **Performance**: Extended gameplay, rapid input handling, memory management

### 🎲 3D Games Tests (`3d-games.spec.ts`)

- **3D Interface**: Game selection, score system, theme integration
- **Game Selection**: Multiple game switching, navigation controls
- **Individual Games**: Cube Collector, Space Shooter, Maze Explorer, Particle Demo
- **Three.js Integration**: WebGL context, 3D rendering, graphics performance
- **Game Navigation**: Back to menu, game switching, state management
- **Performance**: 3D rendering efficiency, multiple game instances

### ⚡ Performance Tests (`games-performance.spec.ts`)

- **Loading Performance**: Page load times, game initialization, resource loading
- **Rendering Performance**: DOM updates, game rendering, 3D graphics
- **Memory Performance**: Memory leaks, garbage collection, memory growth
- **Interaction Performance**: Rapid clicks, keyboard input, mouse movement
- **Network Performance**: Resource loading, error handling, optimization
- **Responsive Performance**: Viewport changes, mobile optimization
- **Stress Testing**: Extended gameplay, multiple game switches, system limits

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
cd /home/kade/runeset/reynard/e2e
pnpm install

# Install Playwright browsers
pnpm exec playwright install
```

### Running Tests

#### Basic Test Execution

```bash
# Run all games tests
pnpm run test:games

# Run with visible browser
pnpm run test:games:headed

# Run with Playwright UI
pnpm run test:games:ui

# Run in debug mode
pnpm run test:games:debug
```

#### Specific Test Suites

```bash
# Main application tests
pnpm run test:games:main

# Rogue-like game tests
pnpm run test:games:roguelike

# 3D games tests
pnpm run test:games:3d

# Performance tests
pnpm run test:games:performance
```

#### Browser-Specific Tests

```bash
# Chrome/Chromium
pnpm run test:games:chromium

# Firefox
pnpm run test:games:firefox

# Safari/WebKit
pnpm run test:games:webkit

# Mobile Chrome
pnpm run test:games:mobile
```

#### Advanced Test Runner

```bash
# Use the comprehensive test runner
./scripts/run-games-tests.sh

# Run with specific options
./scripts/run-games-tests.sh --headed --browser firefox
./scripts/run-games-tests.sh --performance --report
./scripts/run-games-tests.sh --stress --debug
```

## 🛠️ Test Configuration

### Playwright Configuration

The games tests use a specialized configuration (`playwright.config.games.ts`) with:

- **Extended Timeouts**: Longer timeouts for game loading and interactions
- **WebGL Support**: Enabled GPU acceleration and WebGL for 3D games
- **Game-Optimized Viewports**: Standard game resolutions (1280x720, 1920x1080)
- **Performance Monitoring**: Built-in performance metrics and thresholds
- **Cross-Browser Testing**: Chrome, Firefox, Safari, and mobile browsers

### Test Environment

- **Base URL**: `http://localhost:3002` (Games Demo application)
- **Viewport**: 1280x720 (standard game resolution)
- **Browser Features**: WebGL, GPU acceleration, hardware acceleration
- **Timeouts**: 60s test timeout, 15s assertion timeout, 45s navigation timeout

## 📊 Test Results and Reporting

### Viewing Results

```bash
# Show test report
pnpm run test:games:report

# Open latest report
pnpm exec playwright show-report
```

### Test Artifacts

- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed tests
- **Traces**: Detailed execution traces for debugging
- **Performance Metrics**: Loading times, memory usage, rendering performance

### Results Location

- **Test Results**: `test-results/` directory
- **Reports**: `playwright-report/` directory
- **Traces**: `test-results/*/trace.zip` files
- **Screenshots**: `test-results/*/screenshot.png` files

## 🎯 Test Scenarios

### Main Menu Testing

- ✅ Page loading and title verification
- ✅ Game selection cards display
- ✅ Feature tags and descriptions
- ✅ Technical features section
- ✅ Theme toggle functionality
- ✅ Footer and GitHub links
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessibility compliance

### Rogue-like Game Testing

- ✅ Game page navigation
- ✅ Game component rendering
- ✅ ECS system initialization
- ✅ Click and keyboard interactions
- ✅ Mouse controls and hover effects
- ✅ Procedural dungeon generation
- ✅ AI entity behavior
- ✅ Performance under load
- ✅ Memory management
- ✅ Error recovery

### 3D Games Testing

- ✅ 3D interface loading
- ✅ Score system functionality
- ✅ Game selection and switching
- ✅ Individual game mechanics
- ✅ Three.js WebGL integration
- ✅ 3D rendering performance
- ✅ Game navigation controls
- ✅ Cross-game compatibility

### Performance Testing

- ✅ Loading time benchmarks
- ✅ Rendering performance metrics
- ✅ Memory usage monitoring
- ✅ Interaction responsiveness
- ✅ Network optimization
- ✅ Mobile performance
- ✅ Stress testing scenarios

## 🔧 Troubleshooting

### Common Issues

#### Games Demo Server Not Running

```bash
# Start the games demo server manually
cd ../../examples/games-demo
pnpm dev

# Or use the test runner which starts it automatically
./scripts/run-games-tests.sh
```

#### WebGL/3D Rendering Issues

```bash
# Run with hardware acceleration
pnpm run test:games:chromium --headed

# Check WebGL support
pnpm exec playwright test --config=configs/playwright.config.games.ts --grep="WebGL"
```

#### Performance Test Failures

```bash
# Run performance tests with longer timeouts
pnpm run test:games:performance --timeout=120000

# Check system resources
./scripts/run-games-tests.sh --performance --headed
```

#### Browser Installation Issues

```bash
# Reinstall browsers
pnpm exec playwright install

# Install specific browser
pnpm exec playwright install chromium
```

### Debug Mode

```bash
# Run tests in debug mode
pnpm run test:games:debug

# Use Playwright UI for interactive debugging
pnpm run test:games:ui

# Run specific test in debug mode
pnpm exec playwright test --config=configs/playwright.config.games.ts --debug suites/games/games-demo.spec.ts
```

## 📈 Performance Benchmarks

### Expected Performance Thresholds

- **Page Load Time**: < 3 seconds (main menu), < 5 seconds (games)
- **Game Initialization**: < 2 seconds
- **Interaction Response**: < 100ms
- **Memory Growth**: < 20MB during gameplay
- **3D Rendering**: < 100ms per frame
- **Network Requests**: < 50 total requests

### Performance Monitoring

The tests automatically monitor and report:

- Loading times for all pages and games
- Rendering performance metrics
- Memory usage patterns
- Network request efficiency
- Interaction responsiveness
- Cross-browser performance differences

## 🎮 Game-Specific Testing

### Rogue-like Game Features

- **ECS Architecture**: Entity-component-system testing
- **Procedural Generation**: Dungeon layout verification
- **AI Systems**: Enemy behavior validation
- **Pixel Art Rendering**: Graphics quality checks
- **Line of Sight**: Vision system testing
- **Combat & Items**: Game mechanics validation

### 3D Games Features

- **Three.js Integration**: WebGL context and rendering
- **Multiple Games**: Cube Collector, Space Shooter, Maze Explorer, Particle Demo
- **3D Graphics**: Rendering performance and quality
- **Interactive Controls**: Mouse, keyboard, and touch input
- **Game Switching**: Seamless transitions between games

## 🔍 Continuous Integration

### CI/CD Integration

The games tests are designed to run in CI environments with:

- **Headless Mode**: Default for CI environments
- **Retry Logic**: Automatic retries for flaky tests
- **Parallel Execution**: Optimized for CI performance
- **Artifact Collection**: Screenshots, videos, and traces
- **Performance Reporting**: Automated performance regression detection

### GitHub Actions Example

```yaml
- name: Run Games E2E Tests
  run: |
    cd e2e
    pnpm install
    pnpm run test:games
    pnpm run test:games:report
```

## 📚 Additional Resources

- **Playwright Documentation**: <https://playwright.dev/>
- **Games Demo Application**: `/examples/games-demo/`
- **Reynard Framework**: `/packages/`
- **Test Configuration**: `/e2e/configs/playwright.config.games.ts`
- **Test Runner Script**: `/e2e/scripts/run-games-tests.sh`

---

🦊 _whiskers twitch with testing precision_ These comprehensive E2E tests ensure the Games Demo application provides an excellent user experience across all supported browsers and devices!
