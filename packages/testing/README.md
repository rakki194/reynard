# @reynard/testing

Unified testing framework for Reynard packages with comprehensive utilities, mocks, and configurations.

## Features

- **Unified Configuration**: Standardized Vitest configs for all package types
- **Test Utilities**: Common testing helpers and custom render functions
- **Comprehensive Mocks**: Browser APIs, SolidJS, and external libraries
- **Assertion Utilities**: Custom assertions for common testing scenarios
- **TypeScript First**: Full type safety with excellent IntelliSense

## Installation

```bash
npm install @reynard/testing --save-dev
```

## Quick Start

### 1. Use Pre-configured Vitest Configs

```typescript
// vitest.config.ts
import { createComponentTestConfig } from '@reynard/testing/config';

export default createComponentTestConfig('my-package');
```

### 2. Use Test Utilities

```typescript
// my-component.test.tsx
import { renderWithProviders, expectComponentToRender } from '@reynard/testing';

test('renders without errors', () => {
  const MyComponent = () => <div>Hello World</div>;
  expectComponentToRender(MyComponent);
});
```

### 3. Use Mocks

```typescript
// my-test.ts
import { mockFetch, mockLocalStorage } from '@reynard/testing/mocks';

test('uses fetch', async () => {
  mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: 'test' }) });
  
  const result = await fetch('/api/test');
  expect(result.ok).toBe(true);
});
```

## Configuration

### Base Configuration

```typescript
import { createBaseVitestConfig } from '@reynard/testing/config';

export default createBaseVitestConfig({
  packageName: 'my-package',
  setupFiles: ['./src/test-setup.ts'],
  coverageThresholds: {
    branches: 90,
    functions: 95,
    lines: 95,
    statements: 95,
  },
});
```

### Component Testing

```typescript
import { createComponentTestConfig } from '@reynard/testing/config';

export default createComponentTestConfig('my-component-package');
```

### Integration Testing

```typescript
import { createIntegrationTestConfig } from '@reynard/testing/config';

export default createIntegrationTestConfig('my-integration-package');
```

## Test Utilities

### Custom Render Functions

```typescript
import { 
  renderWithProviders, 
  renderWithTheme, 
  renderWithRouter 
} from '@reynard/testing/utils';

// Render with all providers
renderWithProviders(() => <MyComponent />);

// Render with theme
renderWithTheme(() => <MyComponent />, { name: 'dark' });

// Render with router
renderWithRouter(() => <MyComponent />, '/dashboard');
```

### Mock Utilities

```typescript
import { 
  createMockFn, 
  createMockResponse, 
  createMockFile 
} from '@reynard/testing/utils';

// Create mock function
const mockFn = createMockFn();

// Create mock response
const response = createMockResponse({ data: 'test' });

// Create mock file
const file = createMockFile('test.txt', 'content');
```

### Assertion Utilities

```typescript
import { 
  expectComponentToRender,
  expectPromiseToResolve,
  expectElementToHaveClass
} from '@reynard/testing/utils';

// Component assertions
expectComponentToRender(MyComponent);

// Promise assertions
await expectPromiseToResolve(fetch('/api'));

// DOM assertions
expectElementToHaveClass(element, 'active');
```

## Mocks

### Browser APIs

```typescript
import { 
  mockFetch, 
  mockLocalStorage, 
  mockWebSocket 
} from '@reynard/testing/mocks';

// Mock fetch
mockFetch.mockResolvedValueOnce({ ok: true });

// Mock localStorage
mockLocalStorage.getItem.mockReturnValue('value');

// Mock WebSocket
const ws = new mockWebSocket();
```

### External Libraries

```typescript
import { mockFabric, mockD3 } from '@reynard/testing/mocks';

// Mock Fabric.js
const canvas = new mockFabric.Canvas();

// Mock D3.js
const selection = mockD3.select('body');
```

## Package Configuration Templates

### Component Package

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  },
  "devDependencies": {
    "@reynard/testing": "workspace:*",
    "vitest": "^3.0.0"
  }
}
```

### Utility Package

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@reynard/testing": "workspace:*",
    "vitest": "^3.0.0"
  }
}
```

## Best Practices

### 1. Use Appropriate Config

- **Component packages**: Use `createComponentTestConfig`
- **Utility packages**: Use `createUtilityTestConfig`
- **Integration packages**: Use `createIntegrationTestConfig`

### 2. Leverage Test Utilities

```typescript
// Good: Use custom render functions
renderWithProviders(() => <MyComponent />);

// Avoid: Manual provider setup
render(() => (
  <ThemeProvider>
    <RouterProvider>
      <MyComponent />
    </RouterProvider>
  </ThemeProvider>
));
```

### 3. Use Comprehensive Mocks

```typescript
// Good: Use provided mocks
import { mockFetch } from '@reynard/testing/mocks';

// Avoid: Manual fetch mocking
global.fetch = vi.fn();
```

### 4. Write Descriptive Tests

```typescript
// Good: Descriptive test names
test('should render component with correct theme colors', () => {
  // test implementation
});

// Avoid: Vague test names
test('works', () => {
  // test implementation
});
```

## Coverage Requirements

- **Components**: 85%+ branches, 90%+ functions/lines/statements
- **Utilities**: 90%+ branches, 95%+ functions/lines/statements
- **Integration**: 75%+ branches, 80%+ functions/lines/statements

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure mocks are imported before use
2. **Coverage too low**: Check if test files are excluded from coverage
3. **Type errors**: Ensure TypeScript types are properly configured

### Getting Help

- Check existing package configurations for examples
- Review test utilities documentation
- Consult Vitest documentation for advanced usage
