# 🦦 Testing Ecosystem Database Integration

*splashes with database integration enthusiasm* Comprehensive guide for using the unified testing ecosystem that stores all test results, benchmarks, and tracing data in the `reynard_e2e` PostgreSQL database.

## Overview

The Reynard testing ecosystem has been completely integrated with PostgreSQL to provide centralized storage and analysis of all testing data. This eliminates scattered files and provides a unified view of your entire testing landscape.

## 🎯 What's Integrated

### ✅ Vitest Results
- **Frontend test results** from the Vitest testing framework
- **Individual test outcomes** (passed, failed, skipped, error)
- **Test execution times** and performance metrics
- **Coverage data** and test artifacts
- **Custom metadata** and test environment information

### ✅ Pytest Results  
- **Backend test results** from the Python testing framework
- **Test execution details** with stdout/stderr capture
- **Error messages and tracebacks** for failed tests
- **Test categorization** and metadata
- **Performance metrics** and execution statistics

### ✅ Playwright E2E Results
- **End-to-end test results** from Playwright automation
- **Screenshots and videos** of test failures
- **Browser traces** and network requests
- **Test artifacts** and reports
- **Cross-browser compatibility** data

### ✅ Tracing Data
- **Performance traces** and execution profiling
- **Network request monitoring** and timing
- **Browser interaction tracking** (clicks, form submissions)
- **Custom trace data** and debugging information
- **Real-time performance metrics**

### ✅ Benchmark Results
- **Load testing results** from Locust and other tools
- **Performance benchmarks** and metrics
- **Resource utilization** (CPU, memory, network)
- **Response time analysis** (avg, p95, p99)
- **Throughput measurements** and error rates

## 🚀 Getting Started

### Prerequisites

1. **PostgreSQL Database**: Ensure the `reynard_e2e` database is running
2. **Backend API**: Start the FastAPI backend server on `localhost:8000`
3. **Environment Variables**: Set up the required environment variables

### Environment Setup

```bash
# Database connection
export E2E_DATABASE_URL="postgresql://postgres:password@localhost:5432/reynard_e2e"

# API configuration
export TESTING_API_URL="http://localhost:8000"

# Git information (optional)
export GIT_BRANCH="main"
export GIT_COMMIT="abc123def456"

# Node environment
export NODE_ENV="development"
```

## 🧪 Using Vitest with Database Integration

### Configuration

The Vitest configuration has been updated to include the database reporter:

```typescript
// vitest.global.config.ts
export default defineConfig({
  test: {
    reporters: [
      ["default", { summary: false }],
      ["json", { outputFile: ".vitest-reports/global-report.json" }],
      [
        "./packages/core/testing/src/vitest-db-reporter.ts",
        {
          apiBaseUrl: process.env.TESTING_API_URL || "http://localhost:8000",
          environment: process.env.NODE_ENV || "development",
          branch: process.env.GIT_BRANCH || "unknown",
          commit: process.env.GIT_COMMIT || "unknown",
          testSuite: "vitest-global",
          storeIndividualTests: true,
          storeCoverage: true,
          storePerformance: true,
        },
      ],
    ],
  },
});
```

### Running Tests

```bash
# Run all Vitest tests with database integration
pnpm test

# Run specific test suite
pnpm test --project components

# Run with custom environment
NODE_ENV=production pnpm test
```

### What Gets Stored

- **Test Run**: Overall test execution metadata
- **Individual Tests**: Each test case with status, duration, and output
- **Coverage Data**: Code coverage percentages and file-level details
- **Performance Metrics**: Test execution times and resource usage
- **Artifacts**: Screenshots, videos, and other test artifacts

## 🐍 Using Pytest with Database Integration

### Configuration

The Pytest configuration includes the database reporter plugin:

```ini
# pytest.ini
[tool:pytest]
addopts = 
    --strict-markers
    --strict-config
    --verbose
    --tb=short
    --db-reporter
    --db-api-url=http://localhost:8000
```

### Running Tests

```bash
# Run all Pytest tests with database integration
cd backend
python -m pytest

# Run specific test file
python -m pytest tests/test_specific.py

# Run with custom markers
python -m pytest -m "not slow"

# Run with database reporter disabled
python -m pytest --no-db-reporter
```

### What Gets Stored

- **Test Run**: Python test execution metadata
- **Individual Tests**: Each test function with status and output
- **Error Details**: Full tracebacks and error messages
- **Performance Data**: Test execution times and resource usage
- **Test Metadata**: Pytest configuration and environment details

## 🎭 Using Playwright with Database Integration

### Configuration

Playwright configurations have been updated to use the database results manager:

```typescript
// e2e/configs/playwright.config.dom.ts
import { createResultsManagerDB, TEST_TYPES } from "../core/utils/results-manager-db";

// Initialize database results manager
const resultsManager = createResultsManagerDB(TEST_TYPES.DOM, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
  apiBaseUrl: process.env.TESTING_API_URL || "http://localhost:8000",
});

// Initialize the test run
await resultsManager.startTestRun();
```

### Running Tests

```bash
# Run all E2E tests with database integration
cd e2e
npx playwright test

# Run specific test suite
npx playwright test --config=configs/playwright.config.dom.ts

# Run with custom environment
TESTING_API_URL=http://localhost:8000 npx playwright test
```

### What Gets Stored

- **Test Run**: E2E test execution metadata
- **Individual Tests**: Each test case with browser and timing info
- **Artifacts**: Screenshots, videos, and traces
- **Network Data**: Request/response details and timing
- **Browser Metrics**: Performance and interaction data

## 📊 Using Tracing Integration

### Basic Usage

```typescript
import { initializeTracing, getTracingIntegration } from './packages/core/testing/src/tracing-db-integration';

// Initialize tracing with test run ID
const tracing = initializeTracing('test-run-123', {
  apiBaseUrl: 'http://localhost:8000',
  autoCollect: true,
  samplingRate: 1.0,
});

// Start a custom trace
const traceId = tracing.startTrace('custom_operation', 'performance');

// ... perform operation ...

// End the trace
tracing.endTrace(traceId, { result: 'success', data: 'some data' });

// Store all traces
await tracing.storeAllTraces();
```

### Automatic Collection

The tracing system automatically collects:

- **Performance Entries**: Browser performance API data
- **Network Requests**: Fetch/XHR request timing and details
- **Browser Interactions**: Clicks, form submissions, and user actions
- **Custom Metrics**: Application-specific performance data

### What Gets Stored

- **Trace Data**: Detailed execution traces and timing
- **Performance Metrics**: Memory usage, CPU utilization, response times
- **Network Data**: Request/response details and timing
- **Browser Events**: User interactions and page events
- **Custom Data**: Application-specific tracing information

## 🔧 API Endpoints

The testing ecosystem provides comprehensive API endpoints for accessing stored data:

### Test Runs

```bash
# Get all test runs
GET /api/testing/test-runs

# Get specific test run
GET /api/testing/test-runs/{test_run_id}

# Create new test run
POST /api/testing/test-runs

# Update test run status
PATCH /api/testing/test-runs/{test_run_id}/status
```

### Test Results

```bash
# Get test results for a run
GET /api/testing/test-runs/{test_run_id}/test-results

# Add test result
POST /api/testing/test-results
```

### Performance Metrics

```bash
# Get performance metrics
GET /api/testing/test-runs/{test_run_id}/performance-metrics

# Add performance metric
POST /api/testing/performance-metrics
```

### Trace Data

```bash
# Get trace data
GET /api/testing/test-runs/{test_run_id}/trace-data

# Add trace data
POST /api/testing/trace-data
```

### Coverage Data

```bash
# Get coverage data
GET /api/testing/test-runs/{test_run_id}/coverage-data

# Add coverage data
POST /api/testing/coverage-data
```

### Benchmark Results

```bash
# Get benchmark results
GET /api/testing/test-runs/{test_run_id}/benchmark-results

# Add benchmark result
POST /api/testing/benchmark-results
```

## 📈 Data Analysis and Reporting

### Test Run Summary

```python
# Get comprehensive test run summary
from app.services.testing.testing_ecosystem_service import TestingEcosystemService

with get_e2e_session() as session:
    service = TestingEcosystemService(session)
    summary = await service.get_test_run_summary(test_run_id)
    
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Passed: {summary['passed_tests']}")
    print(f"Failed: {summary['failed_tests']}")
    print(f"Success Rate: {summary['success_rate']:.1f}%")
    print(f"Duration: {summary['duration_seconds']:.2f}s")
```

### Performance Analysis

```python
# Analyze performance metrics
metrics = await service.get_performance_metrics(
    test_run_id=test_run_id,
    metric_type="memory",
    start_time=start_date,
    end_time=end_date
)

for metric in metrics:
    print(f"{metric.metric_name}: {metric.value} {metric.unit}")
```

### Coverage Analysis

```python
# Analyze coverage data
coverage_data = await service.get_coverage_data(test_run_id)

for coverage in coverage_data:
    print(f"Coverage: {coverage.coverage_percentage:.1f}%")
    print(f"Files: {len(coverage.coverage_data.get('files', {}))}")
```

## 🗄️ Database Schema

The `reynard_e2e` database includes the following main tables:

### Core Tables

- **`test_runs`**: Main test execution records
- **`test_results`**: Individual test case results
- **`benchmark_results`**: Performance benchmark data
- **`performance_metrics`**: Detailed performance measurements
- **`trace_data`**: Execution traces and debugging info
- **`coverage_data`**: Code coverage information
- **`test_artifacts`**: Screenshots, videos, and files
- **`test_reports`**: Generated test reports

### Relationships

- Test runs have many test results, benchmarks, metrics, traces, and coverage data
- Test results can have multiple artifacts and reports
- All data is linked through foreign key relationships for easy querying

## 🔍 Querying Data

### SQL Queries

```sql
-- Get test run statistics
SELECT 
    test_type,
    COUNT(*) as total_runs,
    AVG(success_rate) as avg_success_rate,
    AVG(duration_seconds) as avg_duration
FROM test_runs 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY test_type;

-- Get failed tests
SELECT 
    tr.run_id,
    tr.test_name,
    tr.error_message,
    tr.duration_ms
FROM test_results tr
JOIN test_runs trun ON tr.test_run_id = trun.id
WHERE tr.status = 'failed'
ORDER BY trun.created_at DESC;

-- Get performance trends
SELECT 
    DATE(created_at) as date,
    AVG(value) as avg_memory_usage
FROM performance_metrics 
WHERE metric_type = 'memory' 
    AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

### Python Queries

```python
# Get recent test runs
recent_runs = await service.list_test_runs(
    test_type="vitest",
    status="completed",
    limit=10
)

# Get performance metrics for analysis
metrics = await service.get_performance_metrics(
    test_run_id=test_run_id,
    metric_type="performance",
    limit=1000
)

# Get trace data for debugging
traces = await service.get_trace_data(
    test_run_id=test_run_id,
    trace_type="performance"
)
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database is running
   psql postgresql://postgres:password@localhost:5432/reynard_e2e -c "SELECT 1;"
   
   # Check environment variables
   echo $E2E_DATABASE_URL
   ```

2. **API Server Not Running**
   ```bash
   # Start the backend server
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

3. **Permission Issues**
   ```sql
   -- Grant necessary permissions
   GRANT ALL PRIVILEGES ON DATABASE reynard_e2e TO postgres;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
   ```

4. **Test Results Not Stored**
   - Check API connectivity: `curl http://localhost:8000/health`
   - Verify environment variables are set
   - Check test logs for error messages

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Set debug environment variables
export DEBUG=true
export LOG_LEVEL=DEBUG

# Run tests with verbose output
python -m pytest -v --tb=long
```

## 📚 Best Practices

### 1. Environment Management
- Use consistent environment variables across all testing frameworks
- Set up proper Git branch and commit tracking
- Use meaningful test suite names

### 2. Data Organization
- Use descriptive test run IDs
- Include relevant metadata in test results
- Organize tests by feature or component

### 3. Performance Monitoring
- Enable automatic performance collection
- Set appropriate sampling rates for tracing
- Monitor database storage usage

### 4. Error Handling
- Implement proper error handling in custom reporters
- Use fallback mechanisms for API failures
- Log errors for debugging

### 5. Data Cleanup
- Implement regular cleanup of old test data
- Use the built-in cleanup functionality
- Monitor database growth

## 🎉 Benefits

### Centralized Data
- All testing data in one place
- Easy cross-framework analysis
- Unified reporting and dashboards

### Historical Analysis
- Track test performance over time
- Identify trends and regressions
- Compare results across environments

### Better Debugging
- Detailed trace data for failed tests
- Performance metrics for optimization
- Artifact storage for visual debugging

### Team Collaboration
- Shared test results and insights
- Consistent reporting across teams
- Easy integration with CI/CD pipelines

---

🦦 *splashes with satisfaction* The testing ecosystem is now fully integrated with PostgreSQL! All your test results, benchmarks, and tracing data are stored centrally for easy analysis and reporting. Happy testing!

