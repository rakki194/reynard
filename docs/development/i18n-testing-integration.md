# i18n Testing Integration Guide

_whiskers twitch with satisfaction_ The Reynard i18n testing system provides comprehensive translation validation across all packages, ensuring no hardcoded strings slip through and all translations are complete and properly formatted.

## Overview

The i18n testing system consists of several integrated components:

- **Centralized Configuration**: Package-specific i18n testing settings
- **ESLint Integration**: Real-time hardcoded string detection
- **Package Orchestrator**: Coordinates testing across all packages
- **CLI Tools**: Command-line interface for running tests
- **CI/CD Integration**: Automated validation in GitHub Actions

## Quick Start

### 1. Run All i18n Tests

```bash
# From the Reynard root directory
./scripts/i18n-test-all.sh
```

### 2. Using the CLI

```bash
# Navigate to testing package
cd packages/testing

# Run comprehensive tests
pnpm i18n:test

# Set up test files for all packages
pnpm i18n:setup

# Validate i18n setup
pnpm i18n:validate

# List all packages and their configuration
pnpm i18n:list

# Run ESLint with i18n rules
pnpm i18n:eslint

# Run CI checks
pnpm i18n:ci
```

## Package Configuration

Each package has its own i18n configuration in `packages/testing/src/config/i18n-testing-config.ts`:

```typescript
{
  name: 'components',
  path: 'packages/components',
  enabled: true,
  ignorePatterns: [
    '^[a-z]+[A-Z][a-z]*$', // camelCase
    '^[A-Z_]+$', // CONSTANTS
    // ... more patterns
  ],
  failOnHardcodedStrings: true,
  validateCompleteness: true,
  testRTL: true,
  namespaces: ['components', 'common']
}
```

### Configuration Options

- **enabled**: Whether this package should be tested for i18n
- **ignorePatterns**: Regex patterns for strings to ignore
- **failOnHardcodedStrings**: Whether to fail tests on hardcoded strings
- **validateCompleteness**: Whether to validate translation completeness
- **testRTL**: Whether to test RTL support
- **namespaces**: Translation namespaces used by this package

## ESLint Integration

The system includes custom ESLint rules for real-time i18n validation:

```javascript
// .eslintrc.js
module.exports = {
  extends: ["packages/testing/src/eslint/i18n-eslint-config.js"],
  rules: {
    "@reynard/i18n/no-hardcoded-strings": "error",
    "@reynard/i18n/no-untranslated-keys": "warn",
  },
};
```

### Available Rules

- **@reynard/i18n/no-hardcoded-strings**: Detects hardcoded strings in JSX and code
- **@reynard/i18n/no-untranslated-keys**: Detects missing translations
- **@reynard/i18n/require-pluralization**: Validates pluralization rules
- **@reynard/i18n/rtl-support**: Checks RTL support

## Package Test Files

Each package should have an `i18n.test.ts` file in its `src/__tests__/` directory:

```typescript
import { describe, it, expect } from "vitest";
import { runPackageI18nTests } from "reynard-testing/utils/i18n-package-orchestrator";
import { getPackageI18nConfig } from "reynard-testing/config/i18n-testing-config";

describe("components i18n Tests", () => {
  it("should pass all i18n validation checks", async () => {
    const config = getPackageI18nConfig("components");
    expect(config).toBeDefined();

    if (config?.enabled) {
      const result = await runPackageI18nTests(config);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });
});
```

## Translation File Structure

Packages should organize their translations in the following structure:

```
packages/[package-name]/src/lang/
├── en/
│   ├── common.ts
│   ├── [namespace].ts
│   └── index.ts
├── es/
│   ├── common.ts
│   ├── [namespace].ts
│   └── index.ts
└── ...
```

### Example Translation File

```typescript
// packages/components/src/lang/en/components.ts
export const componentsTranslations = {
  button: {
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
  },
  form: {
    required: "This field is required",
    invalid: "Please enter a valid value",
  },
};
```

## CI/CD Integration

The system includes GitHub Actions workflow for automated i18n checks:

```yaml
# .github/workflows/i18n-checks.yml
name: i18n Checks
on: [push, pull_request]

jobs:
  i18n-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run i18n tests
        run: ./scripts/i18n-test-all.sh
```

## Advanced Usage

### Custom Ignore Patterns

Add package-specific ignore patterns:

```typescript
{
  name: 'auth',
  ignorePatterns: [
    '^(token|jwt|oauth|saml|ldap)$', // Auth-specific terms
    '^[a-z]+[A-Z][a-z]*$' // camelCase
  ]
}
```

### Custom Test Configuration

Override default settings for specific packages:

```typescript
const customConfig: I18nTestConfig = {
  packages: ["packages/auth"],
  locales: ["en", "es"],
  checkHardcodedStrings: true,
  validateCompleteness: true,
  testPluralization: true,
  testRTL: true,
  ignorePatterns: ["^(token|jwt)$"],
};

const result = await runI18nTests(customConfig);
```

### Integration with Existing Tests

Add i18n tests to existing test suites:

```typescript
import { runPackageI18nTests } from "reynard-testing/utils/i18n-package-orchestrator";

describe("MyComponent", () => {
  // ... existing tests

  describe("i18n", () => {
    it("should not have hardcoded strings", async () => {
      const config = getPackageI18nConfig("components");
      const result = await runPackageI18nTests(config);
      expect(result.results.hardcodedStrings).toHaveLength(0);
    });
  });
});
```

## Troubleshooting

### Common Issues

1. **Package not found**: Ensure the package is listed in `i18n-testing-config.ts`
2. **Missing test files**: Run `pnpm i18n:setup` to create test files
3. **ESLint errors**: Check that the ESLint config is properly extended
4. **Translation files missing**: Ensure translation files exist in the expected structure

### Debug Mode

Enable verbose output for debugging:

```bash
pnpm i18n:test --verbose
```

### Manual Validation

Validate setup without running tests:

```bash
pnpm i18n:validate
```

## Best Practices

1. **Regular Testing**: Run i18n tests as part of your development workflow
2. **CI Integration**: Always run i18n checks in CI/CD pipelines
3. **Package-Specific Patterns**: Use appropriate ignore patterns for each package
4. **Translation Organization**: Keep translations organized by namespace
5. **RTL Support**: Test RTL support for international packages

## Contributing

When adding new packages:

1. Add package configuration to `i18n-testing-config.ts`
2. Create `i18n.test.ts` file in the package's test directory
3. Set up translation files in the expected structure
4. Update documentation if needed

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the configuration files
3. Run validation commands to identify issues
4. Check the GitHub Actions logs for CI/CD issues

_red fur bristles with excitement_ The i18n testing system ensures that Reynard maintains high-quality internationalization across all packages, making it easier to support users worldwide!
