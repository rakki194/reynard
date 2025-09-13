# E2E Authentication Tests for Reynard

Comprehensive end-to-end authentication testing for the Reynard ecosystem, covering integration between gatekeeper,
backend, and auth package components.

## Overview

This E2E test suite provides comprehensive testing of authentication workflows across the entire Reynard stack:

- **Gatekeeper Library**: JWT-based authentication with role-based access control
- **Backend**: FastAPI authentication endpoints and security features
- **Auth Package**: SolidJS frontend authentication components and state management

## 🚀 Features

- **Complete Auth Flows**: Registration, login, logout, password change, profile updates
- **Security Testing**: XSS protection, CSRF protection, rate limiting, input validation
- **Token Management**: Access token refresh, expiration handling, secure storage
- **Session Management**: Session persistence, concurrent logins, state management
- **Integration Testing**: Cross-component communication and data flow
- **Performance Testing**: Response times, concurrent user scenarios
- **Error Handling**: Network errors, server errors, malformed responses

## 📁 Structure

```text
e2e/
├── auth.spec.ts              # Main authentication test suite
├── playwright.config.ts      # Playwright configuration
├── global-setup.ts          # Global test setup
├── global-teardown.ts       # Global test cleanup
├── utils/
│   ├── e2e-setup.ts         # E2E test environment setup
│   ├── backend-mock.ts      # Mock backend server
│   └── auth-helpers.ts      # Authentication test helpers
├── fixtures/
│   └── test-data.ts         # Test data and scenarios
└── README.md                # This file
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Python 3.13
- Docker (optional, for containerized testing)

### Installation

1. **Install dependencies**:

   ```bash
   npm install @playwright/test
   npx playwright install
   ```

2. **Setup environment variables**:

   ```bash
   export PLAYWRIGHT_BASE_URL="http://localhost:3000"
   export PLAYWRIGHT_API_BASE_URL="http://localhost:8000"
   ```

3. **Start backend server**:

   ```bash
   cd backend
   python main.py
   ```

4. **Start frontend server**:

   ```bash
   cd examples/auth-app
   npm run dev
   ```

## 🧪 Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test auth.spec.ts
```

### Run Tests in Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests with Debug Mode

```bash
npx playwright test --debug
```

### Run Tests in Headed Mode

```bash
npx playwright test --headed
```

## 📊 Test Categories

### 1. User Registration Tests

- ✅ Valid user registration
- ✅ Validation error handling
- ✅ Duplicate username handling
- ✅ Password strength requirements
- ✅ Email format validation

### 2. User Login Tests

- ✅ Valid credentials login
- ✅ Invalid credentials handling
- ✅ Rate limiting protection
- ✅ Account lockout scenarios
- ✅ Remember me functionality

### 3. Token Management Tests

- ✅ Automatic token refresh
- ✅ Token expiration handling
- ✅ Invalid token scenarios
- ✅ Secure token storage
- ✅ Token cleanup on logout

### 4. Session Management Tests

- ✅ Session persistence across page refreshes
- ✅ Concurrent login handling
- ✅ Session timeout scenarios
- ✅ Cross-tab session synchronization
- ✅ Logout and session cleanup

### 5. Security Tests

- ✅ XSS attack prevention
- ✅ CSRF protection
- ✅ SQL injection prevention
- ✅ Input sanitization
- ✅ Password strength enforcement

### 6. Integration Tests

- ✅ Frontend ↔ Backend communication
- ✅ Gatekeeper ↔ Backend integration
- ✅ Auth package ↔ API client integration
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness

### 7. Performance Tests

- ✅ Login response times
- ✅ Token refresh performance
- ✅ Concurrent user scenarios
- ✅ Memory leak detection
- ✅ Network optimization

### 8. Error Handling Tests

- ✅ Network error scenarios
- ✅ Server error handling
- ✅ Malformed response handling
- ✅ Timeout scenarios
- ✅ Graceful degradation

## 🔧 Configuration

### Environment Variables

| Variable                  | Default                 | Description              |
| ------------------------- | ----------------------- | ------------------------ |
| `PLAYWRIGHT_BASE_URL`     | `http://localhost:3000` | Frontend application URL |
| `PLAYWRIGHT_API_BASE_URL` | `http://localhost:8000` | Backend API URL          |
| `CI`                      | `false`                 | CI environment flag      |
| `DEBUG`                   | `false`                 | Debug mode flag          |

### Test Configuration

The test configuration is defined in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Reporters**: HTML, JSON, JUnit
- **Artifacts**: Screenshots, videos, traces on failure
- **Timeouts**: 30s global, 10s per action
- **Retries**: 2 retries on CI, 0 locally

## 📈 Test Data

### Test Users

The test suite includes various test user types:

- **Valid User**: Standard user with valid credentials
- **Admin User**: Administrator with elevated permissions
- **Moderator User**: Moderator with limited admin access
- **Invalid User**: User with validation errors
- **Weak Password User**: User with weak password
- **Special Character User**: User with special characters
- **Unicode User**: User with Unicode characters
- **Inactive User**: Disabled user account

### Mock Responses

Comprehensive mock API responses for:

- Successful registration/login
- Authentication failures
- Rate limiting responses
- Token refresh scenarios
- User profile data
- Error responses

## 🐛 Debugging

### View Test Results

```bash
npx playwright show-report
```

### Debug Failed Tests

```bash
npx playwright test --debug auth.spec.ts
```

### Take Screenshots

Screenshots are automatically taken on test failures and saved to `e2e-results/`.

### View Traces

Traces are collected on first retry and can be viewed with:

```bash
npx playwright show-trace e2e-results/trace.zip
```

## 🔒 Security Considerations

### Test Data Security

- All test passwords are clearly marked as test data
- No real credentials are used in tests
- Test database is isolated from production
- All test data is cleaned up after tests

### Network Security

- Tests run against localhost by default
- No external network calls in test environment
- Mock responses prevent data leakage
- Secure token handling in tests

## 📝 Best Practices

### Writing Tests

1. **Use descriptive test names** that explain the scenario
2. **Keep tests independent** - each test should be able to run in isolation
3. **Use page objects** for complex interactions
4. **Add proper waits** for dynamic content
5. **Use data attributes** for selectors when possible
6. **Clean up test data** in `afterEach` or `afterAll` hooks

### Test Organization

1. **Group related tests** using `test.describe()`
2. **Use consistent naming** conventions
3. **Separate concerns** - unit tests vs integration tests
4. **Mock external dependencies** appropriately
5. **Test edge cases** and error scenarios

## 🚨 Troubleshooting

### Common Issues

#### Tests Failing with Timeout

```bash
# Increase timeout in playwright.config.ts
timeout: 60 * 1000, // 60 seconds
```

#### Backend Not Starting

```bash
# Check if port 8000 is available
netstat -tulpn | grep :8000

# Start backend manually
cd backend && python main.py
```

#### Frontend Not Loading

```bash
# Check if port 3000 is available
netstat -tulpn | grep :3000

# Start frontend manually
cd examples/auth-app && npm run dev
```

#### Browser Installation Issues

```bash
# Reinstall browsers
npx playwright install --force
```

### Getting Help

1. Check the [Playwright documentation](https://playwright.dev/)
2. Review test logs in `e2e-results/`
3. Use debug mode to step through tests
4. Check browser console for errors

## 🤝 Contributing

### Adding New Tests

1. Create test file in appropriate directory
2. Follow existing naming conventions
3. Add test data to `fixtures/test-data.ts`
4. Update this README with new test categories
5. Ensure tests pass in all browsers

### Test Data Management

1. Add new test users to `TestUserData` class
2. Add new mock responses to `MockApiResponses` class
3. Add new scenarios to `TestScenarios` class
4. Ensure all test data is cleaned up

## 📄 License

This E2E test suite is part of the Reynard project and follows the same license terms.
