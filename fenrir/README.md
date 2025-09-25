# 🦊 Fenrir MCP Authentication Security Tests

Comprehensive security testing suite for MCP (Model Context Protocol) authentication system, including MCP server security, FastAPI backend integration, and end-to-end authentication flow validation.

## Overview

Fenrir provides comprehensive security testing for the Reynard MCP authentication system, ensuring:

- **MCP Server Security**: Verifies the MCP server is not publicly accessible without proper authentication
- **JWT Token Validation**: Tests token generation, validation, expiration, and permission checking
- **Rate Limiting**: Validates abuse prevention and rate limiting mechanisms
- **End-to-End Flow**: Tests complete authentication flow between MCP and FastAPI backend
- **Cross-Service Integration**: Ensures tokens work correctly across different services
- **Security Headers**: Validates proper security headers and CORS configuration

## Test Architecture

### Test Components

1. **Python Unit Tests** (`test_mcp_authentication.py`)
   - Core authentication logic testing
   - JWT token validation
   - Permission checking
   - Rate limiting validation

2. **Playwright E2E Tests** (`mcp-authentication.spec.ts`)
   - End-to-end authentication flow testing
   - Cross-service integration testing
   - Security header validation
   - Performance and load testing

3. **Test Utilities**
   - `MCPAuthTestSuite`: Token generation and validation utilities
   - `SecurityTestUtils`: Security testing helpers and attack payloads

4. **Test Runner** (`run_authentication_tests.py`)
   - Comprehensive test orchestration
   - Environment validation
   - Report generation
   - Results aggregation

## Quick Start

### Prerequisites

1. **Python Dependencies**

   ```bash
   pip install pytest requests PyJWT fastapi
   ```

2. **Node.js Dependencies**

   ```bash
   cd e2e
   npm install
   npx playwright install
   ```

3. **Running Services**
   - MCP Server: `http://localhost:8001`
   - FastAPI Backend: `http://localhost:8000`

### Running Tests

#### Run All Tests

```bash
python fenrir/run_authentication_tests.py --all --verbose
```

#### Run Python Unit Tests Only

```bash
python fenrir/run_authentication_tests.py --unit
```

#### Run Playwright E2E Tests Only

```bash
python fenrir/run_authentication_tests.py --e2e
```

#### Run with Custom Output

```bash
python fenrir/run_authentication_tests.py --all --output my_results.json
```

## Test Categories

### 🔒 MCP Server Security Tests

- **Public Accessibility**: Verifies unauthenticated requests are rejected
- **Invalid Token Rejection**: Tests rejection of malformed/invalid tokens
- **Expired Token Handling**: Validates proper expiration checking
- **Permission Validation**: Ensures permission-based access control works
- **Tool Access Control**: Tests unauthorized tool access blocking

### 🔗 FastAPI Backend Integration Tests

- **Bootstrap Authentication**: Tests the initial authentication flow
- **Invalid Credentials**: Validates rejection of invalid credentials
- **Token Refresh**: Tests token refresh mechanism
- **Client Type Validation**: Ensures proper client type checking

### 🛡️ Rate Limiting and Abuse Prevention

- **Authentication Rate Limiting**: Tests rate limiting on auth endpoints
- **Brute Force Protection**: Validates protection against brute force attacks
- **Request Throttling**: Tests throttling of rapid requests
- **Concurrent Request Handling**: Validates handling of concurrent requests

### 🔄 End-to-End Authentication Flow

- **Complete Flow**: Tests full MCP to backend authentication flow
- **Cross-Service Validation**: Ensures tokens work across services
- **Token Expiration**: Tests proper expiration handling
- **Session Management**: Validates session state maintenance

### 🔐 Advanced Security Features

- **JWT Signature Validation**: Tests signature verification
- **Malformed Token Handling**: Validates handling of malformed tokens
- **CORS Headers**: Tests proper CORS configuration
- **Security Headers**: Validates security header presence
- **Token Revocation**: Tests token revocation mechanism

### 📊 Performance and Load Testing

- **High Load Authentication**: Tests authentication under high load
- **Sustained Load**: Validates performance under sustained load
- **Response Time Validation**: Ensures responses within acceptable limits
- **Concurrent Session Handling**: Tests multiple concurrent sessions

## Test Configuration

### Environment Variables

```bash
# MCP Server Configuration
MCP_SERVER_URL=http://localhost:8001
MCP_TOKEN_SECRET=reynard-mcp-secret-key-2025
MCP_TOKEN_ALGORITHM=HS256
MCP_TOKEN_EXPIRE_HOURS=24

# FastAPI Backend Configuration
FASTAPI_BACKEND_URL=http://localhost:8000

# Test Configuration
TEST_CLIENT_ID=test-mcp-client
TEST_CLIENT_SECRET=test-secret-key-2025
```

### Test Data

The test suite uses various test data patterns:

- **Valid Test Clients**: Properly configured test clients with appropriate permissions
- **Invalid Credentials**: Malformed, expired, or incorrect authentication data
- **Attack Payloads**: SQL injection, XSS, path traversal, and other attack vectors
- **Load Test Data**: High-volume concurrent request patterns
- **Edge Cases**: Boundary conditions and error scenarios

## Security Test Coverage

### Authentication Security

- ✅ JWT token generation and validation
- ✅ Token expiration and refresh mechanisms
- ✅ Permission-based access control
- ✅ Client type validation
- ✅ Signature verification

### Network Security

- ✅ HTTPS enforcement (when configured)
- ✅ CORS policy validation
- ✅ Security headers verification
- ✅ Request/response sanitization

### Application Security

- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS attack prevention
- ✅ Path traversal protection
- ✅ Command injection prevention

### Operational Security

- ✅ Rate limiting and throttling
- ✅ Brute force protection
- ✅ Session management
- ✅ Token revocation
- ✅ Audit logging

## Test Results and Reporting

### Report Format

The test runner generates comprehensive reports including:

- **Test Summary**: Overall pass/fail statistics
- **Detailed Results**: Per-test results with timing information
- **Security Scan Results**: Bandit security scan findings
- **Recommendations**: Actionable security improvement suggestions

### Output Files

- **JSON Results**: Machine-readable test results
- **Console Output**: Human-readable test progress and results
- **Security Reports**: Detailed security scan findings

### Example Output

```
🦊 Fenrir MCP Authentication Security Test Report
============================================================
Timestamp: 2025-01-15T10:30:00
Test Suite: Fenrir MCP Authentication Security

📊 Test Summary
--------------------
Total Tests: 45
Passed: 43
Failed: 2
Success Rate: 95.6%

🔍 Python Tests
------------------------------
Status: completed
Duration: 12.34 seconds
Overall Status: PASS

🔍 Playwright Tests
------------------------------
Status: completed
Duration: 45.67 seconds

💡 Recommendations
--------------------
🎉 All tests passed! Your authentication system is secure.
```

## Troubleshooting

### Common Issues

1. **Service Connection Errors**
   - Ensure MCP server and FastAPI backend are running
   - Check service URLs and ports
   - Verify network connectivity

2. **Authentication Failures**
   - Verify test client credentials
   - Check JWT secret configuration
   - Ensure proper token generation

3. **Rate Limiting Issues**
   - Adjust rate limiting configuration
   - Check for existing rate limit blocks
   - Verify test timing and intervals

4. **Playwright Test Failures**
   - Ensure Playwright is properly installed
   - Check browser dependencies
   - Verify e2e test configuration

### Debug Mode

Run tests with verbose logging for detailed debugging:

```bash
python fenrir/run_authentication_tests.py --all --verbose
```

### Environment Validation

The test runner automatically validates the test environment:

- Service connectivity checks
- Required package verification
- Configuration validation
- Test data preparation

## Contributing

### Adding New Tests

1. **Python Tests**: Add to `test_mcp_authentication.py`
2. **E2E Tests**: Add to `mcp-authentication.spec.ts`
3. **Utilities**: Extend test utility classes as needed

### Test Guidelines

- **Comprehensive Coverage**: Test both success and failure scenarios
- **Security Focus**: Prioritize security-related test cases
- **Performance Awareness**: Include performance and load testing
- **Documentation**: Document test purpose and expected behavior

### Code Style

- Follow existing code patterns and conventions
- Use descriptive test names and comments
- Include proper error handling and cleanup
- Maintain test isolation and independence

## Security Considerations

### Test Data Security

- Use dedicated test credentials and tokens
- Avoid using production data in tests
- Clean up test data after test completion
- Use secure random generation for test data

### Test Environment

- Run tests in isolated environments
- Use dedicated test databases and services
- Implement proper test data isolation
- Monitor test execution for security issues

### Reporting Security

- Avoid logging sensitive information
- Sanitize error messages in reports
- Use secure file handling for results
- Implement proper access controls for test results

## License

This test suite is part of the Reynard project and follows the same licensing terms.

## Support

For issues, questions, or contributions:

1. Check the troubleshooting section above
2. Review existing test patterns and examples
3. Consult the Reynard project documentation
4. Submit issues through the project's issue tracker

---

_Created by Odonata-Oracle-6 (Dragonfly Specialist) - Determined, patient, and loyal to the cause of secure authentication._ 🦟
