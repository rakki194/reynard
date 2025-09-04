# @reynard/core

Core utilities and composables for the Reynard project.

## Testing

Run the test suite:

```bash
npm run test
```

### Test Status

- ✅ **Core Tests**: All core functionality tests are passing (202 tests)
- ⚠️ **Async Tests**: Temporarily excluded due to fake timer conflicts with real async operations

The async utility tests (`src/utils/async.test.ts`) are currently excluded from the main test run due to conflicts between Vitest's fake timers and the actual async implementations. These tests can be run separately when needed, but may require manual timing adjustments.

## Features

- **Composables**: React-style hooks for SolidJS
- **Utilities**: Common utility functions for validation, formatting, dates, and languages
- **Modules**: Core modules for notifications, internationalization, and theming
