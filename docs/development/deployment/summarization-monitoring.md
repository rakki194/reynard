# Summarization System Monitoring and Alerting

This guide covers monitoring, alerting, and observability for the YipYap summarization system, including health checks, metrics collection, logging, and alerting configurations.

## Overview

The summarization system provides comprehensive monitoring capabilities to ensure reliable operation, performance optimization, and early detection of issues. The monitoring system includes health checks, metrics collection, structured logging, and configurable alerting.

## Health Monitoring

### Health Check Endpoints

The summarization system provides several health check endpoints:

#### 1. Overall System Health

```bash
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "summarization_manager": {
      "status": "healthy",
      "uptime": 3600,
      "version": "1.0.0"
    },
    "ollama_service": {
      "status": "healthy",
      "uptime": 3600,
      "version": "1.0.0"
    },
    "cache_manager": {
      "status": "healthy",
      "uptime": 3600,
      "version": "1.0.0"
    }
  },
  "dependencies": {
    "ollama": {
      "status": "healthy",
      "response_time": 0.15,
      "models_available": ["qwen3:8b", "llama3.2:8b"]
    },
    "cache": {
      "status": "healthy",
      "response_time": 0.02,
      "cache_hit_rate": 0.85
    }
  }
}
```

#### 2. Summarization Service Health

```bash
GET /api/summarize/health
```

**Response:**

```json
{
  "status": "healthy",
  "service": "summarization",
  "timestamp": "2024-01-15T10:30:00Z",
  "components": {
    "summarization_manager": {
      "status": "healthy",
      "available_summarizers": ["ollama", "article", "code", "document"],
      "total_requests": 1234,
      "active_requests": 2
    },
    "cache_manager": {
      "status": "healthy",
      "cache_size": 1024,
      "cache_hit_rate": 0.85,
      "cache_miss_rate": 0.15
    },
    "parallel_summarizer": {
      "status": "healthy",
      "active_batches": 1,
      "queue_size": 5,
      "max_concurrent": 10
    }
  },
  "performance": {
    "average_response_time": 2.3,
    "p95_response_time": 5.1,
    "p99_response_time": 8.7,
    "requests_per_minute": 45,
    "error_rate": 0.02
  },
  "quality_metrics": {
    "average_quality_score": 0.85,
    "low_quality_summaries": 12,
    "auto_regenerations": 8
  }
}
```

#### 3. Detailed Component Health

```bash
GET /api/summarize/health/detailed
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "detailed_components": {
    "summarization_manager": {
      "status": "healthy",
      "initialized": true,
      "available_summarizers": {
        "ollama": {
          "status": "healthy",
          "model": "qwen3:8b",
          "supported_content_types": ["article", "code", "document"],
          "requests_processed": 567,
          "average_processing_time": 2.1
        },
        "article": {
          "status": "healthy",
          "model": "qwen3:8b",
          "requests_processed": 234,
          "average_processing_time": 1.8
        },
        "code": {
          "status": "healthy",
          "model": "qwen3:8b",
          "requests_processed": 123,
          "average_processing_time": 2.5
        }
      }
    },
    "cache_manager": {
      "status": "healthy",
      "cache_stats": {
        "total_entries": 1024,
        "cache_size_mb": 45.2,
        "hit_rate": 0.85,
        "miss_rate": 0.15,
        "eviction_rate": 0.05
      },
      "storage": {
        "available_space_mb": 10240,
        "used_space_mb": 45.2,
        "cache_directory": "/var/cache/yipyap/summarization"
      }
    },
    "parallel_summarizer": {
      "status": "healthy",
      "concurrency": {
        "max_concurrent": 10,
        "current_active": 2,
        "queue_size": 5,
        "semaphore_available": 8
      },
      "batch_processing": {
        "active_batches": 1,
        "completed_batches": 45,
        "failed_batches": 2,
        "average_batch_size": 8.5
      }
    }
  }
}
```

### Health Check Configuration

Configure health check intervals and timeouts:

```bash
# Health check configuration
SUMMARIZATION_HEALTH_CHECK_INTERVAL=60
SUMMARIZATION_HEALTH_CHECK_TIMEOUT=10
SUMMARIZATION_HEALTH_CHECK_RETRIES=3
SUMMARIZATION_HEALTH_CHECK_START_PERIOD=60
```

## Metrics Collection

### Prometheus Metrics

The summarization system exposes Prometheus-compatible metrics:

```bash
GET /metrics
```

**Key Metrics:**

```prometheus
# Summarization request metrics
summarization_requests_total{content_type="article",status="success"} 1234
summarization_requests_total{content_type="code",status="success"} 567
summarization_requests_total{content_type="document",status="success"} 890
summarization_requests_total{status="error"} 45

# Response time metrics
summarization_response_time_seconds{quantile="0.5"} 2.1
summarization_response_time_seconds{quantile="0.9"} 5.1
summarization_response_time_seconds{quantile="0.99"} 8.7
summarization_response_time_seconds_sum 5678.9
summarization_response_time_seconds_count 2345

# Cache metrics
summarization_cache_hits_total 1890
summarization_cache_misses_total 455
summarization_cache_size_bytes 47332168

# Quality metrics
summarization_quality_score{quantile="0.5"} 0.85
summarization_quality_score{quantile="0.9"} 0.92
summarization_quality_score{quantile="0.99"} 0.95
summarization_quality_score_sum 1987.6
summarization_quality_score_count 2345

# Batch processing metrics
summarization_batch_requests_total 123
summarization_batch_processing_time_seconds{quantile="0.5"} 15.2
summarization_batch_processing_time_seconds{quantile="0.9"} 25.8
summarization_batch_processing_time_seconds_sum 2345.6
summarization_batch_processing_time_seconds_count 123

# Error metrics
summarization_errors_total{error_type="model_unavailable"} 5
summarization_errors_total{error_type="timeout"} 12
summarization_errors_total{error_type="invalid_input"} 8
summarization_errors_total{error_type="cache_error"} 3

# Resource usage metrics
summarization_memory_usage_bytes 134217728
summarization_cpu_usage_percent 45.2
summarization_active_connections 8
summarization_queue_size 5
```

### Custom Metrics

Additional custom metrics for detailed monitoring:

```prometheus
# Content type distribution
summarization_content_type_distribution{content_type="article"} 0.45
summarization_content_type_distribution{content_type="code"} 0.25
summarization_content_type_distribution{content_type="document"} 0.30

# Model usage metrics
summarization_model_usage_total{model="qwen3:8b"} 1890
summarization_model_usage_total{model="llama3.2:8b"} 455

# Feature usage metrics
summarization_feature_usage_total{feature="streaming"} 567
summarization_feature_usage_total{feature="batch_processing"} 123
summarization_feature_usage_total{feature="personalization"} 234
summarization_feature_usage_total{feature="cross_language"} 89

# Performance metrics
summarization_tokens_per_second 1250.5
summarization_tokens_per_request{content_type="article"} 450.2
summarization_tokens_per_request{content_type="code"} 320.8
summarization_tokens_per_request{content_type="document"} 580.1
```

## Logging

### Structured Logging

The summarization system uses structured logging for better observability:

```python
# Logging configuration
SUMMARIZATION_LOG_LEVEL=INFO
SUMMARIZATION_STRUCTURED_LOGGING=true
SUMMARIZATION_LOG_FORMAT=json
SUMMARIZATION_LOG_FILE=/var/log/yipyap/summarization.log
```

### Log Examples

#### Request Logging

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "logger": "summarization",
  "message": "Summarization request started",
  "request_id": "req_12345",
  "user_id": "user_67890",
  "content_type": "article",
  "summary_level": "detailed",
  "text_length": 2500,
  "model": "qwen3:8b",
  "include_outline": true,
  "include_highlights": false
}
```

#### Processing Log

```json
{
  "timestamp": "2024-01-15T10:30:02.456Z",
  "level": "INFO",
  "logger": "summarization",
  "message": "Summarization completed",
  "request_id": "req_12345",
  "processing_time": 2.333,
  "summary_length": 450,
  "quality_score": 0.87,
  "cache_hit": false,
  "tokens_used": 1250,
  "model": "qwen3:8b"
}
```

#### Error Logging

```json
{
  "timestamp": "2024-01-15T10:30:05.789Z",
  "level": "ERROR",
  "logger": "summarization",
  "message": "Summarization failed",
  "request_id": "req_12346",
  "error_type": "model_timeout",
  "error_message": "Model response timeout after 30 seconds",
  "content_type": "document",
  "text_length": 8000,
  "model": "qwen3:8b",
  "retry_count": 2
}
```

#### Performance Log

```json
{
  "timestamp": "2024-01-15T10:30:10.123Z",
  "level": "INFO",
  "logger": "summarization",
  "message": "Performance metrics",
  "metrics": {
    "average_response_time": 2.3,
    "p95_response_time": 5.1,
    "requests_per_minute": 45,
    "cache_hit_rate": 0.85,
    "error_rate": 0.02,
    "active_requests": 3,
    "queue_size": 2
  }
}
```

### Log Rotation

Configure log rotation for production environments:

```bash
# Log rotation configuration
/var/log/yipyap/summarization.log {
  daily
  rotate 30
  compress
  delaycompress
  missingok
  notifempty
  create 644 yipyap yipyap
  postrotate
    systemctl reload yipyap
  endscript
}
```

## Alerting

### Alert Rules

Configure alerting rules for different scenarios:

#### 1. High Error Rate Alert

```yaml
# prometheus/alert_rules.yml
groups:
  - name: summarization_alerts
    rules:
      - alert: HighSummarizationErrorRate
        expr: rate(summarization_requests_total{status="error"}[5m]) / rate(summarization_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High summarization error rate"
          description: "Summarization error rate is {{ $value | humanizePercentage }} over the last 5 minutes"
```

#### 2. High Response Time Alert

```yaml
      - alert: HighSummarizationResponseTime
        expr: histogram_quantile(0.95, rate(summarization_response_time_seconds_bucket[5m])) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High summarization response time"
          description: "95th percentile response time is {{ $value }}s over the last 5 minutes"
```

#### 3. Service Unavailable Alert

```yaml
      - alert: SummarizationServiceDown
        expr: up{job="yipyap"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Summarization service is down"
          description: "The summarization service has been down for more than 1 minute"
```

#### 4. Low Cache Hit Rate Alert

```yaml
      - alert: LowSummarizationCacheHitRate
        expr: rate(summarization_cache_hits_total[5m]) / (rate(summarization_cache_hits_total[5m]) + rate(summarization_cache_misses_total[5m])) < 0.7
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low summarization cache hit rate"
          description: "Cache hit rate is {{ $value | humanizePercentage }} over the last 5 minutes"
```

#### 5. High Memory Usage Alert

```yaml
      - alert: HighSummarizationMemoryUsage
        expr: summarization_memory_usage_bytes / 1024 / 1024 / 1024 > 6
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High summarization memory usage"
          description: "Memory usage is {{ $value }}GB"
```

#### 6. Queue Overflow Alert

```yaml
      - alert: SummarizationQueueOverflow
        expr: summarization_queue_size > 50
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Summarization queue overflow"
          description: "Queue size is {{ $value }} items"
```

### Alert Configuration

Configure alerting channels and thresholds:

```bash
# Alerting configuration
SUMMARIZATION_ALERTING_ENABLED=true
SUMMARIZATION_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SUMMARIZATION_ALERT_EMAIL=alerts@yourcompany.com
SUMMARIZATION_ALERT_PAGERDUTY_KEY=your-pagerduty-key

# Alert thresholds
SUMMARIZATION_ALERT_ERROR_RATE_THRESHOLD=0.05
SUMMARIZATION_ALERT_RESPONSE_TIME_THRESHOLD=10
SUMMARIZATION_ALERT_CACHE_HIT_RATE_THRESHOLD=0.7
SUMMARIZATION_ALERT_MEMORY_USAGE_THRESHOLD=6
SUMMARIZATION_ALERT_QUEUE_SIZE_THRESHOLD=50
```

## Dashboard Configuration

### Grafana Dashboard

Create a Grafana dashboard for summarization monitoring:

```json
{
  "dashboard": {
    "title": "YipYap Summarization Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(summarization_requests_total[5m])",
            "legendFormat": "{{content_type}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(summarization_response_time_seconds_bucket[5m]))",
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.5, rate(summarization_response_time_seconds_bucket[5m]))",
            "legendFormat": "P50"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(summarization_requests_total{status=\"error\"}[5m]) / rate(summarization_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(summarization_cache_hits_total[5m]) / (rate(summarization_cache_hits_total[5m]) + rate(summarization_cache_misses_total[5m]))",
            "legendFormat": "Cache Hit Rate"
          }
        ]
      },
      {
        "title": "Quality Score",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.5, rate(summarization_quality_score_bucket[5m]))",
            "legendFormat": "Average Quality"
          }
        ]
      },
      {
        "title": "Active Requests",
        "type": "stat",
        "targets": [
          {
            "expr": "summarization_active_connections",
            "legendFormat": "Active Requests"
          }
        ]
      }
    ]
  }
}
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

Monitor these KPIs for optimal performance:

1. **Response Time**:
   - P50: < 3 seconds
   - P95: < 8 seconds
   - P99: < 15 seconds

2. **Throughput**:
   - Requests per minute: > 100
   - Tokens per second: > 1000

3. **Quality**:
   - Average quality score: > 0.8
   - Low quality summaries: < 5%

4. **Resource Usage**:
   - Memory usage: < 6GB
   - CPU usage: < 80%
   - Cache hit rate: > 70%

5. **Reliability**:
   - Error rate: < 2%
   - Uptime: > 99.9%

### Performance Tuning

Based on monitoring data, adjust these settings:

```bash
# Performance tuning based on metrics
SUMMARIZATION_MAX_CONCURRENT=10
SUMMARIZATION_MAX_TOKENS_PER_BATCH=15000
SUMMARIZATION_MAX_BATCH_SIZE=15
SUMMARIZATION_CACHE_TTL_HOURS=48
SUMMARIZATION_RATE_LIMIT_PER_MINUTE=500
```

## Troubleshooting

### Common Monitoring Issues

1. **High Error Rate**:
   - Check Ollama service health
   - Verify model availability
   - Review error logs for specific issues

2. **High Response Time**:
   - Increase concurrent processing
   - Optimize cache settings
   - Check system resources

3. **Low Cache Hit Rate**:
   - Increase cache TTL
   - Review cache invalidation logic
   - Check cache storage capacity

4. **Memory Issues**:
   - Reduce concurrent operations
   - Implement memory limits
   - Monitor for memory leaks

### Debug Mode

Enable debug mode for detailed monitoring:

```bash
# Debug configuration
SUMMARIZATION_DEBUG_MODE=true
SUMMARIZATION_LOG_LEVEL=DEBUG
SUMMARIZATION_PROFILING_ENABLED=true
SUMMARIZATION_PROFILING_OUTPUT=/tmp/summarization_profile.json
```

This monitoring and alerting guide provides comprehensive observability for the summarization system. Adjust the configurations based on your specific requirements and infrastructure constraints.
