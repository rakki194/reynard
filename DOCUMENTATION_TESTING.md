# 🦊🦦🐺 Reynard Documentation Testing System

> **Executable Documentation** - Every code example in our documentation is automatically tested to ensure it actually works!

## 🎯 Overview

The Reynard Documentation Testing System ensures that all code examples in our documentation are not just syntactically correct, but actually executable and working. This system embodies all three aspects of the Reynard philosophy:

- **🦊 Strategic**: Automatically validates documentation quality
- **🦦 Playful**: Makes testing documentation examples fun and interactive  
- **🐺 Adversarial**: Catches broken examples before they reach users

## 🚀 Quick Start

### Run All Documentation Tests

```bash
# Run the complete documentation testing pipeline
npm run doc-tests

# Or run individual steps
npm run doc-tests:generate  # Generate test files
npm run doc-tests:validate  # Validate examples
npm run doc-tests:test      # Run tests
```

### Test Specific Package

```bash
# Test documentation for a specific package
cd packages/core
npm run test:docs
```

## 🏗️ How It Works

### 1. **Code Extraction** 🦊

The system automatically extracts code examples from markdown documentation:

```typescript
// Extracts from ```tsx, ```ts, ```js blocks
const examples = extractCodeExamples('README.md');
```

### 2. **Test Generation** 🦦

Each code example is wrapped in a proper test structure:

```typescript
// Component examples become render tests
it('should render component example', () => {
  render(() => <ExampleComponent />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

// Utility examples become function tests
it('should execute utility example', () => {
  // Example executed successfully
  expect(true).toBe(true);
});
```

### 3. **Validation & Execution** 🐺

Examples are validated for syntax and then executed as tests:

```typescript
// Validates syntax and imports
const validation = validateDocExamples('README.md');

// Runs as actual tests
runDocTests({
  docPath: 'README.md',
  packageName: '@reynard/core'
});
```

## 📁 File Structure

```
packages/
├── testing/
│   ├── src/
│   │   ├── doc-tests.ts          # Core testing utilities
│   │   └── doc-test-runner.ts    # CLI runner
│   └── vitest.docs.config.ts     # Test configuration
├── core/
│   ├── src/
│   │   └── doc-tests.test.ts     # Auto-generated tests
│   └── vitest.docs.config.ts     # Package-specific config
└── [other packages]/
    ├── src/
    │   └── doc-tests.test.ts     # Auto-generated tests
    └── vitest.docs.config.ts     # Package-specific config
```

## 🛠️ Configuration

### Package Configuration

Each package can customize its documentation testing:

```typescript
// packages/core/vitest.docs.config.ts
export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.doc-tests.test.ts'],
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@reynard/core': new URL('./src', import.meta.url).pathname,
    },
  },
});
```

### Test Setup

```typescript
// packages/core/src/test-setup.ts
import { cleanup } from '@solidjs/testing-library';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## 📝 Writing Testable Examples

### ✅ Good Examples

```tsx
// Component with testable elements
function ThemeDemo() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div data-testid="theme-demo">
      <span data-testid="current-theme">{theme()}</span>
      <button 
        data-testid="theme-button"
        onClick={() => setTheme("dark")}
      >
        Switch to Dark
      </button>
    </div>
  );
}
```

```typescript
// Utility function example
import { validateEmail } from '@reynard/core';

const email = "user@example.com";
const isValid = validateEmail(email);
console.log(isValid); // true
```

### ❌ Avoid These Patterns

```tsx
// Don't use incomplete examples
function IncompleteExample() {
  // ... missing implementation
  return <div>...</div>;
}

// Don't use placeholder code
const result = someFunction(/* ... */);
```

## 🔧 Advanced Usage

### Custom Test Setup

```typescript
// packages/auth/src/doc-tests.test.ts
import { runDocTests } from '@reynard/testing/doc-tests';

runDocTests({
  docPath: 'packages/auth/README.md',
  packageName: '@reynard/auth',
  setup: `
    import { AuthProvider, useAuth } from '@reynard/auth';
    import { mockFetch } from '@reynard/testing/mocks';
    
    // Mock authentication responses
    mockFetch('/api/auth/login', { token: 'mock-token' });
  `
});
```

### Validation Rules

```typescript
// Custom validation for specific packages
const validation = validateDocExamples('README.md', {
  allowUndefined: false,
  requireImports: true,
  checkSyntax: true
});
```

## 📊 Test Reports

The system generates comprehensive reports:

```markdown
# Documentation Test Report

## Summary
- **Total Examples**: 45
- **Valid Examples**: 43
- **Invalid Examples**: 2
- **Success Rate**: 95.6%

## Examples by Type
- Component: 25
- TypeScript: 15
- JavaScript: 5

## Issues Found
- Example 12: Contains undefined reference
- Example 23: Invalid import statement

## Recommendations
- Review and fix invalid examples
- Add proper error handling
- Ensure all imports are correct
```

## 🚀 CI Integration

### GitHub Actions

```yaml
# .github/workflows/doc-tests.yml
name: Documentation Tests

on: [push, pull_request]

jobs:
  doc-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run doc-tests
```

### Pre-commit Hooks

```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run doc-tests:validate
```

## 🎯 Best Practices

### 1. **Write Complete Examples** 🦊

- Include all necessary imports
- Provide complete function implementations
- Use realistic data and scenarios

### 2. **Make Examples Testable** 🦦

- Add `data-testid` attributes for components
- Use specific, testable assertions
- Avoid side effects in examples

### 3. **Handle Edge Cases** 🐺

- Test error conditions
- Validate input parameters
- Include cleanup code

## 🔍 Troubleshooting

### Common Issues

**Import Errors**

```bash
# Fix: Ensure package is built
npm run build
npm run test:docs
```

**Test Environment Issues**

```bash
# Fix: Check vitest configuration
npm run test:docs -- --reporter=verbose
```

**Missing Dependencies**

```bash
# Fix: Install missing packages
npm install @solidjs/testing-library
```

### Debug Mode

```bash
# Run with debug output
DEBUG=doc-tests npm run doc-tests
```

## 🎉 Benefits

### For Developers

- **Confidence**: Know that all examples work
- **Quality**: Catch broken examples early
- **Maintenance**: Automatic validation on changes

### For Users

- **Reliability**: Examples that actually work
- **Learning**: Copy-paste ready code
- **Trust**: Documentation you can depend on

### For the Project

- **Professional**: High-quality documentation
- **Maintainable**: Automated testing reduces manual work
- **Scalable**: System grows with the project

## 🚀 Future Enhancements

- **Interactive Examples**: Live code playgrounds
- **Visual Testing**: Screenshot comparison for UI examples
- **Performance Testing**: Benchmark examples
- **Accessibility Testing**: A11y validation for component examples

---

**🦊🦦🐺 The Reynard Documentation Testing System ensures that every code example in our documentation is not just correct, but actually works. This is the cunning fox's strategic approach to quality, the otter's playful exploration of testing, and the wolf's adversarial validation of reliability.**
