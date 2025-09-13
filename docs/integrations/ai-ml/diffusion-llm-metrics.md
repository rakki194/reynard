# Diffusion LLM Metrics

This document describes the metrics collection and export functionality for the Diffusion LLM integration in Reynard.

## Overview

The Diffusion LLM integration includes comprehensive metrics collection for monitoring performance, usage patterns,
and error rates. Metrics are stored in the SQLite metrics database and
can be exported in multiple formats for integration with external monitoring systems.

## Metrics Collected

### Performance Metrics

- **Request Latency**: Time taken for each request (generate, infill, generate/stream, infill/stream)
- **Stream Duration**: Total time for streaming operations
- **Token Count**: Estimated number of tokens generated (approximation based on character count)
- **Generation Time**: Internal generation time reported by the model

### Usage Metrics

- **Request Counts**: Total number of requests per endpoint
- **Error Rates**: Success/failure rates per endpoint
- **Model Usage**: Which models are being used and their performance

### Error Tracking

- **Error Counts**: Number of errors per endpoint type
- **Error Types**: Categorized errors (timeout, network, validation, etc.)
- **Success Rates**: Percentage of successful requests

## API Endpoints

### Get Metrics Summary

```
GET /api/diffusion/metrics
```

Returns a comprehensive summary of all diffusion LLM metrics including:

- Overall statistics (total requests, success rate, average latency)
- Per-endpoint error rates and request counts
- Average latencies by event type
- Token counts by event type
- Recent performance events

### Export Metrics

```
GET /api/diffusion/metrics/export?format={format}
```

Exports metrics in various formats for external monitoring systems:

- `format=json` (default): JSON format with full metrics data
- `format=prometheus`: Prometheus-compatible metrics format
- `format=influxdb`: InfluxDB line protocol format

## Metrics Database Schema

Metrics are stored in the `performance_events` table with the following structure:

```sql
CREATE TABLE performance_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    duration REAL NOT NULL,
    timestamp REAL NOT NULL,
    metadata TEXT
);
```

### Event Types

- `diffusion_generate`: Non-streaming text generation
- `diffusion_infill`: Non-streaming text infilling
- `diffusion_generate_stream`: Streaming text generation
- `diffusion_infill_stream`: Streaming text infilling

### Metadata Fields

The `metadata` field contains JSON data with additional context:

```json
{
  "token_count": 25,
  "max_new_tokens": 64,
  "temperature": 0.2,
  "top_p": 0.9,
  "alg": "entropy",
  "generation_time": 0.02
}
```

## Prometheus Format

When exporting to Prometheus format, the following metrics are available:

```
# HELP diffusion_llm_requests_total Total number of requests
# TYPE diffusion_llm_requests_total counter
diffusion_llm_requests_total{endpoint="generate"} 10
diffusion_llm_requests_total{endpoint="infill"} 5

# HELP diffusion_llm_errors_total Total number of errors
# TYPE diffusion_llm_errors_total counter
diffusion_llm_errors_total{endpoint="generate"} 2
diffusion_llm_errors_total{endpoint="infill"} 1

# HELP diffusion_llm_latency_seconds Average latency in seconds
# TYPE diffusion_llm_latency_seconds gauge
diffusion_llm_latency_seconds{event_type="diffusion_generate"} 1.5
diffusion_llm_latency_seconds{event_type="diffusion_infill"} 2.0

# HELP diffusion_llm_tokens_total Total tokens generated
# TYPE diffusion_llm_tokens_total counter
diffusion_llm_tokens_total{event_type="diffusion_generate"} 25
diffusion_llm_tokens_total{event_type="diffusion_infill"} 30
```

## InfluxDB Format

When exporting to InfluxDB format, metrics are formatted as line protocol:

```
diffusion_llm,type=requests,endpoint=generate count=10 1234567890000000000
diffusion_llm,type=requests,endpoint=infill count=5 1234567890000000000
diffusion_llm,type=latency,event_type=diffusion_generate value=1.5 1234567890000000000
diffusion_llm,type=latency,event_type=diffusion_infill value=2.0 1234567890000000000
diffusion_llm,type=tokens,event_type=diffusion_generate count=25 1234567890000000000
diffusion_llm,type=tokens,event_type=diffusion_infill count=30 1234567890000000000
```

## Error Rate Calculation

Error rates are calculated as success percentages:

```
success_rate = ((total_requests - error_count) / total_requests) * 100
```

For example:

- 10 total requests, 2 errors = 80% success rate
- 5 total requests, 1 error = 80% success rate

## Token Count Estimation

Token counts are estimated using a simple character-based approximation:

```
token_count = max(1, len(text) // 4)
```

This provides a rough approximation where
1 token ≈ 4 characters for English text. In a production environment,
you would use the actual model's tokenizer for more accurate counts.

## Monitoring Integration

### Prometheus

To integrate with Prometheus, configure a scrape job:

```yaml
scrape_configs:
  - job_name: "reynard-diffusion-llm"
    static_configs:
      - targets: ["localhost:7000"]
    metrics_path: "/api/diffusion/metrics/export"
    params:
      format: ["prometheus"]
```

### InfluxDB

To send metrics to InfluxDB, use the line protocol endpoint:

```bash
curl "http://localhost:7000/api/diffusion/metrics/export?format=influxdb" | \
  curl -i -XPOST "http://influxdb:8086/write?db=reynard" --data-binary @-
```

### Grafana

Create dashboards using the Prometheus or InfluxDB data sources to visualize:

- Request rates and error rates
- Latency percentiles
- Token generation rates
- Model usage patterns

## Testing

Unit tests for the metrics functionality are available in:

- `app/tests/test_diffusion_metrics_unit.py`: Core metrics logic tests
- `app/tests/test_diffusion_metrics.py`: API endpoint tests (requires diffusion LLM enabled)

Run tests with:

```bash
python -m pytest app/tests/test_diffusion_metrics_unit.py -v
```

## Configuration

Metrics collection is enabled by default when
the diffusion LLM service is active. No additional configuration is required.

The metrics database is stored in `./metrics.db` by default and can be configured via the `MetricsDatabase` class.
