# PHOENIX Control Test Suite

This directory contains comprehensive tests for the PHOENIX Control system. The test suite ensures the reliability, correctness, and robustness of all components.

## Test Structure

### Test Files

- **`test_success_advisor.py`**: Tests for Success-Advisor-8 agent reconstruction and functionality
- **`test_agent_state.py`**: Tests for AgentState data structure and operations
- **`test_persistence.py`**: Tests for agent state persistence system
- **`test_data_structures.py`**: Tests for custom data structures and enums

### Test Categories

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing
3. **Validation Tests**: Data validation and error handling
4. **Serialization Tests**: Data persistence and recovery
5. **Configuration Tests**: System configuration validation

## Running Tests

### Prerequisites

1. **Python Environment**: Ensure Python 3.8+ is installed
2. **Dependencies**: Install required packages from `requirements.txt`
3. **Test Framework**: Install pytest for test execution

### Installation

```bash
# Navigate to the phoenix_control directory
cd experimental/phoenix_control

# Install dependencies
pip install -r requirements.txt

# Install pytest if not already installed
pip install pytest
```

### Test Execution

```bash
# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_success_advisor.py -v

# Run tests with coverage
python -m pytest tests/ --cov=src/ --cov-report=html

# Run tests in parallel
python -m pytest tests/ -n auto

# Run tests with detailed output
python -m pytest tests/ -v -s
```

### Test Configuration

Create a `pytest.ini` file for test configuration:

```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow running tests
```

## Test Coverage

### Coverage Goals

- **Unit Tests**: 90%+ coverage for core components
- **Integration Tests**: 80%+ coverage for system interactions
- **Validation Tests**: 100% coverage for data validation
- **Error Handling**: 100% coverage for error scenarios

### Coverage Reports

```bash
# Generate HTML coverage report
python -m pytest tests/ --cov=src/ --cov-report=html

# Generate terminal coverage report
python -m pytest tests/ --cov=src/ --cov-report=term-missing

# Generate XML coverage report
python -m pytest tests/ --cov=src/ --cov-report=xml
```

## Test Data

### Test Fixtures

Tests use fixtures for consistent test data:

- **`temp_dir`**: Temporary directory for file operations
- **`persistence`**: Persistence system instance
- **`sample_agent_state`**: Sample agent state for testing

### Mock Data

Tests include mock data for:

- Agent states and configurations
- Performance metrics and statistics
- Release configurations and quality settings
- Error scenarios and edge cases

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual components in isolation

**Examples**:

- Agent state creation and validation
- Data structure serialization/deserialization
- Configuration object validation
- Enum value handling

**Coverage**: Core functionality and data structures

### 2. Integration Tests

**Purpose**: Test component interactions and workflows

**Examples**:

- Agent state persistence and recovery
- Release automation workflow
- Quality assurance pipeline
- System initialization and configuration

**Coverage**: Component interactions and system workflows

### 3. Validation Tests

**Purpose**: Test data validation and error handling

**Examples**:

- Invalid agent state handling
- Malformed configuration detection
- Error recovery and fallback mechanisms
- Input validation and sanitization

**Coverage**: Error handling and data validation

### 4. Serialization Tests

**Purpose**: Test data persistence and recovery

**Examples**:

- JSON serialization/deserialization
- File I/O operations
- Backup and recovery procedures
- State consistency validation

**Coverage**: Data persistence and recovery

### 5. Configuration Tests

**Purpose**: Test system configuration and setup

**Examples**:

- Configuration object validation
- Default value handling
- Configuration serialization
- Environment-specific settings

**Coverage**: System configuration and setup

## Test Best Practices

### 1. Test Organization

- **One test file per component**: Clear separation of concerns
- **Descriptive test names**: Clear indication of what is being tested
- **Consistent structure**: Follow established patterns
- **Proper fixtures**: Use fixtures for test data and setup

### 2. Test Data

- **Isolated test data**: Each test uses its own data
- **Realistic scenarios**: Test with realistic data and scenarios
- **Edge cases**: Include boundary conditions and edge cases
- **Error scenarios**: Test error handling and recovery

### 3. Assertions

- **Specific assertions**: Test specific behavior and outcomes
- **Clear error messages**: Provide meaningful failure information
- **Multiple assertions**: Test multiple aspects when appropriate
- **Exception testing**: Test expected exceptions and error conditions

### 4. Test Maintenance

- **Regular updates**: Keep tests current with code changes
- **Refactoring**: Refactor tests when code is refactored
- **Documentation**: Document complex test scenarios
- **Performance**: Ensure tests run efficiently

## Continuous Integration

### CI Pipeline

Tests are integrated into the CI/CD pipeline:

1. **Code Quality**: Linting and formatting checks
2. **Unit Tests**: Fast unit test execution
3. **Integration Tests**: Component interaction testing
4. **Coverage Analysis**: Test coverage reporting
5. **Performance Tests**: Performance regression testing

### CI Configuration

```yaml
# Example GitHub Actions configuration
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.8
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: python -m pytest tests/ --cov=src/
      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure the `src` directory is in the Python path
2. **Missing Dependencies**: Install all required packages
3. **Permission Issues**: Ensure write permissions for test directories
4. **Test Failures**: Review test output and error messages

### Debug Mode

Enable debug mode for detailed test output:

```bash
# Run tests with debug output
python -m pytest tests/ -v -s --tb=long

# Run specific test with debug
python -m pytest tests/test_success_advisor.py::TestSuccessAdvisor8::test_agent_initialization -v -s
```

### Test Isolation

Ensure tests are properly isolated:

- Use temporary directories for file operations
- Clean up test data after each test
- Avoid shared state between tests
- Use fixtures for consistent setup/teardown

## Contributing

When adding new tests:

1. **Follow Structure**: Use the established test structure
2. **Include Documentation**: Add comprehensive docstrings
3. **Test Edge Cases**: Include boundary conditions and error scenarios
4. **Maintain Coverage**: Ensure adequate test coverage
5. **Update README**: Update this README with new test information

## Support

For questions or issues with tests:

1. **Check Logs**: Review test output for error messages
2. **Validate Setup**: Ensure all prerequisites are met
3. **Review Configuration**: Check test configuration
4. **Test Components**: Verify individual components work
5. **Seek Help**: Contact the development team for assistance

---

**Note**: This test suite is designed to ensure the reliability and correctness of the PHOENIX Control system. All tests should pass before any code changes are merged into the main branch.
