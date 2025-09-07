# Frontend Dashboard Panel Suggestions

This document provides suggestions for frontend dashboard panels to visualize the service resilience metrics and health states.

## Overview

The service metrics system provides rich data for monitoring service health, reconnection patterns, and performance. These suggestions focus on creating actionable dashboards that help operators quickly identify issues and understand system behavior.

## Core Metrics Available

### Prometheus Metrics

- `yipyap_service_reconnect_attempts_total{service}` - Counter of reconnection attempts
- `yipyap_service_last_ok_seconds{service}` - UNIX timestamp of last successful probe
- `yipyap_service_connection_state{service,state}` - One-hot gauges for connection states
- `yipyap_service_health_state{service,state}` - One-hot gauges for health states
- `yipyap_service_reconnect_delay_seconds_bucket/sum/count` - Histogram of reconnection delays
- `yipyap_service_health_check_duration_seconds_bucket/sum/count` - Histogram of health check durations

### JSON Metrics

- `connection_state`, `connection_attempts`, `last_ok_iso` per service
- Overall service counts and health percentages

## Dashboard Panel Suggestions

### 1. Service Health Overview

**Panel Type**: Heatmap/Status Grid
**Metrics**: `yipyap_service_health_state{service,state}`

**Description**: Color-coded grid showing all services and their current health states:

- Green: `healthy=1`
- Yellow: `degraded=1`
- Red: `unhealthy=1`
- Gray: No data

**Layout**: 3x3 grid with service names as rows, health states as columns. Use conditional formatting to highlight problematic services.

### 2. Connection State Heatmap

**Panel Type**: Heatmap
**Metrics**: `yipyap_service_connection_state{service,state}`

**Description**: Visual representation of connection states across all services:

- Connected (green): `connected=1`
- Reconnecting (yellow): `reconnecting=1`
- Disconnected (red): `disconnected=1`

**Use Case**: Quickly identify services experiencing connection issues or in recovery mode.

### 3. Reconnection Attempts Rate

**Panel Type**: Line Chart
**Metrics**: `rate(yipyap_service_reconnect_attempts_total{service}[5m])`

**Description**: Shows the rate of reconnection attempts over time for each service. Spikes indicate periods of instability.

**Alerting**: Set thresholds to alert when reconnection rate exceeds normal baseline for a service.

### 4. Time Since Last OK

**Panel Type**: Gauge/Stat Panel
**Metrics**: `time() - yipyap_service_last_ok_seconds{service}`

**Description**: Shows how long ago each service was last healthy. Critical for identifying stale or stuck services.

**Thresholds**:

- Green: < 5 minutes
- Yellow: 5-15 minutes  
- Red: > 15 minutes

### 5. Reconnection Delay Distribution

**Panel Type**: Histogram
**Metrics**: `yipyap_service_reconnect_delay_seconds_bucket{service}`

**Description**: Distribution of reconnection delays, helping identify if services are experiencing consistent delays or intermittent issues.

**Analysis**: Look for patterns - consistent high delays might indicate network issues, while spikes suggest temporary problems.

### 6. Service Availability Percentage

**Panel Type**: Stat Panel
**Metrics**: Calculated from `yipyap_service_health_state`

**Description**: Overall percentage of healthy services. Quick at-a-glance metric for system health.

**Formula**: `(sum(yipyap_service_health_state{state="healthy"}) / count(yipyap_service_health_state)) * 100`

### 7. Health Check Duration Trends

**Panel Type**: Line Chart
**Metrics**: `histogram_quantile(0.95, rate(yipyap_service_health_check_duration_seconds_bucket{service}[5m]))`

**Description**: 95th percentile of health check durations over time. Helps identify performance degradation.

### 8. Service Status Timeline

**Panel Type**: Timeline/State Chart
**Metrics**: `yipyap_service_health_state{service,state}` over time

**Description**: Shows state transitions for each service over time, helping identify patterns and recurring issues.

## Implementation Notes

### Frontend Integration

- Use the existing `/api/services/metrics` endpoint for real-time JSON data
- For historical trends, scrape `/api/services/metrics/prom` endpoint
- Consider caching metrics data to reduce API calls

### Color Coding Standards

- **Green**: Healthy/Connected/Good performance
- **Yellow**: Degraded/Reconnecting/Warning thresholds
- **Red**: Unhealthy/Disconnected/Critical issues
- **Gray**: No data/Unknown state

### Responsive Design

- Ensure panels work well on both desktop and mobile
- Use collapsible sections for detailed metrics
- Provide drill-down capabilities for service-specific views

### Real-time Updates

- Refresh metrics every 30-60 seconds for overview panels
- Use WebSocket or polling for critical status indicators
- Implement progressive loading for historical data

## Alerting Suggestions

### High Priority Alerts

- Any service in `unhealthy` state for > 5 minutes
- Reconnection rate > 10 attempts/minute for any service
- Time since last OK > 15 minutes for any service

### Medium Priority Alerts  

- Any service in `degraded` state for > 10 minutes
- Reconnection rate > 5 attempts/minute for any service
- Health check duration p95 > 5 seconds

### Low Priority Alerts

- Overall service availability < 90%
- Multiple services showing reconnection activity

## Example Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Service Health Overview                  │
│  [Comfy: Green] [NLWeb: Yellow] [VectorDB: Green]          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Reconnection Attempts Rate                   │
│  [Line chart showing attempts over time]                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Time Since OK   │ │ Availability %  │ │ Active Services │
│ Comfy: 2m       │ │ 85%             │ │ 3/3             │
│ NLWeb: 8m       │ │                 │ │                 │
│ VectorDB: 1m    │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Future Enhancements

### Advanced Analytics

- Correlation analysis between service failures
- Predictive alerts based on historical patterns
- Service dependency impact analysis

### Customization

- User-configurable thresholds and alerts
- Custom dashboard layouts
- Service-specific detail views

### Integration

- Export metrics to external monitoring systems
- Integration with incident management tools
- Automated runbook suggestions based on metrics
