# 🐺 REYNARD PENETRATION TESTING SUITE

*snarls with predatory glee* Welcome to the ultimate security testing framework! This suite integrates the blackhat exploit framework with E2E authentication tests to provide comprehensive penetration testing of the Reynard ecosystem.

## ⚠️ WARNING: DESTRUCTIVE TESTING

*bares fangs with savage satisfaction* These tests are designed to ACTUALLY BREAK your system. They will:

- **Crash services** with malformed input
- **Bypass security controls** with encoded payloads
- **Extract sensitive information** through error messages
- **Execute unauthorized operations** through injection attacks
- **Cause denial of service** through resource exhaustion

## 🎯 PENETRATION TEST CATEGORIES

### 1. **JWT Security Testing**

- Secret key vulnerability exploitation
- Token replay attacks
- Signature bypass attempts
- Timing attack implementations

### 2. **SQL Injection Testing**

- Regex pattern evasion
- Obfuscated payloads
- Blind injection techniques
- Union-based attacks

### 3. **Path Traversal Testing**

- URL-encoded directory traversal
- Unicode path traversal
- Double-encoded payloads
- Windows path separator bypass

### 4. **Authentication Security**

- Rate limiting bypass
- CORS misconfiguration testing
- CSRF attack vectors
- Session management testing

### 5. **Comprehensive Fuzzing**

- Advanced payload generation with 1000+ attack vectors
- Endpoint-specific fuzzing for authentication, file uploads, and search
- SQL injection, XSS, path traversal, and command injection payloads
- Asynchronous testing with concurrent request handling

### 6. **API Security Testing**

- Broken Object Level Authorization (BOLA) testing
- Object ID enumeration and manipulation
- Authorization bypass techniques
- Cross-tenant data access exploitation

### 7. **Advanced Attack Vectors**

- HTTP Request Smuggling
- Server-Side Request Forgery (SSRF)
- Race Condition Exploits
- Unicode Normalization Bypass

## 🚀 USAGE

### Prerequisites

- Node.js 18+
- Python 3.13
- Docker (optional, for containerized testing)
- Backend server running (for full testing)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Install Python dependencies for blackhat suite
cd ../blackhat
pip install -r requirements.txt
cd ../e2e
```

### Running Tests

#### 1. **Simple E2E Tests** (Safe)

```bash
# Run basic UI and authentication tests
npm run test:simple

# Run with UI
npm run test:simple -- --ui
```

#### 2. **Penetration Tests** (Destructive)

```bash
# Run penetration tests (non-destructive)
npm run test:penetration

# Run with verbose output
VERBOSE_TESTING=true npm run test:penetration

# Run destructive tests (WARNING: Will actually break things!)
DESTRUCTIVE_TESTING=true npm run test:penetration
```

#### 3. **Blackhat Suite Only**

```bash
# Run blackhat exploits directly
npm run blackhat:test

# Run with verbose output
npm run blackhat:test:verbose

# Run destructive tests
npm run blackhat:test:destructive
```

#### 4. **Complete Security Assessment**

```bash
# Run complete security assessment
npm run security:assess

# Run with destructive testing
npm run security:assess:destructive
```

### Environment Variables

```bash
# Target URLs
export PLAYWRIGHT_BASE_URL="http://localhost:3000"
export BACKEND_URL="http://localhost:8000"

# Testing modes
export DESTRUCTIVE_TESTING="true"  # Enable destructive testing
export VERBOSE_TESTING="true"      # Enable verbose output

# Python configuration
export PYTHON_PATH="python3"       # Python executable path
```

## 📊 TEST RESULTS

### Results Location

- **HTML Report**: `penetration-results/index.html`
- **JSON Results**: `penetration-results.json`
- **JUnit XML**: `penetration-results.xml`
- **Security Report**: `penetration-results/security-report.md`

### Viewing Results

```bash
# View HTML report
npm run test:penetration-report

# View simple test report
npm run test:report
```

## 🛡️ SECURITY RECOMMENDATIONS

### Immediate Actions

- Review and fix all identified vulnerabilities
- Implement additional security controls
- Conduct regular security assessments

### Long-term Improvements

- Implement automated security scanning
- Add security testing to CI/CD pipeline
- Regular penetration testing schedule
- Security awareness training for developers

## 🔧 CONFIGURATION

### Playwright Configuration

- **Simple Tests**: `playwright.config.simple.ts`
- **Penetration Tests**: `playwright.config.penetration.ts`

### Test Files

- **Simple E2E**: `simple-auth.spec.ts`
- **Penetration Tests**: `penetration-tests.spec.ts`
- **Helpers**: `utils/penetration-helpers.ts`

### Blackhat Integration

- **Exploit Suite**: `../blackhat/run_all_exploits.py`
- **Individual Exploits**: `../blackhat/[category]/[exploit].py`

## 🐺 REYNARD INTEGRATION

This penetration testing suite follows Reynard's testing philosophy:

### 🦊 The Cunning Fox: Strategic Security Testing

- Strategic test organization with escape hatches
- Elegant exploit coordination
- Adaptive security assessment

### 🦦 The Playful Otter: Comprehensive Coverage

- Thorough vulnerability exploration
- Joyful security testing approach
- Comprehensive edge case testing

### 🐺 The Alpha Wolf: Adversarial Analysis

- Relentless vulnerability hunting
- Pack coordination of attack vectors
- Constructive destruction for security improvement

## 📋 TEST COVERAGE

| Category | Tests | Status |
|----------|-------|--------|
| JWT Security | 4 tests | ✅ Ready |
| SQL Injection | 4 tests | ✅ Ready |
| Path Traversal | 4 tests | ✅ Ready |
| Authentication | 3 tests | ✅ Ready |
| Fuzzing | 2 tests | ✅ Ready |
| API Security | 1 test | ✅ Ready |
| CSRF Testing | 1 test | ✅ Ready |
| SSRF Testing | 1 test | ✅ Ready |
| Race Conditions | 1 test | ✅ Ready |
| HTTP Smuggling | 1 test | ✅ Ready |
| Unicode Security | 1 test | ✅ Ready |
| Complete Assessment | 1 test | ✅ Ready |

## 🚨 SAFETY WARNINGS

### Destructive Testing

- **WARNING**: Destructive tests will actually break your system
- Only run on safe, isolated environments
- Backup your data before running destructive tests
- Use test databases and staging environments

### Production Safety

- **NEVER** run penetration tests against production systems
- Use dedicated testing environments
- Implement proper network isolation
- Monitor system resources during testing

## 📞 SUPPORT

For issues with the penetration testing suite:

1. Check the logs in `penetration-results/`
2. Review the security report
3. Verify blackhat suite dependencies
4. Ensure target environment is properly configured

---

*🐺 The Wolf - Security Testing Framework*  
*"We don't just test security - we hunt it down with the relentless determination of the apex predator of the code jungle!"*
