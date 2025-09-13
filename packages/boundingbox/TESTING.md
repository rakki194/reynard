# BoundingBoxEditor Testing Guide

This document provides a comprehensive overview of the testing strategy and
implementation for the BoundingBoxEditor component and its related composables.

## Test Structure

The test suite is organized into several categories:

### 1. Component Tests (`BoundingBoxEditor.test.tsx`)

- **Purpose**: Unit tests for the main BoundingBoxEditor component
- **Coverage**: Component rendering, props handling, user interactions, configuration options
- **Key Areas**:
  - Component initialization and rendering
  - Label management and selection
  - Box management (add, edit, delete)
  - Event handling and callbacks
  - Configuration options
  - Error handling

### 2. Composable Tests

- **`useBoxResize.test.ts`**: Tests for the resize functionality
- **`useBoxMove.test.ts`**: Tests for the move functionality
- **Coverage**: State management, constraints, event handling, configuration

### 3. Integration Tests (`BoundingBoxEditor.integration.test.tsx`)

- **Purpose**: End-to-end user workflows and complex scenarios
- **Coverage**:
  - Complete user workflows (create, edit, delete)
  - Canvas interactions with Fabric.js
  - State synchronization
  - Performance testing
  - Error recovery

### 4. Accessibility Tests (`BoundingBoxEditor.accessibility.test.tsx`)

- **Purpose**: WCAG compliance and accessibility features
- **Coverage**:
  - ARIA labels and roles
  - Keyboard navigation
  - Screen reader compatibility
  - Focus management
  - Visual accessibility

## Test Configuration

### Dependencies

**Core Testing Stack:**

- **Vitest**: Test runner and assertion library
- **happy-dom**: Lightweight DOM environment (replacing jsdom)
- **reynard-testing**: Unified testing utilities and configurations
- **@solidjs/testing-library**: SolidJS component testing utilities

**Note:** This package uses the unified Reynard testing stack with happy-dom instead of jsdom for
better performance and reliability.

### Setup

The test setup (`src/test-setup.ts`) includes:

- Fabric.js mocking for canvas operations
- Custom DOM matchers compatible with happy-dom
- Global test configuration via reynard-testing

## Running Tests

### Available Scripts

```bash
# Run all tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

### Test Categories

```bash
# Run only component tests
npm run test -- --grep "BoundingBoxEditor"

# Run only composable tests
npm run test -- --grep "useBox"

# Run only integration tests
npm run test -- --grep "Integration"

# Run only accessibility tests
npm run test -- --grep "Accessibility"
```

## Test Coverage

### Current Coverage Areas

- ✅ Component rendering and initialization
- ✅ User interactions (click, keyboard)
- ✅ Event handling and callbacks
- ✅ Configuration options
- ✅ Error handling and edge cases
- ✅ Accessibility features
- ✅ Integration workflows
- ✅ Performance scenarios

### Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

## Mocking Strategy

### Fabric.js Mocking

The test suite includes comprehensive mocking for Fabric.js:

- Canvas operations (add, remove, clear, render)
- Event handling (mouse events, object selection)
- Object creation and manipulation
- Pointer and coordinate calculations

### Event Handler Mocking

All event handlers are mocked using Vitest's `vi.fn()` to:

- Track function calls and arguments
- Verify event propagation
- Test callback behavior

## Testing Patterns

### Component Testing

```typescript
// Render component with props
render(() => (
  <BoundingBoxEditor
    imageInfo={mockImageInfo}
    config={defaultConfig}
    eventHandlers={mockEventHandlers}
  />
));

// Assert component state
expect(screen.getByText('Bounding Boxes (0)')).toBeInTheDocument();

// Simulate user interaction
fireEvent.click(screen.getByRole('button', { name: /edit/i }));

// Verify event handling
await waitFor(() => {
  expect(mockEventHandlers.onEditingStart).toHaveBeenCalled();
});
```

### Composable Testing

```typescript
// Initialize composable
const resizeEngine = useBoxResize({
  minWidth: 10,
  minHeight: 10,
  maxWidth: 1920,
  maxHeight: 1080,
  onResizeStart: mockCallback,
});

// Test functionality
resizeEngine.startResize("box-1", "se", { x: 100, y: 100 });
expect(mockCallback).toHaveBeenCalledWith("box-1");
```

### Integration Testing

```typescript
// Test complete workflows
it("should handle complete box creation workflow", async () => {
  // Simulate canvas interactions
  fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
  fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
  fireEvent.mouseUp(canvas, { clientX: 200, clientY: 200 });

  // Verify end-to-end behavior
  await waitFor(() => {
    expect(mockEventHandlers.onAnnotationCreate).toHaveBeenCalled();
  });
});
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Keep tests focused on single responsibilities

### 2. Mocking

- Mock external dependencies (Fabric.js, DOM APIs)
- Use realistic mock data that matches production scenarios
- Reset mocks between tests to avoid interference

### 3. Assertions

- Use specific assertions that test the exact behavior
- Test both positive and negative cases
- Verify side effects and state changes

### 4. Async Testing

- Use `waitFor` for async operations
- Test loading states and error conditions
- Handle timing issues with proper async/await patterns

### 5. Accessibility Testing

- Test keyboard navigation paths
- Verify ARIA labels and roles
- Check focus management
- Test screen reader compatibility

## Common Issues and Solutions

### 1. Canvas Testing

**Issue**: Fabric.js canvas operations are difficult to test
**Solution**: Comprehensive mocking of Fabric.js APIs with realistic behavior

### 2. Event Timing

**Issue**: Canvas events may not fire in the expected order
**Solution**: Use `waitFor` and proper async/await patterns

### 3. State Synchronization

**Issue**: Component state may not update immediately
**Solution**: Test state changes with `waitFor` and verify final state

### 4. Mock Cleanup

**Issue**: Mocks may interfere between tests
**Solution**: Use `beforeEach` and `afterEach` to reset mocks

## Performance Testing

### Large Dataset Testing

```typescript
it('should handle large numbers of boxes efficiently', async () => {
  const manyBoxes = Array.from({ length: 100 }, (_, i) => ({
    ...mockBoundingBox,
    id: `box-${i}`,
    x: (i % 10) * 200,
    y: Math.floor(i / 10) * 200
  }));

  const startTime = performance.now();
  render(() => (
    <BoundingBoxEditor
      imageInfo={mockImageInfo}
      config={defaultConfig}
      eventHandlers={mockEventHandlers}
      initialBoxes={manyBoxes}
    />
  ));
  const endTime = performance.now();

  expect(endTime - startTime).toBeLessThan(1000);
});
```

### Rapid Interaction Testing

```typescript
it("should handle rapid user interactions", async () => {
  // Simulate rapid clicks
  for (let i = 0; i < 10; i++) {
    fireEvent.click(editButton);
    fireEvent.click(cancelButton);
  }

  // Should handle all interactions without errors
  expect(mockEventHandlers.onEditingStart).toHaveBeenCalledTimes(10);
});
```

## Continuous Integration

### GitHub Actions

The test suite is designed to run in CI environments:

- Fast execution with parallel test runs
- Comprehensive coverage reporting
- Linting and type checking integration

### Pre-commit Hooks

Recommended pre-commit hooks:

- Run tests before committing
- Check test coverage thresholds
- Lint test files

## Future Enhancements

### Planned Improvements

1. **Visual Regression Testing**: Screenshot comparisons for UI changes
2. **E2E Testing**: Full browser automation with Playwright
3. **Performance Benchmarking**: Automated performance regression detection
4. **Accessibility Auditing**: Automated WCAG compliance checking

### Test Data Management

- Centralized test data factories
- Realistic image data for testing
- Edge case data sets

## Contributing

### Adding New Tests

1. Follow the existing test structure and naming conventions
2. Add tests for new features and bug fixes
3. Ensure tests are deterministic and don't depend on external state
4. Update this documentation when adding new test categories

### Test Review Checklist

- [ ] Tests cover the main functionality
- [ ] Edge cases and error conditions are tested
- [ ] Accessibility features are verified
- [ ] Performance implications are considered
- [ ] Tests are maintainable and readable
- [ ] Mocking is appropriate and realistic
