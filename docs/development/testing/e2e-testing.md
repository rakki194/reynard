# E2E Testing with Docker Playwright

This document describes how to set up and run end-to-end (E2E) tests for Reynard using Docker and Playwright.

## Overview

The E2E testing setup uses Docker Compose to orchestrate three main services:

1. **Backend Service** (`reynard-backend`) - Runs the Python Flask backend
2. **Frontend Service** (`reynard-frontend`) - Runs the SolidJS development server
3. **Playwright Tests** (`playwright-tests`) - Runs the E2E tests against the running services

## Available Versions

### GPU Version (Default)

- Uses NVIDIA CUDA base image
- Optimized for GPU-accelerated machine learning models
- Requires CUDA-compatible hardware and drivers
- Files: `docker-compose.e2e.yml`, `Dockerfile`, `scripts/e2e.sh`

### CPU-Only Version

- Uses standard Ubuntu base image
- Runs all models on CPU only
- Works on any machine without GPU requirements
- Files: `docker-compose.e2e.cpu.yml`, `Dockerfile.cpu`, `scripts/e2e-cpu.sh`

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM
- Sufficient disk space for Docker images (~2GB)
- For GPU version: NVIDIA GPU with CUDA drivers
- For CPU version: Any machine (no GPU required)

## Quick Start

### GPU Version (Default)

#### 1. Build the E2E Images

```bash
./scripts/e2e.sh build
# or
npm run e2e:docker:build
```

#### 2. Run All E2E Tests

```bash
./scripts/e2e.sh test
# or
npm run e2e:docker
```

### CPU-Only Version

#### 1. Build the E2E Images

```bash
./scripts/e2e-cpu.sh build
# or
npm run e2e:docker:cpu:build
```

#### 2. Run All E2E Tests

```bash
./scripts/e2e-cpu.sh test
# or
npm run e2e:docker:cpu
```

### 3. View Test Reports

```bash
# GPU version
./scripts/e2e.sh report
# or
npm run e2e:docker:report

# CPU version
./scripts/e2e-cpu.sh report
# or
npm run e2e:docker:cpu:report
```

### 4. Clean Up

```bash
# GPU version
./scripts/e2e.sh cleanup
# or
npm run e2e:docker:cleanup

# CPU version
./scripts/e2e-cpu.sh cleanup
# or
npm run e2e:docker:cpu:cleanup
```

## Available Commands

### GPU Version Commands

The `scripts/e2e.sh` script provides several convenient commands:

| Command                  | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `build`                  | Build all E2E Docker images                                  |
| `test`                   | Run all E2E tests                                            |
| `test-headed`            | Run E2E tests with headed browsers (for debugging)           |
| `test-filter <pattern>`  | Run tests matching a specific pattern                        |
| `test-browser <browser>` | Run tests for a specific browser (chromium, firefox, webkit) |
| `report`                 | Show test reports in browser                                 |
| `cleanup`                | Clean up E2E environment and Docker resources                |

### CPU-Only Version Commands

The `scripts/e2e-cpu.sh` script provides the same commands but for CPU-only testing:

| Command                  | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `build`                  | Build all E2E Docker images (CPU-only)                       |
| `test`                   | Run all E2E tests (CPU-only)                                 |
| `test-headed`            | Run E2E tests with headed browsers (for debugging)           |
| `test-filter <pattern>`  | Run tests matching a specific pattern                        |
| `test-browser <browser>` | Run tests for a specific browser (chromium, firefox, webkit) |
| `report`                 | Show test reports in browser                                 |
| `cleanup`                | Clean up E2E environment and Docker resources                |

## Examples

### Run Tests for Authentication Only

```bash
# GPU version
./scripts/e2e.sh test-filter "auth"

# CPU version
./scripts/e2e-cpu.sh test-filter "auth"
```

### Run Tests in Chrome Only

```bash
# GPU version
./scripts/e2e.sh test-browser chromium

# CPU version
./scripts/e2e-cpu.sh test-browser chromium
```

### Debug Tests with Headed Browsers

```bash
# GPU version
./scripts/e2e.sh test-headed

# CPU version
./scripts/e2e-cpu.sh test-headed
```

## Manual Docker Compose Usage

### GPU Version

#### Start the Test Environment

```bash
# Start backend and frontend services
docker-compose -f docker-compose.e2e.yml --profile e2e up -d reynard-backend reynard-frontend

# Wait for services to be ready (check logs if needed)
docker-compose -f docker-compose.e2e.yml logs -f reynard-backend reynard-frontend
```

#### Run Tests

```bash
# Run all tests
docker-compose -f docker-compose.e2e.yml --profile e2e run --rm playwright-tests

# Run specific test file
docker-compose -f docker-compose.e2e.yml --profile e2e run --rm playwright-tests npx playwright test auth.spec.ts

# Run tests with specific browser
docker-compose -f docker-compose.e2e.yml --profile e2e run --rm playwright-tests npx playwright test --project=chromium
```

### CPU-Only Version

#### Start the Test Environment

```bash
# Start backend and frontend services
docker-compose -f docker-compose.e2e.cpu.yml --profile e2e-cpu up -d reynard-backend reynard-frontend

# Wait for services to be ready (check logs if needed)
docker-compose -f docker-compose.e2e.cpu.yml logs -f reynard-backend reynard-frontend
```

#### Run Tests

```bash
# Run all tests
docker-compose -f docker-compose.e2e.cpu.yml --profile e2e-cpu run --rm playwright-tests

# Run specific test file
docker-compose -f docker-compose.e2e.cpu.yml --profile e2e-cpu run --rm playwright-tests npx playwright test auth.spec.ts

# Run tests with specific browser
docker-compose -f docker-compose.e2e.cpu.yml --profile e2e-cpu run --rm playwright-tests npx playwright test --project=chromium
```

### View Reports

```bash
# GPU version
docker-compose -f docker-compose.e2e.yml --profile e2e-ui up playwright-ui

# CPU version
docker-compose -f docker-compose.e2e.cpu.yml --profile e2e-cpu-ui up playwright-ui

# Access reports at http://localhost:9323
```

### Clean Up

```bash
# GPU version
docker-compose -f docker-compose.e2e.yml down
docker-compose -f docker-compose.e2e.yml down -v
docker system prune -f

# CPU version
docker-compose -f docker-compose.e2e.cpu.yml down
docker-compose -f docker-compose.e2e.cpu.yml down -v
docker system prune -f
```

## Configuration

### Environment Variables

The following environment variables can be set to customize the E2E testing environment:

| Variable                  | Default                       | Description                           |
| ------------------------- | ----------------------------- | ------------------------------------- |
| `PLAYWRIGHT_BASE_URL`     | `http://reynard-frontend:5173` | Base URL for the frontend application |
| `PLAYWRIGHT_API_BASE_URL` | `http://reynard-backend:7000`  | Base URL for the backend API          |
| `CI`                      | `true`                        | Set to true in CI environment         |
| `UID`                     | `1000`                        | User ID for Docker containers         |
| `GID`                     | `1000`                        | Group ID for Docker containers        |
| `CUDA_VISIBLE_DEVICES`    | `""`                          | Disables CUDA in CPU-only version     |

### Playwright Configuration

The Playwright configuration is in `playwright.config.ts` and includes:

- **Browsers**: Chromium, Firefox, and WebKit
- **Reporters**: HTML and line reporters
- **Screenshots**: Taken on test failure
- **Videos**: Recorded on test failure
- **Traces**: Collected on first retry

### Test Structure

E2E tests are located in the `e2e/` directory and follow this structure:

```
e2e/
├── auth.spec.ts          # Authentication tests
├── gallery.spec.ts       # Gallery functionality tests
├── upload.spec.ts        # File upload tests
├── setup.spec.ts         # Setup verification tests
└── utils/                # Test utilities and helpers
```

## Writing E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should perform expected action", async ({ page }) => {
    // Navigate to the page
    await page.goto("/");

    // Perform actions
    await page.click("button");

    // Assert results
    await expect(page.locator(".result")).toContainText("Expected text");
  });
});
```

### Best Practices

1. **Use descriptive test names** that explain what the test is verifying
2. **Keep tests independent** - each test should be able to run in isolation
3. **Use page objects** for complex interactions
4. **Add proper waits** for dynamic content
5. **Use data attributes** for selectors when possible
6. **Clean up test data** in `afterEach` or `afterAll` hooks

### Test Utilities

The E2E setup includes several utilities:

- **Authentication helpers** for login/logout
- **File upload helpers** for testing file operations
- **Database reset helpers** for clean test state
- **API helpers** for direct backend testing

## Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check service logs
docker-compose -f docker-compose.e2e.yml logs reynard-backend
docker-compose -f docker-compose.e2e.yml logs reynard-frontend

# CPU version
docker-compose -f docker-compose.e2e.cpu.yml logs reynard-backend
docker-compose -f docker-compose.e2e.cpu.yml logs reynard-frontend

# Check if ports are available
netstat -tulpn | grep :7000
netstat -tulpn | grep :5173
```

#### Tests Failing

```bash
# Run tests with debug output
docker-compose -f docker-compose.e2e.yml --profile e2e run --rm playwright-tests npx playwright test --debug

# CPU version
docker-compose -f docker-compose.e2e.cpu.yml --profile e2e-cpu run --rm playwright-tests npx playwright test --debug

# Run tests with headed browsers
./scripts/e2e.sh test-headed
# or
./scripts/e2e-cpu.sh test-headed
```

#### Performance Issues

```bash
# Increase Docker resources in Docker Desktop
# Recommended: 4GB RAM, 2 CPUs

# Clean up Docker resources
./scripts/e2e.sh cleanup
# or
./scripts/e2e-cpu.sh cleanup
```

#### CUDA/GPU Issues (GPU Version Only)

If you encounter CUDA-related errors with the GPU version:

1. **Check NVIDIA drivers**: Ensure you have compatible NVIDIA drivers installed
2. **Verify Docker GPU support**: Run `docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi`
3. **Use CPU version**: Switch to the CPU-only version if GPU support is problematic

### Debug Mode

To debug tests interactively:

1. Run tests in headed mode:

   ```bash
   ./scripts/e2e.sh test-headed
   # or
   ./scripts/e2e-cpu.sh test-headed
   ```

2. Use Playwright's debug mode:

   ```bash
   docker-compose -f docker-compose.e2e.yml --profile e2e run --rm playwright-tests npx playwright test --debug
   # or
   docker-compose -f docker-compose.e2e.cpu.yml --profile e2e-cpu run --rm playwright-tests npx playwright test --debug
   ```

3. Use Playwright Inspector:

   ```bash
   docker-compose -f docker-compose.e2e.yml --profile e2e run --rm -p 9323:9323 playwright-tests npx playwright test --ui
   # or
   docker-compose -f docker-compose.e2e.cpu.yml --profile e2e-cpu run --rm -p 9323:9323 playwright-tests npx playwright test --ui
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-gpu:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and run E2E tests (GPU)
        run: |
          ./scripts/e2e.sh build
          ./scripts/e2e.sh test

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-gpu
          path: playwright-report/

  e2e-cpu:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and run E2E tests (CPU)
        run: |
          ./scripts/e2e-cpu.sh build
          ./scripts/e2e-cpu.sh test

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-cpu
          path: playwright-report/
```

### GitLab CI Example

```yaml
e2e-gpu:
  stage: test
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker-compose -f docker-compose.e2e.yml build
  script:
    - ./scripts/e2e.sh test
  artifacts:
    when: always
    paths:
      - playwright-report/

e2e-cpu:
  stage: test
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker-compose -f docker-compose.e2e.cpu.yml build
  script:
    - ./scripts/e2e-cpu.sh test
  artifacts:
    when: always
    paths:
      - playwright-report/
```

## Performance Optimization

### Parallel Execution

Tests run in parallel by default. To control parallelism:

```bash
# Run with specific number of workers
docker-compose -f docker-compose.e2e.yml --profile e2e run --rm playwright-tests npx playwright test --workers=2
# or
docker-compose -f docker-compose.e2e.cpu.yml --profile e2e-cpu run --rm playwright-tests npx playwright test --workers=2
```

### Resource Management

- **Memory**: Each browser instance uses ~100-200MB RAM
- **CPU**: Tests are CPU-intensive, especially video recording
- **Disk**: Test artifacts (screenshots, videos, traces) can be large
- **GPU**: GPU version requires additional VRAM for machine learning models

### Caching

Docker layers are cached for faster builds:

- `package.json` changes invalidate npm install cache
- Source code changes don't invalidate dependency cache
- Browser installations are cached separately

## Monitoring and Reporting

### Test Reports

After running tests, reports are available in:

- `playwright-report/` - HTML report with detailed test results
- `test-results/` - Screenshots, videos, and traces

### Metrics

Track these metrics for test health:

- **Test duration** - Should be consistent
- **Failure rate** - Should be low (<5%)
- **Flaky tests** - Should be identified and fixed
- **Coverage** - Should increase over time

### Alerts

Set up alerts for:

- Test failures in CI
- Performance regressions
- Coverage decreases
- Flaky test detection

## Version Comparison

| Feature               | GPU Version                | CPU-Only Version            |
| --------------------- | -------------------------- | --------------------------- |
| Base Image            | NVIDIA CUDA                | Ubuntu 24.04                |
| Machine Learning      | GPU-accelerated            | CPU-only                    |
| Hardware Requirements | NVIDIA GPU + CUDA          | Any machine                 |
| Build Time            | Longer (larger base image) | Faster (smaller base image) |
| Model Performance     | Faster inference           | Slower inference            |
| Compatibility         | Limited to CUDA systems    | Universal                   |
| Docker Image Size     | Larger (~4-6GB)            | Smaller (~2-3GB)            |

Choose the version that best fits your testing environment and requirements.
