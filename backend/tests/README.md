# Reynard Backend Test Suite

🦦> A comprehensive test suite for the Reynard Backend, designed with otter-like thoroughness and playful rigor!

## Overview

This test suite provides comprehensive coverage of all backend functionality including:

- **Authentication & Authorization**: JWT tokens, password security, user management
- **API Endpoints**: All REST endpoints with request/response validation
- **Security**: Input validation, security headers, vulnerability testing
- **Integration**: End-to-end workflows and service interactions
- **Performance**: Load testing and performance validation
- **CI/CD**: Automated testing for continuous integration

## Test Structure

```
tests/
├── conftest.py                 # Shared fixtures and configuration
├── test_auth/                  # Authentication tests
│   ├── test_password_utils.py  # Password hashing and security
│   ├── test_jwt_utils.py       # JWT token handling
│   └── test_user_service.py    # User management
├── test_api/                   # API endpoint tests
│   ├── test_auth_routes.py     # Authentication routes
│   └── test_caption_endpoints.py # Caption generation API
├── test_security/              # Security tests
│   ├── test_input_validation.py # Input validation and injection tests
│   └── test_security_headers.py # Security headers and middleware
├── test_integration/           # Integration tests
│   └── test_auth_workflow.py   # Complete authentication workflows
└── test_config/                # Configuration and CI tests
    └── test_ci_integration.py  # CI/CD integration tests
```

## Quick Start

### Prerequisites

- Python 3.8+
- Virtual environment (recommended)

### Installation

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   pip install -r requirements-test.txt
   ```

### Running Tests

#### Using the Test Runner Script

The easiest way to run tests is using the provided script:

```bash
# Run all tests with coverage
./scripts/run-tests.sh

# Run specific test types
./scripts/run-tests.sh -t unit          # Unit tests only
./scripts/run-tests.sh -t integration   # Integration tests only
./scripts/run-tests.sh -t security      # Security tests only
./scripts/run-tests.sh -t api           # API tests only
./scripts/run-tests.sh -t auth          # Authentication tests only

# Run with different options
./scripts/run-tests.sh -v               # Verbose output
./scripts/run-tests.sh -p               # Parallel execution
./scripts/run-tests.sh -r xml           # XML report format
./scripts/run-tests.sh --no-cleanup     # Don't cleanup artifacts
```

#### Using pnpm Scripts

```bash
# Run all tests
pnpm test:all

# Run specific test types
pnpm test:unit
pnpm test:integration
pnpm test:security
pnpm test:api
pnpm test:auth

# Run with coverage
pnpm test:coverage

# Run in parallel
pnpm test:parallel

# Run for CI
pnpm test:ci
```

#### Using pytest Directly

```bash
# Run all tests
pytest

# Run specific test modules
pytest tests/test_auth/
pytest tests/test_api/
pytest tests/test_security/

# Run with coverage
pytest --cov=app --cov-report=html

# Run in parallel
pytest -n auto

# Run with verbose output
pytest -v -s
```

## Test Categories

### 🦊> Unit Tests

Test individual components in isolation:

- **Password Utils**: Hashing, verification, security measures
- **JWT Utils**: Token creation, verification, security
- **User Service**: User creation, authentication, management

### 🦦> Integration Tests

Test complete workflows and service interactions:

- **Authentication Workflow**: Registration → Login → Protected Access → Logout
- **Multi-user Scenarios**: Concurrent operations, session management
- **Error Recovery**: Handling failures and edge cases

### 🐺> Security Tests

Test security measures and vulnerability prevention:

- **Input Validation**: SQL injection, XSS, path traversal, command injection
- **Security Headers**: CORS, CSP, HSTS, and other security headers
- **Authentication Security**: Token security, password policies

### 🔧> API Tests

Test all REST endpoints:

- **Authentication Routes**: Register, login, logout, refresh, me
- **Caption Generation**: Single and batch caption generation
- **Protected Routes**: Access control and authorization

### ⚙️> Configuration Tests

Test configuration and CI/CD integration:

- **Startup Performance**: Application startup time
- **Health Checks**: Endpoint availability and performance
- **Load Testing**: Concurrent request handling

## Test Configuration

### pytest.ini

Main pytest configuration with:

- Test discovery patterns
- Coverage settings
- Custom markers
- Warning filters

### conftest.py

Shared fixtures for:

- Test clients (sync and async)
- Mock services
- Test data
- Database cleanup
- Authentication tokens

## Coverage Reports

The test suite generates comprehensive coverage reports:

- **Terminal**: Real-time coverage during test execution
- **HTML**: Detailed HTML report in `htmlcov/` directory
- **XML**: Machine-readable report for CI/CD integration

### Coverage Targets

- **Overall Coverage**: 80% minimum
- **Critical Components**: 90% minimum (auth, security)
- **API Endpoints**: 85% minimum

## Security Testing

### Input Validation Tests

Comprehensive testing against:

- SQL injection attempts
- XSS payloads
- Path traversal attacks
- Command injection
- LDAP injection
- XML injection
- NoSQL injection

### Security Headers Tests

Validation of:

- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security
- Referrer-Policy
- CORS configuration

## Performance Testing

### Load Testing

- Concurrent user operations
- Stress testing
- Memory usage stability
- Response time validation

### CI/CD Performance

- Startup time validation
- Health check performance
- Graceful degradation testing

## Continuous Integration

### GitHub Actions

Automated testing on:

- Multiple Python versions (3.8, 3.9, 3.10, 3.11)
- Security scanning with Bandit
- Dependency vulnerability scanning
- Performance testing with Locust

### Test Artifacts

Generated artifacts:

- Coverage reports
- Security scan results
- Performance metrics
- Test result summaries

## Best Practices

### Writing Tests

1. **Use descriptive test names** that explain what is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Test both success and failure cases**
4. **Use appropriate fixtures** for setup and teardown
5. **Mock external dependencies** appropriately

### Test Organization

1. **Group related tests** in classes
2. **Use markers** to categorize tests
3. **Keep tests independent** and isolated
4. **Use meaningful assertions** with clear error messages

### Security Testing

1. **Test all input vectors** for injection attacks
2. **Validate security headers** on all endpoints
3. **Test authentication and authorization** thoroughly
4. **Verify error handling** doesn't leak sensitive information

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure virtual environment is activated
2. **Database Errors**: Check that in-memory databases are properly cleaned
3. **Authentication Failures**: Verify JWT configuration and test tokens
4. **Coverage Issues**: Ensure all code paths are tested

### Debug Mode

Run tests with verbose output for debugging:

```bash
./scripts/run-tests.sh -v
```

### Test Isolation

If tests are interfering with each other:

```bash
./scripts/run-tests.sh --no-cleanup
```

## Contributing

When adding new tests:

1. **Follow existing patterns** and conventions
2. **Add appropriate markers** for test categorization
3. **Update coverage targets** if needed
4. **Document new test scenarios** in this README
5. **Ensure tests pass** in CI/CD pipeline

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Python Testing Best Practices](https://docs.python.org/3/library/unittest.html)

---

🦦> Happy testing! Remember, good tests are like a playful otter - thorough, curious, and always exploring new possibilities!
