# 🐼 Continuous Indexing Tests

This directory contains comprehensive pytest tests for the continuous indexing service, written with panda spirit and thoroughness.

## Test Structure

- `test_continuous_indexing_service.py` - Tests for the main service functionality
- `test_continuous_indexing_config.py` - Tests for configuration management
- `conftest.py` - Shared fixtures and test utilities
- `__init__.py` - Package initialization

## Running Tests

### Run All Tests

```bash
cd backend
python -m pytest tests/services/continuous_indexing/ -v
```

### Run Specific Test Files

```bash
# Service tests only
python -m pytest tests/services/continuous_indexing/test_continuous_indexing_service.py -v

# Configuration tests only
python -m pytest tests/services/continuous_indexing/test_continuous_indexing_config.py -v
```

### Run with Coverage

```bash
python -m pytest tests/services/continuous_indexing/ --cov=app.services.continuous_indexing --cov-report=html
```

### Use the Test Runner Script

```bash
cd backend
./run_continuous_indexing_tests.py --type all
./run_continuous_indexing_tests.py --type service
./run_continuous_indexing_tests.py --type config
```

## Test Categories

### 🐼 Service Tests (`test_continuous_indexing_service.py`)

- **Service Lifecycle**: Initialization, startup, shutdown
- **File System Events**: Modified, created, deleted file handling
- **Queue Processing**: Indexing and removal queue management
- **RAG Integration**: Document indexing and error handling
- **Thread Safety**: Cross-thread task scheduling
- **Statistics**: Service metrics and reporting

### 🐼 Configuration Tests (`test_continuous_indexing_config.py`)

- **Environment Variables**: Loading and parsing configuration
- **File Filtering**: Include/exclude patterns and directories
- **Validation**: Configuration validation and error handling
- **Defaults**: Default value testing
- **File Size Limits**: Size-based filtering

### 🐼 Integration Tests

- **Full Workflow**: Complete indexing workflow testing
- **Error Handling**: Graceful error handling and recovery
- **Performance**: Queue processing and timeout handling

## Test Fixtures

The `conftest.py` file provides shared fixtures:

- `temp_directory` - Temporary directory for file operations
- `mock_rag_service` - Mock RAG service for testing
- `indexing_service` - Service instance for testing
- `test_files` - Various test files for indexing
- `panda_test_files` - Panda-themed test files (for fun!)
- `excluded_files` - Files that should be excluded
- `excluded_directories` - Directories that should be excluded

## Panda Spirit Features

All tests are written with panda spirit:

- 🐼 Thorough and comprehensive coverage
- 🐼 Playful and engaging test names
- 🐼 Panda-themed test utilities and helpers
- 🐼 Beautiful error messages with panda emojis
- 🐼 Bamboo-themed test data and fixtures

## Test Markers

Tests use custom markers for organization:

- `@pytest.mark.panda_spirit` - Tests written with panda spirit
- `@pytest.mark.continuous_indexing` - Continuous indexing tests
- `@pytest.mark.continuous_indexing_config` - Configuration tests
- `@pytest.mark.asyncio` - Async tests

## Dependencies

Required packages for running tests:

- `pytest` - Test framework
- `pytest-asyncio` - Async test support
- `pytest-mock` - Mocking utilities
- `pytest-cov` - Coverage reporting (optional)

## Author

**Ailuropoda-Sage-59** (Panda Spirit)

- 🐼 Strategic problem-solving with panda wisdom
- 🐼 Thorough testing with playful enthusiasm
- 🐼 Comprehensive coverage with bamboo precision
