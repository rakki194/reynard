# E2E Testing Framework for Reynard

🦊 _red fur gleams with strategic organization_ Comprehensive end-to-end testing framework for the Reynard ecosystem, featuring modular architecture, domain-specific testing modules, and advanced security testing capabilities.

## 🏗️ Architecture Overview

The E2E testing framework is organized into a clean, modular structure that separates concerns and provides clear boundaries between different testing domains:

```
e2e/
├── core/                    # Core testing infrastructure
│   ├── setup/              # Global setup and teardown
│   ├── config/             # Configuration management
│   └── types/              # Shared type definitions
├── modules/                # Domain-specific testing modules
│   ├── auth/               # Authentication testing
│   ├── dom/                # DOM testing utilities
│   ├── i18n/               # Internationalization testing
│   ├── security/           # Security and penetration testing
│   └── mock/               # Mock server utilities
├── suites/                 # Test suites (organized by domain)
│   ├── auth/               # Authentication test suites
│   ├── dom/                # DOM assertion test suites
│   ├── i18n/               # I18n benchmark test suites
│   └── security/           # Security test suites
├── fixtures/               # Test data and fixtures
├── results/                # Test results and reports
├── configs/                # Playwright configurations
└── backend/                # E2E test backend
```

## 🚀 Features

### 🦊 Authentication Testing

- **Complete Auth Flows**: Registration, login, logout, password change, profile updates
- **Token Management**: Access token refresh, expiration handling, secure storage
- **Session Management**: Session persistence, concurrent logins, state management
- **Security Testing**: XSS protection, CSRF protection, rate limiting, input validation

### 🦦 DOM Testing

- **Comprehensive Assertions**: Visibility, presence, attributes, focus, forms
- **Accessibility Testing**: ARIA attributes, keyboard navigation, screen reader support
- **Responsive Testing**: Mobile viewport testing, responsive design validation
- **Interactive Testing**: Form interactions, button states, dynamic content

### 🌍 I18n Testing

- **Performance Benchmarking**: Load times, render times, memory usage analysis
- **Language Switching**: Multi-language support testing, RTL language support
- **Bundle Analysis**: Size impact analysis, compression effectiveness
- **Pluralization Testing**: Complex pluralization rules, edge case handling

### 🐺 Security Testing

- **Penetration Testing**: Comprehensive security assessment with Fenrir integration
- **Vulnerability Scanning**: SQL injection, XSS, CSRF, path traversal, SSRF
- **Attack Simulation**: Advanced attack patterns, race conditions, HTTP smuggling
- **Security Assessment**: Automated security recommendations and reporting

### 🎭 Mock Testing

- **API Mocking**: Comprehensive mock server with configurable endpoints
- **Response Simulation**: Success, error, and edge case response handling
- **Performance Testing**: Load testing with mock backends
- **Integration Testing**: Frontend-backend integration with controlled responses

## 📁 Module Structure

### Core Infrastructure (`core/`)

#### Setup (`core/setup/`)

- `global-setup.ts` - Main global test setup
- `global-teardown.ts` - Main global test cleanup
- `global-i18n-setup.ts` - I18n-specific setup
- `global-i18n-teardown.ts` - I18n-specific cleanup
- `global-penetration-setup.ts` - Security testing setup
- `global-penetration-teardown.ts` - Security testing cleanup

#### Configuration (`core/config/`)

- `port-detector.ts` - Automatic port detection for test servers

#### Types (`core/types/`)

- `index.ts` - Shared type definitions for all testing modules

### Testing Modules (`modules/`)

#### Authentication Module (`modules/auth/`)

- `auth-helpers.ts` - Main authentication test helpers class
- `auth-core-operations.ts` - Core authentication operations
- `auth-form-handlers.ts` - Form interaction handlers
- `auth-verification-helpers.ts` - Authentication state verification
- `auth-flow-scenarios.ts` - Complete authentication flow scenarios
- `auth-utility-helpers.ts` - Utility functions and environment setup
- `auth-token-manager.ts` - Token management utilities
- `auth-form-utilities.ts` - Form-specific utilities
- `auth-element-verification.ts` - Element verification helpers
- `auth-mock-helpers.ts` - Mock authentication helpers

#### DOM Testing Module (`modules/dom/`)

- `dom-test-helpers.ts` - Core DOM testing utilities
- `dom-assertion-helpers.ts` - DOM assertion utilities
- `dom-element-assertions.ts` - Element-specific assertions
- `dom-test-page-utils.ts` - Test page management utilities

#### I18n Testing Module (`modules/i18n/`)

- `i18n-benchmark-helpers.ts` - Main i18n benchmark helper class
- `i18n-benchmark-types.ts` - I18n benchmark type definitions
- `i18n-cache-utils.ts` - I18n caching utilities
- `i18n-memory-utils.ts` - Memory usage analysis
- `i18n-translation-utils.ts` - Translation testing utilities
- `i18n-test-data-utils.ts` - Test data generation
- `i18n-reporting-utils.ts` - Report generation utilities
- `i18n-file-manager.ts` - File management utilities
- `i18n-json-generator.ts` - JSON report generation
- `i18n-markdown-generator.ts` - Markdown report generation
- `i18n-performance-analyzer.ts` - Performance analysis
- `i18n-performance-reporter.ts` - Performance reporting
- `i18n-performance-types.ts` - Performance type definitions
- `i18n-report-generator.ts` - Report generation
- `i18n-section-generator.ts` - Section generation
- `i18n-table-generator.ts` - Table generation

#### Security Testing Module (`modules/security/`)

- `security-assessor.ts` - Main security assessment class
- `penetration-helpers.ts` - Penetration testing utilities
- `penetration-test-config.ts` - Security test configuration
- `penetration-types.ts` - Security testing type definitions
- `exploit-class-mapper.ts` - Exploit class mapping
- `exploit-recommendations.ts` - Security recommendations
- `exploit-runner.ts` - Exploit execution utilities
- `fenrir-class-mapper.ts` - Fenrir integration mapping
- `fenrir-runner.ts` - Fenrir execution utilities
- `fenrir-suite-runner.ts` - Fenrir test suite runner

#### Mock Testing Module (`modules/mock/`)

- `mock-backend-server.ts` - Mock backend server implementation
- `mock-server-factory.ts` - Mock server factory
- `backend-mock.ts` - Backend mocking utilities
- `mock-api-client.ts` - Mock API client
- `mock-endpoint-configs.ts` - Endpoint configuration
- `mock-types.ts` - Mock type definitions

## 🧪 Test Suites

### Authentication Suites (`suites/auth/`)

- `auth.spec.ts` - Basic authentication tests

### DOM Testing Suites (`suites/dom/`)

- `dom-accessibility.spec.ts` - Accessibility testing
- `dom-attributes.spec.ts` - Attribute testing
- `dom-content.spec.ts` - Content testing
- `dom-focus.spec.ts` - Focus testing
- `dom-forms.spec.ts` - Form testing
- `dom-interactions.spec.ts` - Interaction testing
- `dom-presence.spec.ts` - Presence testing
- `dom-text.spec.ts` - Text testing
- `dom-visibility.spec.ts` - Visibility testing

### I18n Testing Suites (`suites/i18n/`)

- `i18n-benchmark.spec.ts` - Core i18n benchmarks
- `i18n-bundle-analysis.spec.ts` - Bundle size analysis
- `i18n-rendering-approaches.spec.ts` - Rendering approach comparison

### Security Testing Suites (`suites/security/`)

- `penetration-tests.spec.ts` - Main penetration tests
- `direct-penetration.spec.ts` - Direct penetration tests
- `advanced-attacks.spec.ts` - Advanced attack patterns
- `api-security.spec.ts` - API security testing
- `comprehensive-assessment.spec.ts` - Comprehensive security assessment
- `csrf-attacks.spec.ts` - CSRF attack testing
- `fuzzing-tests.spec.ts` - Fuzzing tests
- `fuzzing-quick-tests.spec.ts` - Quick fuzzing tests
- `fuzzing-comprehensive-tests.spec.ts` - Comprehensive fuzzing
- `http-smuggling-attacks.spec.ts` - HTTP smuggling tests
- `jwt-security.spec.ts` - JWT security testing
- `path-traversal.spec.ts` - Path traversal testing
- `race-condition-attacks.spec.ts` - Race condition testing
- `sql-injection.spec.ts` - SQL injection testing
- `ssrf-attacks.spec.ts` - SSRF attack testing
- `unicode-attacks.spec.ts` - Unicode attack testing

## ⚙️ Configuration

### Playwright Configurations (`configs/`)

#### Main Configuration (`configs/playwright.config.ts`)

- **Purpose**: General E2E testing for auth and DOM
- **Test Directory**: `../suites`
- **Excludes**: Security and I18n tests
- **Output**: `../results/e2e-results/`

#### DOM Configuration (`configs/playwright.config.dom.ts`)

- **Purpose**: DOM and basic auth testing
- **Test Directory**: `../suites`
- **Includes**: DOM and auth tests
- **Output**: `../results/dom-assertions-results/`

#### I18n Configuration (`configs/playwright.config.i18n.ts`)

- **Purpose**: I18n performance benchmarking
- **Test Directory**: `../suites`
- **Includes**: I18n tests only
- **Output**: `../results/i18n-benchmark-results/`
- **Features**: Performance-optimized settings, extended timeouts

#### Security Configuration (`configs/playwright.config.penetration.ts`)

- **Purpose**: Security and penetration testing
- **Test Directory**: `../suites`
- **Includes**: Security tests only
- **Output**: `../results/penetration-results/`
- **Features**: Sequential execution, extended timeouts, security-focused settings

## 🛠️ Setup and Usage

### Prerequisites

- Node.js 18+
- Python 3.13
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install
```

### Running Tests

#### All Tests

```bash
# Run all tests with main configuration
pnpm exec playwright test --config=configs/playwright.config.ts
```

#### Domain-Specific Tests

```bash
# Authentication and DOM tests
pnpm exec playwright test --config=configs/playwright.config.dom.ts

# I18n performance benchmarks
pnpm exec playwright test --config=configs/playwright.config.i18n.ts

# Security and penetration tests
pnpm exec playwright test --config=configs/playwright.config.penetration.ts
```

#### Specific Test Suites

```bash
# Run specific test suite
pnpm exec playwright test suites/auth/auth.spec.ts
pnpm exec playwright test suites/dom/dom-accessibility.spec.ts
pnpm exec playwright test suites/i18n/i18n-benchmark.spec.ts
pnpm exec playwright test suites/security/penetration-tests.spec.ts
```

### Development Mode

```bash
# Run tests in headed mode
pnpm exec playwright test --headed

# Run tests in debug mode
pnpm exec playwright test --debug

# Run tests with UI
pnpm exec playwright test --ui
```

## 📊 Test Results

All test results are organized in the `results/` directory:

- `e2e-results/` - Main E2E test results
- `dom-assertions-results/` - DOM testing results
- `i18n-benchmark-results/` - I18n performance results
- `penetration-results/` - Security testing results

### Viewing Results

```bash
# View HTML report
pnpm exec playwright show-report

# View specific test results
pnpm exec playwright show-report results/e2e-results/
pnpm exec playwright show-report results/i18n-benchmark-results/
pnpm exec playwright show-report results/penetration-results/
```

## 🔧 Development

### Adding New Tests

1. **Choose the appropriate module** based on functionality
2. **Create test file** in the corresponding suite directory
3. **Import utilities** from the appropriate module
4. **Follow naming conventions** for consistency
5. **Update documentation** if adding new functionality

### Module Development

1. **Create utility files** in the appropriate module directory
2. **Export from module index** for clean imports
3. **Add type definitions** to `core/types/` if needed
4. **Update main module index** for global exports
5. **Add tests** for new utilities

### Configuration Updates

1. **Modify appropriate config** in `configs/` directory
2. **Update test paths** if moving files
3. **Adjust output directories** if needed
4. **Update global setup/teardown** paths if moved

## 🐛 Troubleshooting

### Common Issues

#### Import Errors

- Check that module index files are properly exporting utilities
- Verify import paths match the new structure
- Ensure all dependencies are properly installed

#### Test Failures

- Check that test servers are running on correct ports
- Verify test data is properly loaded
- Check browser console for JavaScript errors

#### Configuration Issues

- Verify Playwright configuration paths are correct
- Check that output directories exist
- Ensure global setup/teardown files are accessible

### Debug Mode

```bash
# Run specific test in debug mode
pnpm exec playwright test --debug suites/auth/auth.spec.ts

# Run with trace viewer
pnpm exec playwright test --trace on
```

## 🤝 Contributing

### Code Style

- Follow the existing naming conventions
- Use TypeScript for all new code
- Add comprehensive JSDoc comments
- Include error handling and validation

### Testing

- Add tests for new utilities
- Ensure all tests pass in CI
- Update documentation for new features
- Follow the modular architecture principles

### Documentation

- Update README files for new functionality
- Add examples for complex features
- Document configuration changes
- Maintain the animal spirit theme in comments

## 📄 License

This E2E testing framework is part of the Reynard project and follows the same license terms.

---

_🦊 \_red fur gleams with strategic satisfaction_ The E2E testing framework is now organized with the cunning precision of a fox, the playful thoroughness of an otter, and the ferocious security focus of a wolf. Every test is a calculated move in our quest for code perfection!\_
