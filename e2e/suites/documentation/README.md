# Documentation Validation E2E Tests

🦩 *flamingo feathers ruffle with validation precision* This comprehensive test suite validates all code examples in documentation files by creating isolated test environments and executing them in `/tmp/` directories.

## Overview

The documentation validation system ensures that all code examples in the Reynard project documentation are:

- **Syntactically correct** - Code compiles and runs without errors
- **Executable** - Commands and scripts work as intended
- **Up-to-date** - Examples reflect current API and usage patterns
- **Dependency-aware** - Required packages and tools are available

## Architecture

### Core Components

```
e2e/modules/documentation/
├── doc-scanner.ts          # Scans documentation files for code examples
├── example-validator.ts    # Validates code examples in isolated environments
└── index.ts               # Barrel exports

e2e/suites/documentation/
├── documentation-validation.spec.ts  # Main test suite
└── README.md                        # This file

e2e/configs/
└── playwright.config.documentation.ts  # Playwright configuration

e2e/scripts/
└── run-documentation-validation.sh     # Test runner script
```

### Validation Process

1. **Documentation Scanning** - Automatically discovers and extracts code examples from:
   - `README.md` files
   - `docs/` directory
   - Package documentation
   - Example applications
   - Templates and guides

2. **Code Analysis** - Analyzes each example to determine:
   - Code type (bash, typescript, json, python, etc.)
   - Dependencies and requirements
   - Executability and validation rules

3. **Isolated Testing** - Creates temporary `/tmp/` environments for each example:
   - Sets up project structure
   - Installs dependencies
   - Executes code examples
   - Validates output and behavior

4. **Comprehensive Reporting** - Generates detailed reports with:
   - Success/failure rates
   - Error messages and warnings
   - Performance metrics
   - Recommendations for fixes

## Supported Code Types

### Bash/Shell Scripts

- **Validation**: Command execution, directory operations, package management
- **Examples**: `pnpm install`, `git clone`, build scripts, deployment commands
- **Success Criteria**: Commands execute without errors, expected outputs produced

### TypeScript/JavaScript

- **Validation**: Syntax checking, import resolution, compilation
- **Examples**: Component code, API usage, configuration files
- **Success Criteria**: TypeScript compiles without errors, imports resolve correctly

### JSON Configuration

- **Validation**: Syntax validation, schema compliance
- **Examples**: `package.json`, `tsconfig.json`, configuration files
- **Success Criteria**: Valid JSON syntax, proper structure

### Python Scripts

- **Validation**: Syntax checking, import resolution, execution
- **Examples**: Backend scripts, data processing, automation
- **Success Criteria**: Python code executes without errors

### Dockerfile

- **Validation**: Syntax validation, build process
- **Examples**: Container definitions, multi-stage builds
- **Success Criteria**: Dockerfile syntax is valid, builds successfully

## Usage

### Running Documentation Validation

```bash
# Run all documentation validation tests
cd e2e
pnpm run test:documentation

# Run with detailed output
pnpm run test:documentation:headed

# Run in debug mode
pnpm run test:documentation:debug

# Run with UI
pnpm run test:documentation:ui

# View results
pnpm run test:documentation:report

# Use the comprehensive script
./scripts/run-documentation-validation.sh
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Validate Documentation
  run: |
    cd e2e
    pnpm run test:documentation
```

### Local Development

```bash
# Validate specific documentation file
cd e2e
node -e "
import { DocumentationScanner } from './modules/documentation/index.js';
const scanner = new DocumentationScanner(process.cwd());
const examples = await scanner.scanFile('README.md');
console.log('Found examples:', examples.length);
"
```

## Configuration

### Test Configuration

```typescript
const TEST_CONFIG = {
  projectRoot: process.cwd(),
  maxConcurrency: 3,        // Parallel test execution limit
  timeout: 60000,           // 1 minute per test
  skipTypes: ["markdown", "other"], // Skip non-executable types
  focusTypes: [],           // Empty = test all types
};
```

### Playwright Configuration

```typescript
// e2e/configs/playwright.config.documentation.ts
export default defineConfig({
  testDir: "../suites/documentation",
  fullyParallel: false,     // Sequential execution to avoid conflicts
  workers: 1,               // Single worker for temp directory isolation
  timeout: 300000,          // 5 minutes per test
  // ... additional configuration
});
```

## Test Results

### Success Criteria

- **README.md Examples**: ≥80% success rate
- **Package Documentation**: ≥70% success rate  
- **Example Applications**: ≥75% success rate
- **Bash/Shell Scripts**: ≥85% success rate
- **TypeScript Examples**: ≥80% success rate
- **JSON Configuration**: 100% success rate (syntax only)

### Performance Expectations

- **Average Time per Example**: <10 seconds
- **Total Validation Time**: <5 minutes for full suite
- **Memory Usage**: <500MB per test environment

### Reporting

Results are generated in multiple formats:

- **HTML Report**: Interactive web interface with detailed results
- **JSON Report**: Machine-readable results for CI/CD integration
- **JUnit Report**: Standard format for test result aggregation
- **Console Output**: Real-time progress and summary

## Troubleshooting

### Common Issues

#### Permission Errors

```bash
# Ensure script is executable
chmod +x scripts/run-documentation-validation.sh
```

#### Missing Dependencies

```bash
# Install required tools
pnpm install
pnpm exec playwright install
```

#### Timeout Issues

```bash
# Increase timeout for slow examples
export PLAYWRIGHT_TIMEOUT=600000
```

#### Temp Directory Conflicts

```bash
# Clean up existing temp directories
rm -rf /tmp/reynard-doc-test-*
```

### Debug Mode

```bash
# Run with detailed logging
pnpm run test:documentation:debug

# Run specific test
pnpm exec playwright test --config=configs/playwright.config.documentation.ts --debug suites/documentation/documentation-validation.spec.ts
```

### Environment Variables

```bash
# Customize test behavior
export REYNARD_DOC_TEST_TIMEOUT=300000
export REYNARD_DOC_TEST_CONCURRENCY=2
export REYNARD_DOC_TEST_CLEANUP=true
```

## Best Practices

### Writing Documentation Examples

1. **Keep Examples Simple** - Focus on core functionality
2. **Include Dependencies** - Specify required packages and versions
3. **Test Locally** - Verify examples work before committing
4. **Use Real Commands** - Avoid placeholder or fake commands
5. **Provide Context** - Explain what the example does

### Example Quality Guidelines

```bash
# ✅ Good: Clear, executable command
pnpm install reynard-core solid-js

# ❌ Bad: Vague or incomplete
npm install some-package

# ✅ Good: Complete TypeScript example
import { createSignal } from "solid-js";
import { Button } from "reynard-components";

function App() {
  const [count, setCount] = createSignal(0);
  return <Button onClick={() => setCount(count() + 1)}>Count: {count()}</Button>;
}

# ❌ Bad: Incomplete or missing imports
function App() {
  return <Button>Click me</Button>;
}
```

## Integration with Existing E2E Framework

The documentation validation system integrates seamlessly with the existing E2E testing framework:

- **Modular Architecture** - Follows the established module pattern
- **Shared Utilities** - Leverages existing test infrastructure
- **Consistent Reporting** - Uses the same reporting system
- **CI/CD Integration** - Works with existing automation

## Future Enhancements

### Planned Features

- **Dependency Analysis** - Automatic detection of missing dependencies
- **Version Compatibility** - Check examples against different package versions
- **Interactive Examples** - Support for interactive code examples
- **Performance Benchmarking** - Measure example execution performance
- **Auto-fix Suggestions** - Provide fixes for common issues

### Extension Points

- **Custom Validators** - Add support for new code types
- **Custom Rules** - Define project-specific validation rules
- **Integration Hooks** - Connect with external validation services
- **Custom Reporters** - Generate specialized reports

## Contributing

### Adding New Code Types

1. **Extend the Scanner** - Add detection logic in `doc-scanner.ts`
2. **Implement Validator** - Add execution logic in `example-validator.ts`
3. **Add Tests** - Create test cases for the new type
4. **Update Documentation** - Document the new type and its validation rules

### Reporting Issues

When documentation validation fails:

1. **Check the HTML Report** - Review detailed error information
2. **Verify Dependencies** - Ensure required tools are installed
3. **Test Locally** - Reproduce the issue in your environment
4. **Create Issue** - Report with full error details and context

---

🦩 *flamingo feathers ruffle with validation satisfaction* The documentation validation system ensures that every code example in the Reynard project is accurate, executable, and up-to-date. By creating isolated test environments and executing real code, we maintain the highest standards of documentation quality and developer experience!
