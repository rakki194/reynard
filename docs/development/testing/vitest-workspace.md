# 🦦 Vitest Workspace Configuration

_splashes with enthusiasm_ The Reynard monorepo now uses a centralized Vitest workspace configuration that eliminates the "multiple projects" warning and provides better performance and maintainability!

## Overview

Instead of having individual `vitest.config.*` files scattered throughout the monorepo (which caused VS Code to hit its 5-config limit), we now use a single `vitest.workspace.ts` file that defines all projects in one place.

## Benefits

- **🚀 Performance**: VS Code Vitest extension only needs to load one configuration
- **🔧 Maintainability**: All test configurations in one place
- **📊 Consistency**: Standardized testing setup across all packages
- **🎯 Flexibility**: Each project can still have unique configurations when needed

## Configuration Structure

The workspace configuration is located at `vitest.workspace.ts` in the project root and includes:

### Global Settings

- Environment: `happy-dom`
- Timeouts: 10 seconds for tests and hooks
- Coverage: V8 provider with text, JSON, and HTML reports
- Pool: Forks with up to 4 concurrent processes

### Project-Specific Configurations

Each package in the monorepo is defined as a separate project with:

- **Root directory**: Points to the package location
- **Setup files**: Package-specific test setup
- **Coverage thresholds**: Tailored to package requirements
- **Unique settings**: Special configurations where needed

## Special Package Configurations

### Components Package

- Uses `vite-plugin-solid` for SolidJS support
- Special HappyDOM environment options
- Browser-specific resolve conditions

### Segmentation Package

- Single fork pool configuration
- Extended timeouts for complex operations
- Custom alias resolution

### Testing Package

- Higher coverage thresholds (90% vs 85%)
- Specialized test setup

## Usage

### Running Tests

```bash
# Run all tests across the workspace
pnpm test

# Run tests for a specific project
pnpm test --project components

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test --watch
```

### VS Code Integration

The VS Code settings have been updated to use the workspace configuration:

```json
{
  "vitest.maximumConfigs": 20,
  "vitest.workspaceConfig": "./vitest.workspace.ts",
  "vitest.enable": true,
  "vitest.rootConfig": "./vitest.workspace.ts"
}
```

## Migration from Individual Configs

### Automatic Cleanup

Use the provided cleanup script to remove redundant individual config files:

```bash
./scripts/cleanup-vitest-configs.sh
```

This script will:

- Remove redundant `vitest.config.*` files
- Keep configs for packages with unique requirements
- Test the new configuration
- Provide a summary of changes

### Manual Migration

If you need to add a new package to the workspace:

1. Add a new project entry to `vitest.workspace.ts`
2. Configure the project-specific settings
3. Remove any individual `vitest.config.*` files from the package
4. Test the configuration

## Adding New Packages

To add a new package to the workspace configuration:

```typescript
{
  name: "new-package",
  root: "./packages/new-package",
  test: {
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
},
```

## Troubleshooting

### VS Code Still Shows Warning

1. Restart VS Code
2. Reload the window (`Ctrl+Shift+P` → "Developer: Reload Window")
3. Check that `vitest.workspace.ts` is in the project root
4. Verify VS Code settings are correct

### Tests Not Running

1. Check that the package has a `src/__tests__/setup.ts` file
2. Verify the project name matches the package directory
3. Ensure test files match the include pattern
4. Check for any unique dependencies (like `vite-plugin-solid`)

### Performance Issues

1. Reduce `maxForks` in the global pool options
2. Use `singleFork: true` for packages with resource-intensive tests
3. Adjust timeouts based on test complexity

## Best Practices

### Test Organization

- Keep tests in `src/__tests__/` directories
- Use descriptive test file names with `.test.ts` or `.spec.ts` extensions
- Group related tests in the same file

### Coverage Requirements

- Core packages: 85% coverage
- Utility packages: 80% coverage
- Examples/templates: 75% coverage
- Testing packages: 90% coverage

### Performance

- Use appropriate timeouts for different test types
- Consider using `singleFork: true` for packages with heavy setup
- Monitor test execution times and adjust accordingly

## Configuration Reference

### Global Options

```typescript
{
  test: {
    environment: "happy-dom",
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 4,
        singleFork: false,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: ".vitest-coverage",
    },
  },
}
```

### Project Options

```typescript
{
  name: "project-name",
  root: "./packages/project-name",
  plugins: [/* optional plugins */],
  test: {
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
    exclude: ["node_modules", "dist"],
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
}
```

---

_🦦 This configuration ensures that all your tests run smoothly while maintaining the flexibility and power of the Reynard testing ecosystem!_
