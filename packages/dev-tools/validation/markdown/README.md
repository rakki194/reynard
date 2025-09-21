# 🦊 Markdown Validation Tools

> Essential markdown validation tools for the Reynard ecosystem

## Overview

This package provides comprehensive markdown validation tools including Table of Contents (ToC) conflict detection, link validation, and sentence length checking. It's designed to maintain high-quality documentation standards across the Reynard monorepo.

## Features

### 🎯 ToC Conflict Detection

- **Multiple ToC Detection**: Identifies when multiple Table of Contents sections exist
- **Duplicate Entry Detection**: Finds duplicate ToC entries that may indicate validator conflicts
- **Automatic Fixing**: Can automatically resolve ToC conflicts by removing duplicates
- **Custom Patterns**: Supports custom ToC header patterns for different documentation styles

### 🔗 Link Validation

- **Internal Link Checking**: Validates internal markdown links
- **External Link Verification**: Checks external links for accessibility
- **Broken Link Detection**: Identifies and reports broken links

### 📏 Sentence Length Validation

- **Length Enforcement**: Ensures sentences don't exceed specified character limits
- **Automatic Fixing**: Can automatically break long sentences
- **Readability Optimization**: Improves document readability

## Installation

```bash
# Install dependencies
pnpm install

# Build the package
pnpm run build
```

## Usage

### Command Line Interface

#### ToC Validation

```bash
# Validate ToC in a markdown file
npx validate-markdown-toc toc path/to/file.md

# Fix ToC issues automatically
npx validate-markdown-toc toc path/to/file.md --fix

# Run conflict detection test
npx validate-markdown-toc test-conflict

# Verbose output
npx validate-markdown-toc toc path/to/file.md --verbose
```

#### Link Validation

```bash
# Validate links in a markdown file
npx validate-markdown-links links path/to/file.md

# Check external links only
npx validate-markdown-links links path/to/file.md --external

# Check internal links only
npx validate-markdown-links links path/to/file.md --internal
```

#### Sentence Length Validation

```bash
# Validate sentence length
npx validate-sentence-length sentence-length path/to/file.md

# Set custom max length
npx validate-sentence-length sentence-length path/to/file.md --max-length 80

# Fix long sentences automatically
npx validate-sentence-length sentence-length path/to/file.md --fix
```

### Programmatic Usage

```typescript
import { ToCValidator } from "@reynard/dev-tools-markdown-validator";

const validator = new ToCValidator();

// Analyze ToC structure
const analysis = validator.analyzeToC(markdownContent);
console.log(`ToC sections: ${analysis.tocCount}`);
console.log(`Has conflicts: ${analysis.hasConflict}`);

// Validate and fix file
const result = await validator.validateFile("path/to/file.md", { fix: true });
if (result.success) {
  console.log("Validation passed!");
  if (result.fixes) {
    console.log("Fixes applied:", result.fixes);
  }
}
```

## API Reference

### ToCValidator

#### `analyzeToC(content: string, options?: ToCValidationOptions): ToCAnalysis`

Analyzes the ToC structure in markdown content and returns detailed analysis.

**Parameters:**

- `content`: The markdown content to analyze
- `options`: Optional configuration for analysis

**Returns:** `ToCAnalysis` object with conflict detection results

#### `validateFile(filePath: string, options?: ToCValidationOptions): Promise<ValidationResult>`

Validates and optionally fixes ToC issues in a markdown file.

**Parameters:**

- `filePath`: Path to the markdown file
- `options`: Validation options including fix mode

**Returns:** `ValidationResult` with success status and any fixes applied

#### `runConflictTest(testFilePath: string, options?: ToCValidationOptions): Promise<void>`

Runs a comprehensive ToC conflict detection test.

**Parameters:**

- `testFilePath`: Path where test file should be created
- `options`: Test configuration options

### Types

#### `ToCAnalysis`

```typescript
interface ToCAnalysis {
  tocCount: number; // Number of ToC sections found
  entryCount: number; // Number of ToC entries
  hasDuplicates: boolean; // Whether duplicate entries exist
  duplicates: string[]; // List of duplicate entries
  entries: string[]; // All ToC entries found
  hasConflict: boolean; // Whether any conflict was detected
  conflictDetails?: string; // Human-readable conflict description
}
```

#### `ValidationResult`

```typescript
interface ValidationResult {
  success: boolean; // Whether validation passed
  error?: string; // Error message if validation failed
  warnings?: string[]; // Warning messages
  fixes?: string[]; // Information about fixes applied
}
```

## Configuration

### ToC Header Patterns

By default, the validator looks for ToC sections with the pattern `/^##\s+Table\s+of\s+Contents?$/i`. You can customize this:

```typescript
const customPattern = /^##\s+Contents?$/i;
const analysis = validator.analyzeToC(content, {
  tocHeaderPattern: customPattern,
});
```

### Validation Options

```typescript
interface ToCValidationOptions {
  fix?: boolean; // Automatically fix issues
  verbose?: boolean; // Verbose output
  tocHeaderPattern?: RegExp; // Custom ToC header pattern
  detectConflicts?: boolean; // Enable conflict detection
}
```

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Building

```bash
# Build TypeScript
pnpm run build

# Build in watch mode
pnpm run dev
```

### Linting

```bash
# Check for linting issues
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format
```

## Integration

This package integrates with the Reynard development workflow:

- **Queue Watcher**: Used by the file processing queue for automatic validation
- **Pre-commit Hooks**: Can be integrated into git hooks for pre-commit validation
- **CI/CD**: Suitable for continuous integration validation pipelines

## Troubleshooting

### Common Issues

1. **Multiple ToC Sections**: Usually indicates multiple validators running simultaneously
2. **Duplicate Entries**: May occur when validators run multiple times on the same file
3. **Pattern Mismatches**: Ensure your ToC headers match the expected pattern

### Debug Mode

Use the `--verbose` flag for detailed output:

```bash
npx validate-markdown-toc toc path/to/file.md --verbose
```

## Contributing

1. Follow the Reynard coding standards
2. Keep files under 100 lines (excluding tests)
3. Add comprehensive tests for new features
4. Update documentation for API changes

## License

MIT License - see LICENSE file for details.
