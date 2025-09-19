# Agent Naming Test Suite

🦊 **Comprehensive pytest test suite for the Reynard Agent Naming library**

This test suite provides thorough coverage of all components in the agent naming system, including unit tests, integration tests, and performance tests.

## Test Structure

```
tests/
├── __init__.py                 # Test package initialization
├── conftest.py                 # Pytest fixtures and configuration
├── test_types.py               # Tests for types.py module
├── test_generator.py           # Tests for generator.py module
├── test_manager.py             # Tests for manager.py module
├── test_modular_generator.py   # Tests for modular_generator.py module
├── test_naming_utilities.py    # Tests for naming_utilities.py module
├── test_integration.py         # Integration tests for complete system
└── README.md                   # This file
```

## Test Categories

### 🧪 Unit Tests

- **`test_types.py`**: Tests for all enums, dataclasses, and type validation
- **`test_generator.py`**: Tests for ReynardRobotNamer and all naming styles
- **`test_manager.py`**: Tests for AgentNameManager and persistence
- **`test_modular_generator.py`**: Tests for ModularAgentNamer orchestration
- **`test_naming_utilities.py`**: Tests for utilities, validation, and analysis

### 🔗 Integration Tests

- **`test_integration.py`**: Tests for complete system integration
- Cross-component communication
- Data persistence and retrieval
- ECS world simulation integration
- Error handling and recovery
- Performance and concurrency

## Running Tests

### Quick Start

```bash
# Run all tests
python run_tests.py

# Run with verbose output
python run_tests.py --verbose

# Run only unit tests
python run_tests.py --unit

# Run only integration tests
python run_tests.py --integration

# Run fast tests only (exclude slow tests)
python run_tests.py --fast
```

### Advanced Options

```bash
# Run with coverage report
python run_tests.py --coverage

# Run tests in parallel
python run_tests.py --parallel 4

# Run specific test file
python run_tests.py --specific test_types.py

# Run with HTML report
python run_tests.py --html-report

# Run with debug output
python run_tests.py --debug

# Stop after 5 failures
python run_tests.py --maxfail 5
```

### Direct pytest Usage

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_types.py

# Run specific test class
pytest tests/test_generator.py::TestFoundationStyleGeneration

# Run specific test method
pytest tests/test_generator.py::TestFoundationStyleGeneration::test_generate_foundation_style_with_spirit

# Run with markers
pytest -m "not slow"
pytest -m "integration"
pytest -m "unit"
```

## Test Fixtures

The test suite includes comprehensive fixtures in `conftest.py`:

### Data Fixtures

- `temp_data_dir`: Temporary directory for test data
- `sample_agent_names`: Sample agent names for testing
- `sample_agents_data`: Sample agents data for persistence testing
- `agents_file`: Temporary agents file with sample data
- `naming_configs`: Various naming configurations for testing

### Component Fixtures

- `all_animal_spirits`: All available animal spirits
- `all_naming_styles`: All available naming styles
- `all_naming_schemes`: All available naming schemes
- `sample_agent_name`: Sample AgentName object
- `mock_ecs_world`: Mock ECS world simulation

### Validation Fixtures

- `expected_name_patterns`: Expected name patterns for different styles
- `spirit_weights`: Expected spirit weights for weighted distribution
- `generation_numbers`: Expected generation numbers for different spirits

## Test Coverage

### Types Module (`test_types.py`)

- ✅ AnimalSpirit enum validation
- ✅ NamingStyle enum validation
- ✅ NamingScheme enum validation
- ✅ All type-specific enums (ElementalType, CelestialType, etc.)
- ✅ AgentName dataclass functionality
- ✅ NamingConfig dataclass functionality
- ✅ Serialization and deserialization
- ✅ Type integration and consistency

### Generator Module (`test_generator.py`)

- ✅ ReynardRobotNamer initialization
- ✅ Foundation-style name generation
- ✅ Exo-style name generation
- ✅ Cyberpunk-style name generation
- ✅ Mythological-style name generation
- ✅ Scientific-style name generation
- ✅ Hybrid-style name generation
- ✅ Random style generation
- ✅ Single name generation with configuration
- ✅ Batch name generation
- ✅ Spirit information analysis
- ✅ Error handling and fallbacks

### Manager Module (`test_manager.py`)

- ✅ AgentNameManager initialization
- ✅ Agent name generation
- ✅ Agent name assignment and persistence
- ✅ Agent name retrieval
- ✅ Agent listing
- ✅ ECS world simulation integration
- ✅ Simulation control methods
- ✅ Spirit selection functionality
- ✅ Name analysis
- ✅ Error handling and recovery

### Modular Generator Module (`test_modular_generator.py`)

- ✅ ModularAgentNamer initialization
- ✅ Single name generation with all styles
- ✅ Batch name generation
- ✅ Style-specific batch generation
- ✅ Spirit information analysis
- ✅ Name validation and sanitization
- ✅ Available options retrieval
- ✅ Random generation functionality
- ✅ Generator information
- ✅ Error handling and fallbacks

### Naming Utilities Module (`test_naming_utilities.py`)

- ✅ NamingDataLoader functionality
- ✅ NameBuilder utility methods
- ✅ RandomSelector utility methods
- ✅ NameValidator utility methods
- ✅ SpiritAnalyzer functionality
- ✅ Data consistency validation
- ✅ Error handling and edge cases

### Integration Tests (`test_integration.py`)

- ✅ Generator to manager integration
- ✅ Modular generator to manager integration
- ✅ Manager persistence integration
- ✅ ECS integration with manager
- ✅ Name analysis integration
- ✅ Batch generation integration
- ✅ Error handling integration
- ✅ Performance integration
- ✅ Data consistency integration
- ✅ Complete workflow integration
- ✅ Multi-agent workflow integration
- ✅ Error recovery integration
- ✅ Concurrent access integration
- ✅ Memory usage integration

## Test Markers

The test suite uses pytest markers for test categorization:

- `@pytest.mark.unit`: Unit tests
- `@pytest.mark.integration`: Integration tests
- `@pytest.mark.slow`: Slow tests (excluded with `--fast`)
- `@pytest.mark.performance`: Performance tests
- `@pytest.mark.ecs`: Tests requiring ECS integration

## Performance Benchmarks

The test suite includes performance tests that verify:

- Batch generation of 1000 names completes in < 10 seconds
- Memory usage remains stable during large batch operations
- Concurrent access works correctly with multiple threads
- File I/O operations complete efficiently

## Error Handling

The test suite verifies robust error handling for:

- Invalid input parameters
- File system errors
- Network connectivity issues (for ECS integration)
- Memory constraints
- Concurrent access conflicts
- Data corruption scenarios

## Continuous Integration

The test suite is designed to work with CI/CD pipelines:

- All tests can run in parallel
- Tests are deterministic and repeatable
- No external dependencies required (except for ECS tests)
- Clear exit codes for success/failure
- Comprehensive logging and reporting

## Contributing

When adding new tests:

1. **Follow naming conventions**: `test_*.py` for test files, `test_*` for test functions
2. **Use appropriate markers**: Mark tests with `@pytest.mark.unit`, `@pytest.mark.integration`, etc.
3. **Add fixtures**: Use existing fixtures or create new ones in `conftest.py`
4. **Test edge cases**: Include tests for error conditions and boundary cases
5. **Document complex tests**: Add docstrings explaining test purpose and expected behavior
6. **Maintain coverage**: Ensure new code is covered by appropriate tests

## Troubleshooting

### Common Issues

**Import Errors**: Ensure the package is properly installed or in the Python path

```bash
pip install -e .
# or
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

**Permission Errors**: Ensure test directories have proper write permissions

```bash
chmod -R 755 tests/
```

**Timeout Errors**: Increase timeout for slow tests

```bash
python run_tests.py --timeout 600
```

**Memory Issues**: Run tests with smaller batches

```bash
pytest -k "not test_performance_integration"
```

### Debug Mode

Run tests in debug mode for detailed output:

```bash
python run_tests.py --debug --pdb
```

This will:

- Show detailed logging output
- Drop into debugger on failures
- Provide full traceback information

## Test Results

The test suite provides comprehensive reporting:

- **Terminal Output**: Real-time test progress and results
- **HTML Reports**: Detailed HTML reports with coverage information
- **Coverage Reports**: Line-by-line coverage analysis
- **Performance Metrics**: Duration and performance statistics
- **Error Reports**: Detailed error information and stack traces

## Maintenance

The test suite is maintained to ensure:

- **Accuracy**: Tests accurately reflect expected behavior
- **Completeness**: All code paths are covered
- **Reliability**: Tests are stable and repeatable
- **Performance**: Tests complete in reasonable time
- **Clarity**: Tests are well-documented and understandable

---

🦊 _whiskers twitch with testing precision_ This test suite ensures that the Reynard Agent Naming library maintains the highest standards of quality and reliability. Every component is thoroughly tested, every edge case is covered, and every integration point is verified. The result is a robust, reliable system that you can trust to generate legendary agent names! 🦦🐺
