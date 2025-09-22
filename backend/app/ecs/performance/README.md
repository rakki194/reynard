# FastAPI ECS Performance Monitoring & Benchmarking

🐍 _tilts head with analytical precision_ A comprehensive performance monitoring and benchmarking system for FastAPI ECS backends, designed to identify bottlenecks and optimize system performance.

## Features

### 🔍 Real-time Performance Monitoring

- **Request/Response Tracking**: Monitor response times, status codes, and throughput
- **Memory Usage Monitoring**: Track memory consumption and detect potential leaks
- **Database Query Profiling**: Identify slow queries and optimization opportunities
- **Async Task Performance**: Monitor background task execution and failures
- **Bottleneck Detection**: Automatic identification of performance issues

### 📊 Advanced Analytics

- **Performance Trends**: Analyze performance changes over time
- **Endpoint Analysis**: Detailed metrics for each API endpoint
- **Error Rate Monitoring**: Track and analyze error patterns
- **Resource Usage Optimization**: Recommendations for system optimization

### 🚀 Load Testing & Benchmarking

- **Async Load Testing**: High-performance concurrent request testing
- **Endpoint Profiling**: Detailed performance analysis of individual endpoints
- **Real-time Monitoring**: Live performance metrics during testing
- **Comprehensive Reporting**: JSON and CSV output formats

## Quick Start

### 1. Basic Integration

```python
from fastapi import FastAPI
from app.ecs.performance import PerformanceMiddleware, performance_router

app = FastAPI()

# Add performance monitoring middleware
app.add_middleware(PerformanceMiddleware, enable_memory_tracking=True)

# Include performance endpoints
app.include_router(performance_router)
```

### 2. Start Monitoring

```python
from app.ecs.performance import memory_profiler

# Start memory profiling
memory_profiler.start()
```

### 3. Track Custom Operations

```python
from app.ecs.performance import track_async_task, track_db_query

# Track async tasks
async with track_async_task("my_background_task"):
    await some_async_operation()

# Track database queries
@track_db_query("SELECT * FROM users WHERE active = ?")
async def get_active_users():
    return await database.fetch_all(query)
```

## API Endpoints

### Performance Metrics

- `GET /performance/metrics` - Current performance summary
- `GET /performance/memory` - Memory usage metrics
- `GET /performance/endpoints` - All endpoint performance data
- `GET /performance/endpoints/{endpoint}` - Specific endpoint details

### Analysis & Reports

- `GET /performance/bottlenecks` - Current performance bottlenecks
- `GET /performance/trends?hours=24` - Performance trends analysis
- `GET /performance/report` - Comprehensive optimization report
- `GET /performance/health` - Overall system health status

### Monitoring Control

- `POST /performance/start-monitoring` - Start performance monitoring
- `POST /performance/stop-monitoring` - Stop performance monitoring
- `GET /performance/status` - Current monitoring status
- `DELETE /performance/clear-data` - Clear all performance data

## CLI Benchmarking Tools

### Load Testing

```bash
# Basic load test
python -m app.ecs.performance.benchmark_cli \
    --mode load-test \
    --base-url http://localhost:8000 \
    --endpoints /api/health /api/users \
    --concurrent-users 50 \
    --duration 60 \
    --output results.json

# Advanced load test with ramp-up
python -m app.ecs.performance.benchmark_cli \
    --mode load-test \
    --base-url http://localhost:8000 \
    --endpoints /api/health \
    --concurrent-users 100 \
    --duration 120 \
    --ramp-up 30 \
    --timeout 10 \
    --output load_test_results.csv
```

### Endpoint Profiling

```bash
# Profile a single endpoint
python -m app.ecs.performance.benchmark_cli \
    --mode profile \
    --base-url http://localhost:8000 \
    --endpoints /api/users \
    --iterations 200 \
    --method GET \
    --output profile_results.json

# Profile POST endpoint with payload
python -m app.ecs.performance.benchmark_cli \
    --mode profile \
    --base-url http://localhost:8000 \
    --endpoints /api/users \
    --iterations 100 \
    --method POST \
    --payload '{"name": "test", "email": "test@example.com"}' \
    --output post_profile.json
```

## Performance Analysis

### Bottleneck Detection

The system automatically identifies several types of bottlenecks:

#### 🐌 Slow Endpoints

- **Detection**: Average response time > 1 second
- **Severity**: Critical if > 5 seconds
- **Recommendations**: Code profiling, caching, query optimization

#### ❌ High Error Rates

- **Detection**: Error rate > 10%
- **Severity**: Critical if > 25%
- **Recommendations**: Error handling, input validation, retry mechanisms

#### 🧠 Memory Issues

- **Detection**: High memory usage or increasing trend
- **Severity**: Critical if > 1GB, High if potential leak
- **Recommendations**: Memory profiling, leak detection, optimization

#### 🗄️ Database Bottlenecks

- **Detection**: Slow queries > 100ms or high frequency
- **Severity**: Critical if > 1 second average
- **Recommendations**: Indexing, query optimization, caching

#### ⚡ Async Task Issues

- **Detection**: Slow tasks > 500ms or high failure rate
- **Severity**: Critical if > 2 seconds or > 20% failure rate
- **Recommendations**: Task optimization, error handling, timeouts

### Performance Trends

The system analyzes performance trends over time:

- **Response Time Trends**: Improving, degrading, or stable
- **Error Rate Trends**: Changes in error patterns
- **Memory Usage Trends**: Memory consumption patterns
- **Throughput Trends**: Request handling capacity

## Configuration

### Middleware Configuration

```python
app.add_middleware(
    PerformanceMiddleware,
    enable_memory_tracking=True,  # Enable memory profiling
)
```

### Memory Profiler Configuration

```python
from app.ecs.performance import MemoryProfiler

# Custom memory profiler with different check interval
memory_profiler = MemoryProfiler(check_interval=2.0)  # Check every 2 seconds
memory_profiler.start()
```

### Performance Tracker Configuration

```python
from app.ecs.performance import PerformanceTracker

# Custom tracker with different history size
performance_tracker = PerformanceTracker(max_history=2000)  # Keep 2000 requests
```

## Example Integration

See `example_integration.py` for a complete example of how to integrate the performance monitoring system into your FastAPI application.

## Output Examples

### Performance Metrics Response

```json
{
  "summary": {
    "total_requests": 1250,
    "avg_duration_ms": 245.67,
    "max_duration_ms": 1250.34,
    "min_duration_ms": 12.45,
    "error_rate_percent": 2.4,
    "avg_memory_mb": 156.78,
    "total_db_queries": 3420,
    "total_db_time_ms": 1234.56,
    "total_async_tasks": 89,
    "total_async_time_ms": 567.89
  },
  "slowest_endpoints": [
    ["GET /api/users", { "avg_duration": 1.2, "requests": 45 }],
    ["POST /api/upload", { "avg_duration": 0.8, "requests": 23 }]
  ],
  "timestamp": "2025-09-22T12:56:42.584696+02:00"
}
```

### Bottleneck Analysis Response

```json
{
  "bottlenecks": [
    {
      "type": "slow_endpoint",
      "severity": "high",
      "description": "Endpoint GET /api/users has slow average response time",
      "impact": "Average response time: 1.2s",
      "recommendations": [
        "Profile the endpoint code for performance issues",
        "Check for inefficient database queries",
        "Consider caching frequently accessed data"
      ],
      "affected_endpoints": ["GET /api/users"],
      "metrics": {
        "avg_duration": 1.2,
        "max_duration": 3.4,
        "request_count": 45
      }
    }
  ],
  "total_count": 1,
  "critical_count": 0,
  "high_count": 1,
  "medium_count": 0,
  "low_count": 0
}
```

### Load Test Results

```json
{
  "endpoint": "/api/health",
  "method": "GET",
  "total_requests": 5000,
  "successful_requests": 4987,
  "failed_requests": 13,
  "avg_response_time": 0.045,
  "p95_response_time": 0.089,
  "p99_response_time": 0.156,
  "requests_per_second": 83.33,
  "error_rate": 0.26,
  "status_codes": {
    "200": 4987,
    "500": 13
  }
}
```

## Best Practices

### 1. Monitoring Setup

- Start monitoring early in development
- Use different configurations for dev/staging/production
- Set up alerts for critical bottlenecks

### 2. Performance Testing

- Run load tests regularly
- Test with realistic data volumes
- Monitor trends over time

### 3. Optimization

- Address critical bottlenecks first
- Focus on high-impact, low-effort improvements
- Monitor the effects of optimizations

### 4. Data Management

- Clear performance data periodically
- Export important metrics for analysis
- Keep historical data for trend analysis

## Troubleshooting

### Common Issues

#### Memory Profiler Not Starting

```python
# Check if tracemalloc is available
import tracemalloc
tracemalloc.start()  # Should work without errors
```

#### High Memory Usage

- Reduce `max_history` in PerformanceTracker
- Increase `check_interval` in MemoryProfiler
- Clear performance data regularly

#### Slow Performance Monitoring

- Disable memory tracking if not needed
- Reduce concurrent request tracking
- Use sampling instead of full tracking

### Debug Mode

Enable debug logging to troubleshoot issues:

```python
import logging
logging.getLogger('app.ecs.performance').setLevel(logging.DEBUG)
```

## Contributing

When adding new performance monitoring features:

1. Follow the existing code structure
2. Add comprehensive tests
3. Update documentation
4. Consider performance impact of monitoring itself
5. Add appropriate error handling

## License

This performance monitoring system is part of the Reynard ECS backend and follows the same licensing terms.
