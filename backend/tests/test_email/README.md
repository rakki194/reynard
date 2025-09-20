# 🦊 Reynard Advanced Email Features Test Suite

Comprehensive test suite for the advanced email features implemented in the Reynard system.

## Overview

This test suite provides thorough coverage of all advanced email functionality including:

- **📊 Email Analytics** - Metrics, insights, and reporting
- **🔐 Email Encryption** - PGP/SMIME support with key management  
- **📅 Calendar Integration** - Meeting extraction and scheduling
- **🤖 AI-Powered Responses** - LLM integration for automated replies
- **👥 Multi-Account Support** - Account management and isolation
- **🌐 API Routes** - RESTful endpoints for all features

## Test Structure

### Test Files

| File | Description | Test Count |
|------|-------------|------------|
| `test_email_analytics_service.py` | Email analytics service tests | 25+ tests |
| `test_email_encryption_service.py` | Email encryption service tests | 30+ tests |
| `test_calendar_integration_service.py` | Calendar integration tests | 25+ tests |
| `test_ai_email_response_service.py` | AI response service tests | 35+ tests |
| `test_multi_account_service.py` | Multi-account service tests | 30+ tests |
| `test_advanced_email_routes.py` | API route integration tests | 40+ tests |

**Total: 185+ comprehensive tests**

### Test Categories

#### 🧪 Unit Tests

- Individual service method testing
- Data model validation
- Configuration testing
- Error handling verification

#### 🔗 Integration Tests  

- API endpoint functionality
- Service interaction testing
- Database persistence
- Authentication flow

#### ⚡ Performance Tests

- Response time validation
- Caching effectiveness
- Memory usage monitoring
- Concurrent operation testing

#### 🛡️ Security Tests

- Authentication verification
- Authorization checks
- Data encryption validation
- Input sanitization

#### 🔄 Error Handling Tests

- Exception scenarios
- Invalid input handling
- Service failure recovery
- Graceful degradation

## Running Tests

### Prerequisites

```bash
# Install required dependencies
pip install pytest pytest-asyncio pytest-mock pytest-html pytest-xdist

# Ensure backend dependencies are installed
pip install -r ../../requirements.txt
```

### Quick Start

```bash
# Run all email tests
python run_all_email_tests.py

# Or use pytest directly
pytest -v

# Run specific test file
pytest test_email_analytics_service.py -v

# Run tests with coverage
pytest --cov=app --cov-report=html
```

### Test Execution Options

```bash
# Run tests in parallel (faster execution)
pytest -n auto

# Run only fast tests (exclude slow tests)
pytest -m "not slow"

# Run specific test category
pytest -m analytics
pytest -m encryption
pytest -m calendar
pytest -m ai
pytest -m multi_account
pytest -m api

# Run with detailed output
pytest -v -s --tb=long

# Run tests matching pattern
pytest -k "test_encrypt"

# Stop on first failure
pytest -x

# Run failed tests only
pytest --lf
```

## Test Configuration

### Pytest Configuration (`pytest.ini`)

The test suite uses a comprehensive pytest configuration with:

- **Async Support**: Automatic async test detection
- **Markers**: Categorized test markers for selective execution
- **Logging**: Detailed logging configuration
- **Timeouts**: 5-minute timeout for long-running tests
- **Warnings**: Filtered warnings for cleaner output

### Test Markers

```python
@pytest.mark.unit
@pytest.mark.integration  
@pytest.mark.slow
@pytest.mark.analytics
@pytest.mark.encryption
@pytest.mark.calendar
@pytest.mark.ai
@pytest.mark.multi_account
@pytest.mark.api
@pytest.mark.error_handling
@pytest.mark.data_persistence
@pytest.mark.authentication
@pytest.mark.performance
```

## Test Data and Fixtures

### Common Fixtures

- **`mock_user`**: Authenticated user for API tests
- **`mock_auth_dependency`**: Authentication dependency mock
- **`sample_email_data`**: Standard email data for testing
- **`temp_dir`**: Temporary directory for file operations

### Service Fixtures

Each service has dedicated fixtures for:

- Service initialization with temporary data
- Mock external dependencies
- Sample data for testing
- Error scenario simulation

## Mocking Strategy

### External Dependencies

- **OpenAI API**: Mocked responses for AI functionality
- **Anthropic API**: Mocked responses for Claude integration
- **GnuPG**: Mocked PGP operations
- **Calendar APIs**: Mocked calendar service calls
- **Database**: In-memory storage for testing

### Service Dependencies

- **Authentication**: Mocked user authentication
- **File System**: Temporary directories for persistence
- **Network Calls**: Mocked HTTP requests
- **Time Operations**: Controlled time for testing

## Test Reports

### Generated Reports

After test execution, the following reports are generated:

- **`test_report.html`**: Comprehensive HTML report with test results
- **`test_results.xml`**: JUnit XML format for CI/CD integration
- **`test_summary.json`**: JSON summary with execution metadata
- **Coverage Report**: HTML coverage report (if pytest-cov installed)

### Report Features

- **Test Results**: Pass/fail status for each test
- **Execution Time**: Duration of each test
- **Error Details**: Stack traces for failed tests
- **Coverage Metrics**: Code coverage statistics
- **Performance Data**: Slowest tests identification

## Continuous Integration

### GitHub Actions Integration

```yaml
name: Email Features Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-mock
      - name: Run email tests
        run: |
          cd backend/tests/test_email
          python run_all_email_tests.py
      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: backend/tests/test_email/test_results.xml
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: email-tests
        name: Run Email Tests
        entry: python backend/tests/test_email/run_all_email_tests.py
        language: system
        pass_filenames: false
        always_run: true
```

## Debugging Tests

### Common Issues

1. **Import Errors**: Ensure backend directory is in Python path
2. **Async Issues**: Use `pytest-asyncio` for async test support
3. **Mock Failures**: Verify mock setup and call expectations
4. **File Permissions**: Check temporary directory permissions

### Debug Commands

```bash
# Run with debug output
pytest -v -s --tb=long --pdb

# Run single test with debugging
pytest test_email_analytics_service.py::TestEmailAnalyticsService::test_get_email_metrics_success -v -s --pdb

# Check test discovery
pytest --collect-only

# Verbose test collection
pytest --collect-only -v
```

## Performance Benchmarks

### Expected Performance

- **Unit Tests**: < 1 second per test
- **Integration Tests**: < 5 seconds per test
- **Full Suite**: < 2 minutes total execution
- **Memory Usage**: < 100MB peak usage

### Performance Monitoring

```bash
# Run with performance profiling
pytest --durations=0

# Memory profiling (requires memory_profiler)
pytest --profile

# Parallel execution for speed
pytest -n auto
```

## Contributing

### Adding New Tests

1. **Follow Naming Convention**: `test_<functionality>_<scenario>.py`
2. **Use Appropriate Markers**: Mark tests with relevant categories
3. **Include Docstrings**: Document test purpose and expected behavior
4. **Mock External Dependencies**: Use fixtures for consistent mocking
5. **Test Edge Cases**: Include error scenarios and boundary conditions

### Test Quality Guidelines

- **Single Responsibility**: Each test should verify one specific behavior
- **Independence**: Tests should not depend on each other
- **Deterministic**: Tests should produce consistent results
- **Fast Execution**: Avoid slow operations in unit tests
- **Clear Assertions**: Use descriptive assertion messages

## Troubleshooting

### Common Problems

| Problem | Solution |
|---------|----------|
| Import errors | Check Python path and dependencies |
| Async test failures | Ensure `pytest-asyncio` is installed |
| Mock not working | Verify mock setup and call expectations |
| File permission errors | Check temporary directory permissions |
| Slow test execution | Use parallel execution with `-n auto` |

### Getting Help

- **Check Logs**: Review test output for error details
- **Run Individual Tests**: Isolate failing tests
- **Verify Dependencies**: Ensure all required packages are installed
- **Check Configuration**: Verify pytest.ini settings

## License

This test suite is part of the Reynard project and follows the same licensing terms.

---

*whiskers twitch with testing precision* The email system is thoroughly tested and ready for production! 🦊
