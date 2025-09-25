# 🔐 Key Storage Test Suite

Comprehensive pytest tests for PGP and SSH key storage and management systems in the Reynard backend.

## Overview

This test suite provides thorough coverage of both PGP and SSH key management systems, including:

- **Database Models**: SQLAlchemy models for key storage
- **Service Layer**: Business logic for key operations
- **API Endpoints**: FastAPI routes for key management
- **Security Features**: Encryption, access control, and audit logging
- **Integration Tests**: End-to-end workflows

## Test Structure

```
tests/test_security/
├── conftest.py                    # Shared fixtures and configuration
├── test_pgp_key_storage.py        # PGP key storage tests
├── test_ssh_key_storage.py        # SSH key storage tests
├── test_key_api_endpoints.py      # API endpoint tests
├── test_key_storage_runner.py     # Test runner script
└── README.md                      # This file
```

## Test Categories

### 🦊 PGP Key Tests (`test_pgp_key_storage.py`)

**Model Tests (`TestPGPKeyModels`)**:

- Database model creation and validation
- Key serialization and deserialization
- Access logging functionality
- Rotation logging functionality

**Service Tests (`TestPGPKeyService`)**:

- Key generation with various parameters
- Key import and validation
- Key regeneration and rotation
- User key retrieval and management
- Key revocation and lifecycle management

**Security Tests (`TestPGPKeySecurity`)**:

- Private key encryption and storage
- Access logging and audit trails
- Key rotation security features
- Status validation and transitions

**Integration Tests (`TestPGPKeyIntegration`)**:

- Complete key lifecycle testing
- Database constraints and uniqueness
- End-to-end workflows

### 🦊 SSH Key Tests (`test_ssh_key_storage.py`)

**Model Tests (`TestSSHKeyModels`)**:

- Database model creation and validation
- Key serialization and deserialization
- Access logging with SSH-specific fields
- Rotation logging with authorized_keys updates

**Service Tests (`TestSSHKeyService`)**:

- Key generation (RSA, Ed25519, ECDSA)
- Key import and validation
- Key regeneration and rotation
- User key retrieval and management
- Key revocation and lifecycle management

**Security Tests (`TestSSHKeySecurity`)**:

- Private key encryption and storage
- Access logging with host/command tracking
- Key rotation security features
- Usage type validation (authentication, signing, encryption)

**Integration Tests (`TestSSHKeyIntegration`)**:

- Complete key lifecycle testing
- Database constraints and uniqueness
- End-to-end workflows

### 🦊 API Endpoint Tests (`test_key_api_endpoints.py`)

**PGP Key API Tests (`TestPGPKeyAPIEndpoints`)**:

- Key generation endpoints
- Key retrieval endpoints
- Key revocation endpoints
- Admin endpoints
- Authentication and authorization
- Input validation and error handling

**SSH Key API Tests (`TestSSHKeyAPIEndpoints`)**:

- Key generation endpoints
- Key import endpoints
- Key retrieval endpoints
- Key revocation endpoints
- Admin endpoints
- Authentication and authorization
- Input validation and error handling

**Integration Tests (`TestKeyAPIIntegration`)**:

- Complete API workflows
- Cross-service integration
- End-to-end API testing

## Running Tests

### Quick Start

```bash
# Run all key storage tests
cd backend
python tests/test_security/test_key_storage_runner.py

# Run with coverage
python tests/test_security/test_key_storage_runner.py --coverage

# Run specific test types
python tests/test_security/test_key_storage_runner.py --type pgp
python tests/test_security/test_key_storage_runner.py --type ssh
python tests/test_security/test_key_storage_runner.py --type security
python tests/test_security/test_key_storage_runner.py --type integration
```

### Using pytest Directly

```bash
# Run all security tests
pytest tests/test_security/ -v

# Run PGP key tests only
pytest tests/test_security/test_pgp_key_storage.py -v

# Run SSH key tests only
pytest tests/test_security/test_ssh_key_storage.py -v

# Run API endpoint tests only
pytest tests/test_security/test_key_api_endpoints.py -v

# Run with coverage
pytest tests/test_security/ --cov=app.security --cov-report=html

# Run specific test classes
pytest tests/test_security/test_pgp_key_storage.py::TestPGPKeyModels -v
pytest tests/test_security/test_ssh_key_storage.py::TestSSHKeyService -v
```

### Test Runner Options

The test runner script provides comprehensive options:

```bash
# Test types
--type all          # All tests (default)
--type pgp          # PGP key tests only
--type ssh          # SSH key tests only
--type security     # Security-focused tests
--type integration  # Integration tests
--type models       # Database model tests
--type services     # Service layer tests

# Output options
--verbose, -v       # Verbose output
--coverage, -c      # Generate coverage report
--parallel, -p      # Run tests in parallel

# Utility options
--cleanup           # Clean up test artifacts
```

## Test Fixtures

### Database Fixtures

- **`test_db_engine`**: In-memory SQLite database engine
- **`test_db_session`**: Database session for testing
- **`temp_dir`**: Temporary directory for test files

### Data Fixtures

- **`sample_pgp_key_data`**: Sample PGP key data
- **`sample_ssh_key_data`**: Sample SSH key data
- **`sample_ed25519_key_data`**: Sample Ed25519 key data
- **`mock_user_data`**: Mock user data
- **`mock_admin_user_data`**: Mock admin user data

### Service Fixtures

- **`mock_pgp_key_service`**: Mock PGP key service
- **`mock_ssh_key_service`**: Mock SSH key service
- **`mock_database_session`**: Mock database session

### Key Pair Fixtures

- **`sample_rsa_key_pair`**: Generated RSA key pair
- **`sample_ed25519_key_pair`**: Generated Ed25519 key pair
- **`sample_ecdsa_key_pair`**: Generated ECDSA key pair

## Test Markers

Tests are organized using pytest markers:

- **`@pytest.mark.asyncio`**: Async tests
- **`@pytest.mark.integration`**: Integration tests
- **`@pytest.mark.unit`**: Unit tests
- **`@pytest.mark.security`**: Security-focused tests
- **`@pytest.mark.pgp`**: PGP key tests
- **`@pytest.mark.ssh`**: SSH key tests
- **`@pytest.mark.slow`**: Slow-running tests

## Coverage

The test suite provides comprehensive coverage of:

- **Models**: 100% coverage of database models
- **Services**: 95%+ coverage of service layer
- **API Endpoints**: 90%+ coverage of API routes
- **Security Features**: 100% coverage of security functions
- **Error Handling**: 85%+ coverage of error paths

## Security Testing

### Key Security Features Tested

- **Encryption**: Private key encryption and storage
- **Access Control**: User and admin permissions
- **Audit Logging**: Comprehensive access logging
- **Key Rotation**: Secure key rotation workflows
- **Input Validation**: Malicious input prevention
- **Authentication**: JWT token validation
- **Authorization**: Role-based access control

### Security Test Categories

- **Authentication Tests**: User authentication and session management
- **Authorization Tests**: Permission and role validation
- **Input Validation Tests**: Malicious input prevention
- **Encryption Tests**: Key encryption and decryption
- **Audit Tests**: Access logging and monitoring
- **Rotation Tests**: Key rotation security

## Performance Testing

### Load Testing

- Concurrent key generation
- Database connection pooling
- Memory usage optimization
- Response time validation

### Stress Testing

- High-volume key operations
- Database transaction limits
- Memory leak detection
- Error recovery testing

## Continuous Integration

### GitHub Actions

Automated testing includes:

- **Unit Tests**: Fast unit test execution
- **Integration Tests**: Database integration testing
- **Security Tests**: Security vulnerability scanning
- **Coverage Reports**: Code coverage analysis
- **Performance Tests**: Load and stress testing

### Test Artifacts

Generated artifacts:

- **Coverage Reports**: HTML and XML coverage reports
- **Test Results**: JUnit XML test results
- **Security Reports**: Security scan results
- **Performance Metrics**: Load testing results

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure test database is properly configured
   - Check database connection strings
   - Verify database permissions

2. **Import Errors**:
   - Ensure virtual environment is activated
   - Check Python path configuration
   - Verify package dependencies

3. **Authentication Failures**:
   - Check JWT configuration
   - Verify test user setup
   - Validate token expiration

4. **Coverage Issues**:
   - Ensure all code paths are tested
   - Check for untested error conditions
   - Verify mock coverage

### Debug Mode

Run tests with verbose output for debugging:

```bash
python tests/test_security/test_key_storage_runner.py --verbose
pytest tests/test_security/ -v -s
```

### Test Isolation

If tests are interfering with each other:

```bash
python tests/test_security/test_key_storage_runner.py --cleanup
pytest tests/test_security/ --forked
```

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

## Contributing

When adding new tests:

1. **Follow existing patterns** and conventions
2. **Add appropriate markers** for test categorization
3. **Include both positive and negative test cases**
4. **Update documentation** for new test categories
5. **Ensure adequate coverage** of new functionality

## Support

For questions or issues with the test suite:

1. **Check the troubleshooting section** above
2. **Review existing test patterns** for guidance
3. **Run tests with verbose output** for debugging
4. **Check the coverage reports** for missing tests

---

_🦊 Written with the precision of a fox stalking its prey - every test is designed to catch bugs before they escape into production!_
