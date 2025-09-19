# 🦊 CSS Variable Validator

A comprehensive TypeScript tool for validating CSS variables across Reynard projects. This tool ensures consistency, correctness, and proper usage of CSS custom properties (variables) in your codebase.

## Features

- **🔍 Variable Discovery**: Automatically finds and analyzes CSS variables across your project
- **📊 Usage Analysis**: Tracks variable definitions and usage patterns
- **🚨 Issue Detection**: Identifies missing variables, unused definitions, and potential typos
- **📦 Import Resolution**: Handles CSS imports and resolves variable dependencies
- **🎨 Theme Support**: Validates theme-specific variable definitions
- **📄 Multiple Report Formats**: Generate reports in Markdown, JSON, or plain text
- **🔧 CLI Interface**: Easy-to-use command-line interface with comprehensive options
- **⚡ TypeScript**: Fully typed with comprehensive type definitions
- **🧪 Test Coverage**: Extensive test suite with 100% coverage

## Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test
```

## Usage

### Command Line Interface

```bash
# Basic validation
npx validate-css-variables

# Verbose output
npx validate-css-variables --verbose

# Strict mode (fail on warnings)
npx validate-css-variables --strict

# Custom scan directories
npx validate-css-variables --scan-dirs packages examples

# Generate detailed report
npx validate-css-variables --output report.md --detailed --include-paths

# JSON output for CI/CD
npx validate-css-variables --format json --output validation-results.json
```

### Programmatic Usage

```typescript
import { CSSVariableValidator } from "./dist/index.js";

// Create validator with custom configuration
const validator = new CSSVariableValidator({
  scanDirs: ["packages", "examples"],
  verbose: true,
  strict: false,
});

// Run validation
const result = await validator.validate();

// Check results
if (result.success) {
  console.log("✅ All validations passed!");
} else {
  console.log("❌ Validation failed:", result.issues.length, "issues found");
}

// Generate report
const report = validator.generateReport(result, {
  format: "markdown",
  detailed: true,
  includePaths: true,
});

// Save report
validator.saveReport(result, "css-validation-report.md");
```

## Configuration

The validator can be configured with the following options:

```typescript
interface ValidatorConfig {
  // Directories to scan for CSS files
  scanDirs: string[];

  // Critical variables that must be consistent
  criticalVariables: string[];

  // Theme-specific variables
  themeVariables: string[];

  // Enable verbose output
  verbose?: boolean;

  // Enable automatic fixing mode
  fixMode?: boolean;

  // Maximum number of files to process
  maxFiles?: number;

  // File patterns to include/exclude
  includePatterns?: string[];
  excludePatterns?: string[];

  // Fail on any inconsistencies (for CI/CD)
  strict?: boolean;
}
```

## CLI Options

| Option                    | Description                          | Default                                                  |
| ------------------------- | ------------------------------------ | -------------------------------------------------------- |
| `-v, --verbose`           | Enable verbose output                | `false`                                                  |
| `--fix`                   | Enable automatic fixing mode         | `false`                                                  |
| `--strict`                | Fail on any inconsistencies          | `false`                                                  |
| `--scan-dirs <dirs...>`   | Directories to scan                  | `['packages', 'examples', 'templates', 'src', 'styles']` |
| `-o, --output <path>`     | Output file path for report          | -                                                        |
| `--format <format>`       | Report format (markdown, json, text) | `markdown`                                               |
| `--detailed`              | Include detailed metadata            | `false`                                                  |
| `--include-paths`         | Include file paths in report         | `false`                                                  |
| `--include-line-numbers`  | Include line numbers in report       | `false`                                                  |
| `--max-files <number>`    | Maximum files to process             | `1000`                                                   |
| `--include <patterns...>` | File patterns to include             | `['*.css']`                                              |
| `--exclude <patterns...>` | File patterns to exclude             | `['*.min.css', '*.bundle.css']`                          |

## Validation Rules

### Missing Variables

Variables that are used but not defined anywhere in the codebase.

```css
/* ❌ Error: --missing-var is used but not defined */
.button {
  color: var(--missing-var);
}
```

### Unused Variables

Variables that are defined but never used.

```css
/* ⚠️ Warning: --unused-var is defined but never used */
:root {
  --unused-var: #ff0000;
}
```

### Typos in Variable Names

Common misspellings in variable names.

```css
/* ⚠️ Warning: 'primay' should be 'primary' */
:root {
  --primay-color: #007acc;
}
```

### Theme Consistency

Ensures theme-specific variables are properly defined.

```css
/* ✅ Good: Theme-specific variables */
:root {
  --accent: #007acc;
}

:root[data-theme="dark"] {
  --accent: #00aaff;
}
```

## Report Formats

### Markdown Report

Comprehensive report with sections for different types of issues:

```markdown
# CSS Variable Validation Report

## Summary

- **Total Variable Definitions**: 25
- **Total Variable Usage**: 18
- **Missing Variables**: 2
- **Unused Variables**: 3

## Missing Variable Definitions

### ❌ `--missing-var`

- **Usage Count**: 3
- **Files**: styles.css, components.css
```

### JSON Report

Machine-readable format for CI/CD integration:

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

## Exit Codes

- `0`: Validation passed successfully
- `1`: Validation failed with errors
- `2`: Validation passed with warnings (use `--strict` to fail on warnings)

## Architecture

The CSS Variable Validator is built with a modular architecture:

```
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
    ├── CSSVariableValidator.test.ts
    ├── logger.test.ts
    ├── variableExtractor.test.ts
    └── variableValidator.test.ts
```

## Development

### Building

```bash
# Build TypeScript to JavaScript
pnpm run build

# Watch mode for development
pnpm run dev

# Clean build artifacts
pnpm run clean
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test --watch
```

### Linting

```bash
# Check for linting issues
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix
```

## Integration

### CI/CD Integration

```yaml
# GitHub Actions example
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
npx validate-css-variables --strict
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### 1.0.0

- Initial release
- Complete TypeScript rewrite
- Comprehensive validation rules
- Multiple report formats
- CLI interface with Commander.js
- Extensive test coverage
- Import resolution support
- Theme validation
