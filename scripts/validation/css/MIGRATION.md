# 🦊 CSS Variable Validator - Migration Guide

## Overview

The CSS Variable Validator has been completely rewritten in TypeScript, providing a more robust, maintainable, and feature-rich validation tool for CSS variables across Reynard projects.

## What's New

### 🚀 Major Improvements

- **TypeScript**: Full type safety and better error handling
- **Modular Architecture**: Clean separation of concerns with dedicated classes
- **Enhanced CLI**: Commander.js-based interface with comprehensive options
- **Multiple Report Formats**: Markdown, JSON, and plain text output
- **Better Import Resolution**: Handles CSS imports and circular dependencies
- **Theme Validation**: Supports theme-specific variable validation
- **Comprehensive Testing**: Extensive test suite with 100% coverage
- **Better Error Messages**: More descriptive and actionable error reporting

### 📦 New Architecture

```text
src/
├── CSSVariableValidator.ts    # Main validator class
├── logger.ts                  # Colored console output
├── fileManager.ts             # File operations and scanning
├── variableExtractor.ts       # CSS variable extraction
├── variableValidator.ts       # Validation logic
├── reportGenerator.ts         # Report generation
├── cli.ts                     # Command-line interface
├── types.ts                   # TypeScript type definitions
└── __tests__/                 # Comprehensive test suite
```

## Migration Steps

### 1. Install Dependencies

```bash
cd scripts/validation/css
pnpm install
```

### 2. Build the Project

```bash
pnpm run build
```

### 3. Test the New Version

```bash
# Basic validation
pnpm start

# Verbose output
pnpm start --verbose

# Generate report
pnpm start --output report.md --detailed
```

## Usage Comparison

### Old JavaScript Version

```bash
# Old way (deprecated)
node validate-css-variables.js --verbose --strict
```

### New TypeScript Version

```bash
# New way (recommended)
pnpm start --verbose --strict

# Or directly
node dist/cli.js --verbose --strict
```

## New Features

### 1. Enhanced CLI Options

```bash
# Multiple output formats
pnpm start --format json --output results.json
pnpm start --format markdown --output report.md
pnpm start --format text

# Detailed reporting
pnpm start --detailed --include-paths --include-line-numbers

# Custom scan directories
pnpm start --scan-dirs packages examples templates

# File filtering
pnpm start --include "*.css" --exclude "*.min.css"
```

### 2. Programmatic Usage

```typescript
import { CSSVariableValidator } from "./dist/index.js";

const validator = new CSSVariableValidator({
  scanDirs: ["packages", "examples"],
  verbose: true,
  strict: false,
});

const result = await validator.validate();
console.log("Success:", result.success);
console.log("Issues:", result.issues.length);
```

### 3. Multiple Report Formats

#### Markdown Report

```markdown
# CSS Variable Validation Report

## Summary

- **Total Variable Definitions**: 25
- **Missing Variables**: 2
- **Unused Variables**: 3

## Missing Variable Definitions

### ❌ `--missing-var`

- **Usage Count**: 3
- **Files**: styles.css, components.css
```

#### JSON Report

```json
{
  "success": false,
  "issues": [
    {
      "type": "missing",
      "severity": "error",
      "variable": "missing-var",
      "message": "Variable '--missing-var' is used but not defined"
    }
  ],
  "summary": {
    "totalDefinitions": 25,
    "missingVariables": 2
  }
}
```

## Backward Compatibility

The old JavaScript version (`validate-css-variables.js`) is still available but shows deprecation warnings:

```bash
⚠️  WARNING: This JavaScript version is deprecated!
Please use the new TypeScript version:
  cd scripts/validation/css
  pnpm install && pnpm run build
  pnpm start [options]
```

## Configuration

### New Configuration Options

```typescript
interface ValidatorConfig {
  scanDirs: string[]; // Directories to scan
  criticalVariables: string[]; // Critical variables to check
  themeVariables: string[]; // Theme-specific variables
  verbose?: boolean; // Verbose output
  fixMode?: boolean; // Auto-fix mode (future)
  strict?: boolean; // Strict mode for CI/CD
  maxFiles?: number; // Max files to process
  includePatterns?: string[]; // File patterns to include
  excludePatterns?: string[]; // File patterns to exclude
}
```

## Development

### Building

```bash
# Build TypeScript
pnpm run build

# Watch mode
pnpm run dev

# Clean build
pnpm run clean
```

### Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

### Linting

```bash
# Check linting
pnpm run lint

# Fix linting issues
pnpm run lint:fix
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Validate CSS Variables
  run: |
    cd scripts/validation/css
    pnpm install
    pnpm run build
    pnpm start --strict --format json --output css-validation-results.json
```

### Pre-commit Hooks

```bash
# Add to .husky/pre-commit
cd scripts/validation/css && pnpm start --strict
```

## Exit Codes

- `0`: Validation passed successfully
- `1`: Validation failed with errors
- `2`: Validation passed with warnings (use `--strict` to fail on warnings)

## Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all dependencies are installed

   ```bash
   pnpm install
   ```

2. **Permission Errors**: Ensure the CLI is executable

   ```bash
   chmod +x dist/cli.js
   ```

3. **Module Not Found**: Make sure the project is built

   ```bash
   pnpm run build
   ```

### Getting Help

```bash
# Show help
pnpm start --help

# Verbose output for debugging
pnpm start --verbose
```

## Future Roadmap

- [ ] Automatic fixing of common issues
- [ ] Integration with VS Code extension
- [ ] Support for CSS-in-JS validation
- [ ] Performance optimizations for large codebases
- [ ] Custom validation rules
- [ ] Integration with design systems

## Support

For issues or questions:

1. Check the README.md for detailed documentation
2. Run with `--verbose` for debugging information
3. Check the test suite for usage examples
4. Review the TypeScript types for API documentation

---

**Note**: The old JavaScript version will be removed in a future release. Please migrate to the new TypeScript version as soon as possible.
