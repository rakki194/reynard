# 🦩 Documentation Validation System

*flamingo feathers ruffle with validation precision* A comprehensive E2E test suite that validates all code examples in documentation files by creating isolated `/tmp/` environments and executing them.

## 🎯 Overview

This system ensures that every code example in the Reynard project documentation is:

- **Syntactically correct** - Code compiles and runs without errors
- **Executable** - Commands and scripts work as intended  
- **Up-to-date** - Examples reflect current API and usage patterns
- **Dependency-aware** - Required packages and tools are available

## 🏗️ Architecture

### Core Components

```
e2e/modules/documentation/
├── doc-scanner-core.ts        # Core scanning utilities (140 lines)
├── doc-scanner-patterns.ts    # Pattern-based file discovery (80 lines)
├── doc-scanner.ts             # Main scanner class (20 lines)
├── example-validator.ts       # Code execution and validation (400+ lines)
└── index.ts                   # Barrel exports

e2e/suites/documentation/
├── documentation-validation.spec.ts  # Main test suite (100 lines)
└── README.md                        # Detailed documentation

e2e/configs/
└── playwright.config.documentation.ts  # Playwright configuration

e2e/scripts/
└── run-documentation-validation.sh     # Test runner script
```

### Key Features

- **Modular Design** - Follows the 140-line axiom with clean separation of concerns
- **Isolated Testing** - Each example runs in its own `/tmp/` directory
- **Multi-language Support** - Bash, TypeScript, JSON, Python, Dockerfile
- **Comprehensive Reporting** - HTML, JSON, JUnit reports
- **CI/CD Integration** - Works with existing automation

## 🚀 Usage

### Quick Start

```bash
# Run all documentation validation tests
cd e2e
pnpm run test:documentation

# Use the comprehensive script
./scripts/run-documentation-validation.sh

# View results
pnpm run test:documentation:report
```

### Available Commands

```bash
# Basic testing
pnpm run test:documentation              # Run all tests
pnpm run test:documentation:headed       # Run with browser UI
pnpm run test:documentation:debug        # Run in debug mode
pnpm run test:documentation:ui           # Run with Playwright UI

# Reporting
pnpm run test:documentation:report       # View HTML report

# Comprehensive script
./scripts/run-documentation-validation.sh  # Full validation with reporting
```

## 📊 Supported Code Types

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

## 📈 Success Criteria

- **README.md Examples**: ≥80% success rate
- **Package Documentation**: ≥70% success rate  
- **Example Applications**: ≥75% success rate
- **Bash/Shell Scripts**: ≥85% success rate
- **TypeScript Examples**: ≥80% success rate
- **JSON Configuration**: 100% success rate (syntax only)

## 🔧 Configuration

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

### Environment Variables

```bash
# Customize test behavior
export REYNARD_DOC_TEST_TIMEOUT=300000
export REYNARD_DOC_TEST_CONCURRENCY=2
export REYNARD_DOC_TEST_CLEANUP=true
```

## 📁 File Structure

### Documentation Files Scanned

- `README.md` - Main project documentation
- `docs/` - Documentation directory
- `packages/*/README.md` - Package documentation
- `examples/*/README.md` - Example application docs
- `templates/*/README.md` - Template documentation
- `e2e/README.md` - E2E testing documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Change log

### Test Results

Results are generated in multiple formats:

- **HTML Report**: `results/documentation-validation-results/index.html`
- **JSON Report**: `results/documentation-validation-results/results.json`
- **JUnit Report**: `results/documentation-validation-results/results.xml`
- **Console Output**: Real-time progress and summary

## 🧪 Test Examples

### Basic Usage Test

```typescript
test("should scan documentation files for code examples", async () => {
  const examples = await scanner.scanFile("README.md");
  expect(examples.length).toBeGreaterThan(0);
});
```

### Validation Test

```typescript
test("should validate README.md code examples", async () => {
  const examples = await scanner.scanFile("README.md");
  const executableExamples = examples.filter(example => example.isExecutable);
  
  if (executableExamples.length > 0) {
    const results = await validator.validateExamples(executableExamples, 2);
    const stats = validator.getValidationStats(results);
    expect(stats.successful).toBeGreaterThan(0);
  }
});
```

## 🔍 How It Works

### 1. Documentation Scanning

- Automatically discovers documentation files across the project
- Extracts code blocks from markdown files
- Analyzes code type, dependencies, and executability

### 2. Code Analysis

- Determines code type (bash, typescript, json, etc.)
- Extracts dependencies and requirements
- Generates validation rules

### 3. Isolated Testing

- Creates temporary `/tmp/` directories for each example
- Sets up project structure and dependencies
- Executes code examples in isolation
- Validates output and behavior

### 4. Comprehensive Reporting

- Generates detailed success/failure reports
- Provides error messages and warnings
- Includes performance metrics
- Offers recommendations for fixes

## 🛠️ Integration

### With Existing E2E Framework

- **Modular Architecture** - Follows established module pattern
- **Shared Utilities** - Leverages existing test infrastructure
- **Consistent Reporting** - Uses the same reporting system
- **CI/CD Integration** - Works with existing automation

### With CI/CD Pipelines

```yaml
# GitHub Actions example
- name: Validate Documentation
  run: |
    cd e2e
    pnpm run test:documentation
```

## 🐛 Troubleshooting

### Common Issues

#### Permission Errors

```bash
chmod +x scripts/run-documentation-validation.sh
```

#### Missing Dependencies

```bash
pnpm install
pnpm exec playwright install
```

#### Timeout Issues

```bash
export PLAYWRIGHT_TIMEOUT=600000
```

#### Temp Directory Conflicts

```bash
rm -rf /tmp/reynard-doc-test-*
```

### Debug Mode

```bash
# Run with detailed logging
pnpm run test:documentation:debug

# Run specific test
pnpm exec playwright test --config=configs/playwright.config.documentation.ts --debug
```

## 📚 Best Practices

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
```

```typescript
// ✅ Good: Complete TypeScript example
import { createSignal } from "solid-js";
import { Button } from "reynard-components";

function App() {
  const [count, setCount] = createSignal(0);
  return <Button onClick={() => setCount(count() + 1)}>Count: {count()}</Button>;
}

// ❌ Bad: Incomplete or missing imports
function App() {
  return <Button>Click me</Button>;
}
```

## 🚀 Future Enhancements

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

## 📄 License

This documentation validation system is part of the Reynard project and follows the same MIT license terms.

---

🦩 *flamingo feathers ruffle with validation satisfaction* The documentation validation system ensures that every code example in the Reynard project is accurate, executable, and up-to-date. By creating isolated test environments and executing real code, we maintain the highest standards of documentation quality and developer experience!

