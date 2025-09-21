# ADR System Test Suite

🦊 _whiskers twitch with strategic cunning_ This comprehensive test suite ensures the ADR System operates with the precision of a fox stalking its prey, the thoroughness of an otter exploring streams, and the relentless determination of a wolf pack.

## Overview

The ADR System test suite provides comprehensive coverage of all components, ensuring reliability, maintainability, and correctness of the Architecture Decision Record system.

## Test Structure

### Core Component Tests

- **`CodebaseAnalyzer.test.ts`** - Tests for codebase analysis engine
- **`ADRGenerator.test.ts`** - Tests for ADR generation and template management
- **`ADRValidator.test.ts`** - Tests for ADR validation and quality assurance
- **`ADRRelationshipMapper.test.ts`** - Tests for relationship analysis and mapping
- **`types.test.ts`** - Tests for type definitions and interfaces

### Integration Tests

- **`integration.test.ts`** - End-to-end workflow and component interaction tests

### Test Utilities

- **`test-utils.ts`** - Test utilities, fixtures, and mock data
- **`run-tests.ts`** - Comprehensive test runner with CLI interface

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run tests with verbose output
npm run test:verbose
```

### Specific Test Commands

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run all tests with coverage and verbose output
npm run test:all
```

### Advanced Usage

```bash
# Run specific test file
npx vitest run src/__tests__/CodebaseAnalyzer.test.ts

# Run tests matching pattern
npx vitest run --grep "CodebaseAnalyzer"

# Run tests with specific reporter
npx vitest run --reporter=verbose

# Run tests with coverage and HTML report
npx vitest run --coverage --reporter=html
```

## Test Coverage

The test suite provides comprehensive coverage including:

### CodebaseAnalyzer Tests

- ✅ File discovery and scanning
- ✅ Metrics calculation
- ✅ Dependency analysis
- ✅ Architecture pattern detection
- ✅ Code quality assessment
- ✅ ADR suggestion generation
- ✅ Error handling and edge cases

### ADRGenerator Tests

- ✅ ADR generation from suggestions
- ✅ Template management and validation
- ✅ Multiple ADR generation
- ✅ ID generation and sequencing
- ✅ Title sanitization
- ✅ Content structure validation
- ✅ Error handling

### ADRValidator Tests

- ✅ ADR validation and parsing
- ✅ Required section validation
- ✅ Content quality assessment
- ✅ Placeholder text detection
- ✅ Decision clarity validation
- ✅ Consequences completeness
- ✅ Implementation plan validation
- ✅ Review section validation

### ADRRelationshipMapper Tests

- ✅ Relationship analysis
- ✅ Dependency chain detection
- ✅ Circular dependency detection
- ✅ Relationship graph generation
- ✅ Export/import functionality
- ✅ ADR parsing and metadata extraction

### Type Tests

- ✅ Type definition validation
- ✅ Interface compatibility
- ✅ Enum value validation
- ✅ Data structure consistency

### Integration Tests

- ✅ End-to-end workflow
- ✅ Component interaction
- ✅ Data consistency
- ✅ Error handling across components
- ✅ Performance and scalability

## Test Utilities

### Test Environment

The test suite provides a comprehensive test environment with:

- **Temporary directories** for isolated testing
- **Sample source files** for realistic testing scenarios
- **Sample ADR files** for validation and relationship testing
- **Mock file system** for controlled testing environments

### Test Fixtures

- **Sample TypeScript files** with imports and exports
- **Sample ADR files** with various structures and content
- **Template files** for generator testing
- **Configuration files** for realistic scenarios

### Mock Data

- **File system mocks** for controlled testing
- **Sample suggestions** for generator testing
- **Test relationships** for mapper testing
- **Validation scenarios** for comprehensive coverage

## Test Configuration

### Vitest Configuration

The test suite uses Vitest with the following configuration:

- **Node environment** for file system operations
- **Global test utilities** for consistent testing
- **Extended timeouts** for file operations
- **Coverage reporting** with multiple formats
- **Path aliases** for clean imports

### Coverage Configuration

Coverage reporting includes:

- **V8 provider** for accurate coverage
- **Multiple reporters** (text, json, html)
- **Exclusion patterns** for test files and configs
- **Threshold enforcement** for quality gates

## Best Practices

### Test Organization

- **Descriptive test names** that explain the scenario
- **Grouped tests** by functionality and component
- **Setup and teardown** for clean test isolation
- **Error scenarios** for robust error handling

### Test Data

- **Realistic test data** that mirrors production scenarios
- **Edge cases** for comprehensive coverage
- **Error conditions** for graceful failure testing
- **Performance scenarios** for scalability testing

### Assertions

- **Comprehensive assertions** that verify all aspects
- **Type checking** for interface compliance
- **Structure validation** for data integrity
- **Error message validation** for user experience

## Continuous Integration

The test suite is designed for CI/CD integration with:

- **Fast execution** for quick feedback
- **Deterministic results** for reliable builds
- **Coverage reporting** for quality metrics
- **Error reporting** for debugging

## Debugging Tests

### Common Issues

1. **File system errors** - Check test environment setup
2. **Timeout issues** - Verify file operations and async handling
3. **Coverage gaps** - Review test scenarios and edge cases
4. **Mock failures** - Validate mock data and expectations

### Debug Commands

```bash
# Run single test with debug output
npx vitest run src/__tests__/CodebaseAnalyzer.test.ts --reporter=verbose

# Run tests with debug logging
DEBUG=* npm run test

# Run tests with coverage and debug
npm run test:coverage -- --reporter=verbose
```

## Contributing

When adding new tests:

1. **Follow naming conventions** - Use descriptive test names
2. **Add comprehensive coverage** - Test all code paths
3. **Include error scenarios** - Test failure conditions
4. **Update documentation** - Keep this README current
5. **Run full test suite** - Ensure no regressions

## Performance

The test suite is optimized for:

- **Fast execution** - Tests complete in under 10 seconds
- **Parallel execution** - Tests run concurrently when possible
- **Minimal setup** - Efficient test environment creation
- **Clean teardown** - Proper resource cleanup

---

🦊 _whiskers twitch with satisfaction_ The ADR System test suite embodies the Reynard way of excellence - strategic thinking, thorough analysis, and relentless pursuit of quality. Every test is crafted with the cunning of a fox, the thoroughness of an otter, and the determination of a wolf pack.

_Built with 🦊 fox cunning, 🦦 otter thoroughness, and 🐺 wolf precision for the Reynard framework_
