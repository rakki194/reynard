# Service Operations Runbook Snippet

This document provides operational guidance for interpreting service states, performing restarts, and configuring backoff parameters.

## Service State Interpretation

### Health States

#### HEALTHY

- Service is fully operational
- All health checks passing
- No recent errors or connection issues
- **Action**: Monitor normally

#### DEGRADED

- Service is running but experiencing performance issues
- May have elevated latency or partial functionality
- Connection may be unstable but functional
- **Action**: Investigate performance issues, check logs for warnings

#### UNHEALTHY

- Service is not functioning properly
- Health checks failing consistently
- Connection issues or dependency problems
- **Action**: Immediate investigation required, consider restart

### Connection States

#### CONNECTED

- Service has established connection to its dependencies
- Communication is working normally
- **Action**: Normal operation

#### RECONNECTING

- Service detected connection loss and is attempting recovery
- Backoff retry loop is active
- **Action**: Monitor reconnection attempts, check dependency health

#### DISCONNECTED

- Service has lost connection and is not attempting recovery
- May indicate configuration issues or dependency unavailability
- **Action**: Check service configuration and dependency status

## Restart Guidance

### When to Restart

**Immediate Restart Required:**

- Service stuck in UNHEALTHY state for > 5 minutes
- Service in DISCONNECTED state with no reconnection attempts
- Configuration changes that require service restart

**Consider Restart:**

- Service in DEGRADED state for > 10 minutes
- High reconnection attempt rate (> 10 attempts/minute)
- Performance issues not resolved by dependency recovery

**Avoid Restart:**

- Service is HEALTHY and functioning normally
- Service is actively reconnecting (RECONNECTING state)
- During peak usage periods unless critical

### Restart Procedure

1. **Pre-restart Checks**

   ```bash
   # Check current service state
   curl -s -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/api/services/health/$SERVICE_NAME" | jq

   # Check service metrics
   curl -s -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/api/services/metrics/$SERVICE_NAME" | jq
   ```

2. **Perform Restart**

   ```bash
   # Restart specific service
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/api/services/restart/$SERVICE_NAME"
   ```

3. **Post-restart Verification**

   ```bash
   # Wait 30 seconds, then check health
   sleep 30
   curl -s -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/api/services/health/$SERVICE_NAME" | jq

   # Monitor for 2-3 minutes to ensure stability
   ```

### Service-Specific Restart Notes

#### Comfy Service

- Restart may interrupt ongoing image generation
- Check for active workflows before restarting
- Restart typically takes 10-30 seconds

#### NLWeb Router Service

- Restart may temporarily disable tool suggestions
- Cached suggestions may remain available during restart
- Restart typically takes 5-15 seconds

#### VectorDB Service

- Restart may interrupt ongoing RAG operations
- Database connections will be re-established
- Restart typically takes 5-20 seconds

## Backoff Configuration Knobs

### Environment Variables

All backoff parameters can be configured via environment variables or config file:

#### Comfy Service

```bash
# Health check interval (seconds)
export COMFY_HEALTH_INTERVAL_S=60

# Reconnection parameters
export COMFY_RECONNECT_MAX_ATTEMPTS=5
export COMFY_RECONNECT_BASE_DELAY_S=0.5
export COMFY_RECONNECT_MAX_DELAY_S=30
```

#### NLWeb Router Service

```bash
# Health check interval (seconds)
export NLWEB_HEALTH_INTERVAL_S=120

# Reconnection parameters
export NLWEB_RECONNECT_MAX_ATTEMPTS=5
export NLWEB_RECONNECT_BASE_DELAY_MS=200
export NLWEB_RECONNECT_MAX_DELAY_MS=5000
```

#### VectorDB Service

```bash
# Health check interval (seconds)
export PG_HEALTH_INTERVAL_S=60

# Reconnection parameters
export PG_RECONNECT_ON_ERROR=true
export PG_POOL_PRE_PING=true
```

### Configuration File

Parameters can also be set in `config.json`:

```json
{
  "comfy_health_interval_s": 60,
  "comfy_reconnect_max_attempts": 5,
  "comfy_reconnect_base_delay_s": 0.5,
  "comfy_reconnect_max_delay_s": 30,

  "nlweb_health_interval_s": 120,
  "nlweb_reconnect_max_attempts": 5,
  "nlweb_reconnect_base_delay_ms": 200,
  "nlweb_reconnect_max_delay_ms": 5000,

  "pg_health_interval_s": 60,
  "pg_reconnect_on_error": true,
  "pg_pool_pre_ping": true
}
```

### Parameter Tuning Guidelines

#### For High-Availability Environments

- **Shorter health intervals**: 30-60 seconds for faster failure detection
- **More reconnection attempts**: 10-15 attempts for persistent recovery
- **Shorter base delays**: 0.1-0.5 seconds for quick retry
- **Higher max delays**: 60-120 seconds to handle longer outages

#### For Resource-Constrained Environments

- **Longer health intervals**: 120-300 seconds to reduce overhead
- **Fewer reconnection attempts**: 3-5 attempts to limit resource usage
- **Longer base delays**: 1-2 seconds to reduce thrashing
- **Lower max delays**: 10-30 seconds to fail fast

#### For Development/Testing

- **Very short intervals**: 10-30 seconds for quick feedback
- **Minimal attempts**: 2-3 attempts for fast iteration
- **Short delays**: 0.1-0.5 seconds for immediate retry

## Troubleshooting Common Issues

### Service Stuck in UNHEALTHY State

1. **Check dependency health**

   ```bash
   # Check if dependencies are available
   curl -s "$COMFY_API_URL/system_stats"  # For Comfy
   curl -s "$NLWEB_BASE_URL/status"       # For NLWeb
   psql "$PG_DSN" -c "SELECT 1"           # For VectorDB
   ```

2. **Review service logs**

   ```bash
   # Check application logs for errors
   tail -f logs/app.log | grep -i "$SERVICE_NAME"
   ```

3. **Verify configuration**

   ```bash
   # Check service configuration
   curl -s -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/api/services/config/$SERVICE_NAME" | jq
   ```

### High Reconnection Attempt Rate

1. **Identify the pattern**
   - Check if attempts are constant or intermittent
   - Look for correlation with other services

2. **Check network connectivity**

   ```bash
   # Test basic connectivity
   ping $DEPENDENCY_HOST
   telnet $DEPENDENCY_HOST $DEPENDENCY_PORT
   ```

3. **Review resource usage**

   ```bash
   # Check system resources
   top
   df -h
   free -h
   ```

### Service Not Starting

1. **Check startup logs**

   ```bash
   # Look for startup errors
   tail -f logs/app.log | grep -i "start.*$SERVICE_NAME"
   ```

2. **Verify dependencies**
   - Ensure all required services are running
   - Check configuration validity

3. **Check resource availability**
   - Verify sufficient memory and disk space
   - Check port availability

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Service Health Rate**

   ```promql
   # Percentage of healthy services
   (sum(yipyap_service_health_state{state="healthy"}) / count(yipyap_service_health_state)) * 100
   ```

2. **Reconnection Attempt Rate**

   ```promql
   # Rate of reconnection attempts per service
   rate(yipyap_service_reconnect_attempts_total[5m])
   ```

3. **Time Since Last OK**

   ```promql
   # How long since service was last healthy
   time() - yipyap_service_last_ok_seconds
   ```

### Recommended Alerts

```yaml
# High priority - immediate attention required
- alert: ServiceUnhealthy
  expr: yipyap_service_health_state{state="unhealthy"} == 1
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Service {{ $labels.service }} is unhealthy"

# Medium priority - investigate soon
- alert: ServiceDegraded
  expr: yipyap_service_health_state{state="degraded"} == 1
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Service {{ $labels.service }} is degraded"

# Low priority - monitor
- alert: HighReconnectionRate
  expr: rate(yipyap_service_reconnect_attempts_total[5m]) > 5
  for: 2m
  labels:
    severity: info
  annotations:
    summary: "High reconnection rate for {{ $labels.service }}"
```

## Emergency Procedures

### Complete Service Restart

If individual service restarts are not resolving issues:

1. **Stop all services**

   ```bash
   # Stop the application
   pkill -f "python -m app"
   ```

2. **Verify clean shutdown**

   ```bash
   # Check for remaining processes
   ps aux | grep -i yipyap
   ```

3. **Restart application**

   ```bash
   # Restart with proper environment
   DEV_PORT=7000 ROOT_DIR=$HOME/datasets NODE_ENV=development python -m app
   ```

4. **Monitor startup**

   ```bash
   # Watch for successful startup
   tail -f logs/app.log | grep -i "started\|ready"
   ```

### Configuration Recovery

If configuration issues are suspected:

1. **Backup current config**

   ```bash
   cp config/config.json config/config.json.backup.$(date +%Y%m%d_%H%M%S)
   ```

2. **Reset to defaults**

   ```bash
   # Remove problematic settings
   jq 'del(.comfy_reconnect_max_attempts, .nlweb_reconnect_max_attempts)' \
     config/config.json > config/config.json.new
   mv config/config.json.new config/config.json
   ```

3. **Apply configuration**

   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/api/services/apply-config"
   ```
