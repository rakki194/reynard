# 🦊 Dev Server Management Test Suite

Comprehensive test suite for the development server management system

## Overview

This test suite provides comprehensive coverage for the dev server management system, including unit tests, integration tests, and CLI tests. The tests ensure reliability, performance, and correctness across all components.

## Test Structure

### Core Component Tests

- **`ConfigManager.test.ts`** - Configuration management, validation, and persistence
- **`PortManager.test.ts`** - Port allocation, conflict detection, and range management
- **`ProcessManager.test.ts`** - Process lifecycle, monitoring, and error handling
- **`HealthChecker.test.ts`** - Health monitoring, HTTP checks, and command-based checks
- **`DevServerManager.test.ts`** - Main orchestrator integration and workflows

### CLI Tests

- **`cli.test.ts`** - Command-line interface, argument parsing, and output formatting

### Integration Tests

- **`integration.test.ts`** - End-to-end workflows, component interactions, and system behavior

### Test Utilities

- **`test-utils.ts`** - Mock data factories, test helpers, and environment setup
- **`setup.ts`** - Global test configuration and setup
- **`index.test.ts`** - Test suite overview and coverage verification

## Running Tests

### All Tests

```bash
pnpm test
```

### Unit Tests Only

```bash
pnpm test:unit
```

### Integration Tests Only

```bash
pnpm test:integration
```

### CLI Tests Only

```bash
pnpm test:cli
```

### With Coverage

```bash
pnpm test:coverage
```

### Watch Mode

```bash
pnpm test:watch
```

### UI Mode

```bash
pnpm test:ui
```

## Test Configuration

### Vitest Configuration

- **Environment**: Node.js
- **Timeout**: 10 seconds
- **Coverage**: 80% threshold for all metrics
- **Parallel**: Enabled with thread pool
- **Isolation**: Enabled for test reliability

### Coverage Requirements

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Categories

### Unit Tests

Test individual components in isolation with mocked dependencies:

- Configuration loading and validation
- Port allocation and conflict resolution
- Process lifecycle management
- Health check execution
- Event system functionality

### Integration Test Scenarios

Test component interactions and end-to-end workflows:

- Complete development sessions
- Dependency-based startup/shutdown
- Error recovery and resilience
- Configuration updates during runtime
- Performance under load

### CLI Command Tests

Test command-line interface functionality:

- Command parsing and validation
- Output formatting and display
- Error handling and user feedback
- Progress indication and status updates

## Mock System

### File System Mocks

- In-memory file system for configuration files
- File read/write operations
- Permission and access control simulation

### Process Mocks

- Process spawning and lifecycle simulation
- Output stream handling
- Exit code and signal management

### Network Mocks

- Port availability checking
- HTTP health check responses
- Network error simulation

### Event System Mocks

- Event emission and handling
- Event listener management
- Event timing and sequencing

## Test Utilities and Helpers

### Mock Data Factory Functions

```typescript
createMockProjectConfig(overrides);
createMockDevServerConfig(overrides);
createMockServerInfo(overrides);
createMockHealthStatus(overrides);
createMockProcessInfo(overrides);
createMockPortInfo(overrides);
```

### Test Helpers

```typescript
waitForEvent(emitter, event, timeout);
waitForEvents(emitter, events, timeout);
expectEventEmitted(emitter, eventType, project);
expectConfigValid(config);
expectProjectConfigValid(project);
```

### Environment Setup

```typescript
setupTestEnvironment();
cleanupTestEnvironment();
```

## Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test both success and failure scenarios

### Mock Management

- Reset mocks between tests
- Use realistic mock data
- Verify mock interactions
- Clean up resources after tests

### Error Testing

- Test all error conditions
- Verify error messages and codes
- Test error recovery mechanisms
- Ensure graceful degradation

### Performance Testing

- Test with realistic data volumes
- Measure response times
- Test concurrent operations
- Verify resource cleanup

## Continuous Integration

### Pre-commit Hooks

- Run unit tests
- Check test coverage
- Lint test files
- Type check test code

### CI Pipeline

- Run all test suites
- Generate coverage reports
- Upload test results
- Fail on coverage regression

## Debugging Tests

### Verbose Output

```bash
VITEST_VERBOSE=true pnpm test
```

### Single Test File

```bash
pnpm test src/__tests__/ConfigManager.test.ts
```

### Specific Test

```bash
pnpm test --grep "should load valid configuration"
```

### Debug Mode

```bash
pnpm test --inspect-brk
```

## Test Data

### Sample Configurations

- Valid configurations for all scenarios
- Invalid configurations for error testing
- Edge cases and boundary conditions
- Migration test data

### Mock Responses

- HTTP health check responses
- Process output simulation
- Network error conditions
- File system operations

## Coverage Reports

### HTML Report

Generated in `coverage/index.html` with:

- Line-by-line coverage
- Branch coverage analysis
- Function coverage details
- Uncovered code highlighting

### JSON Report

Generated in `coverage/coverage-final.json` for:

- CI/CD integration
- Coverage trend analysis
- Threshold enforcement
- Report aggregation

## Troubleshooting

### Common Issues

#### Tests timing out

- Increase timeout values
- Check for infinite loops
- Verify async/await usage
- Review mock implementations

#### Mock not working

- Reset mocks between tests
- Check mock implementation
- Verify mock call order
- Use proper mock types

#### Coverage not meeting thresholds

- Add missing test cases
- Test error conditions
- Cover edge cases
- Review uncovered code

#### Integration tests failing

- Check test environment setup
- Verify mock configurations
- Review test data
- Check for race conditions

### Debug Commands

```bash
# Run with debug output
DEBUG=* pnpm test

# Run specific test with verbose output
pnpm test --reporter=verbose src/__tests__/ConfigManager.test.ts

# Check test coverage for specific file
pnpm test:coverage --reporter=verbose src/__tests__/ConfigManager.test.ts
```

## Contributing

### Adding New Tests

1. Create test file in appropriate directory
2. Follow naming convention: `ComponentName.test.ts`
3. Use existing test utilities and mocks
4. Add to appropriate test script in package.json
5. Update this README if needed

### Test Guidelines

- Write tests before implementing features (TDD)
- Keep tests simple and focused
- Use descriptive test names
- Test both happy path and error cases
- Maintain high test coverage
- Keep tests fast and reliable

---

_Built with the cunning precision of a fox_ 🦊
