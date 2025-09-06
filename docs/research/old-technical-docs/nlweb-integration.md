# NLWeb Integration

This document describes configuration and rollout for integrating NLWeb into yipyap.

## Configuration

- Environment variables:
  - `NLWEB_ENABLED`: set to `true` to enable the integration (default: false)
  - `NLWEB_CONFIG_DIR`: path to NLWeb config directory (default: `config/nlweb`)
  - `NLWEB_BASE_URL`: optional external NLWeb server URL (omit to use embedded router)

### Health and Watchdog Tunables

The router service performs periodic health checks and supports bounded exponential backoff for reconnection.

- `NLWEB_HEALTH_INTERVAL_S` (default 120): health probe cadence
- `NLWEB_RECONNECT_MAX_ATTEMPTS` (default 5)
- `NLWEB_RECONNECT_BASE_DELAY_MS` (default 200)
- `NLWEB_RECONNECT_MAX_DELAY_MS` (default 5000)

These are mirrored in `AppConfig` as `nlweb_health_interval_s`, `nlweb_reconnect_max_attempts`, `nlweb_reconnect_base_delay_ms`, and `nlweb_reconnect_max_delay_ms`.

### Rollout and Performance Configuration

Additional environment variables for rollout management:

- `NLWEB_CANARY_ENABLED`: enable canary rollout (default: false)
- `NLWEB_CANARY_PERCENTAGE`: percentage of users for canary (default: 5.0)
- `NLWEB_SUGGESTION_TIMEOUT_MS`: suggestion timeout in milliseconds (default: 1500)
- `NLWEB_CACHE_TTL_SECONDS`: cache TTL for suggestions (default: 10)
- `NLWEB_MAX_CACHE_ENTRIES`: maximum cache entries (default: 64)
- `NLWEB_RATE_LIMIT_REQUESTS_PER_MINUTE`: rate limiting (default: 30)
- `NLWEB_ROLLBACK_ENABLED`: emergency rollback flag (default: false)
- `NLWEB_PERFORMANCE_MONITORING_ENABLED`: performance monitoring (default: true)

## Backend wiring

- The `AppConfig` includes `nlweb_enabled`, `nlweb_config_dir`, `nlweb_base_url`.
- `ConfigManagerService` reads env overrides for these keys.
- `service_setup` logs whether NLWeb is enabled after core services start. Subsequent phases add router and bridge services behind this flag.

## Frontend UX

- Streaming SSE will interleave `tool_execution` and `tool_result` chunks. The `useOllama` composable already handles these chunk types and updates conversation history accordingly.

## Rollout Strategy

### Environment-Specific Configurations

**Local Development:**

```bash
NLWEB_ENABLED=true NLWEB_CANARY_ENABLED=false NLWEB_ROLLBACK_ENABLED=false python -m app
```

**Staging Environment:**

```bash
NLWEB_ENABLED=true NLWEB_CANARY_ENABLED=true NLWEB_CANARY_PERCENTAGE=10 NLWEB_ROLLBACK_ENABLED=true python -m app
```

**Production Environment:**

```bash
NLWEB_ENABLED=true NLWEB_CANARY_ENABLED=true NLWEB_CANARY_PERCENTAGE=5 NLWEB_ROLLBACK_ENABLED=true python -m app
```

### Canary Rollout

The canary rollout system enables NLWeb for a percentage of users based on their user ID hash. This allows for gradual rollout and monitoring before full deployment.

- Canary percentage is configurable via `NLWEB_CANARY_PERCENTAGE`
- User selection is deterministic based on user ID hash
- Users not in canary receive empty suggestions (silent fallback)
- Canary status is logged for monitoring

### Performance Monitoring (Ops)

The system includes comprehensive performance monitoring:

- **Suggestion Latency**: Tracks P95 and P99 latencies for tool suggestions
- **Cache Performance**: Monitors cache hit rates and cache efficiency
- **Tool Execution**: Tracks execution times for individual tools
- **Rate Limiting**: Monitors rate limit violations and user patterns

### Emergency Rollback

Emergency rollback can be enabled via:

1. **Environment Variable**: Set `NLWEB_ROLLBACK_ENABLED=true`
2. **API Endpoint**: POST to `/api/nlweb/rollback` (admin only)
3. **Rollout Script**: Use `./scripts/nlweb_rollout.sh -a rollback`

When rollback is enabled:

- All NLWeb suggestions return empty results
- Performance monitoring continues
- Health checks return DEGRADED status
- Rollback can be disabled via the same methods

## Rollout Script

The `scripts/nlweb_rollout.sh` script provides a command-line interface for managing NLWeb deployment:

```bash
# Check current status
./scripts/nlweb_rollout.sh -e local -a status

# Enable canary rollout
./scripts/nlweb_rollout.sh -e staging -a canary

# Enable full rollout
./scripts/nlweb_rollout.sh -e production -a enable

# Emergency rollback
./scripts/nlweb_rollout.sh -e production -a rollback
```

## API Endpoints

### Status and Monitoring

- `GET /api/nlweb/status` - Get NLWeb integration status and performance metrics
- `GET /api/nlweb/verification` - Get verification checklist for rollout
- `POST /api/nlweb/rollback` - Enable/disable emergency rollback (admin only)

### Example Status Response

```json
{
  "enabled": true,
  "canary_enabled": true,
  "canary_percentage": 5.0,
  "rollback_enabled": false,
  "performance_monitoring": true,
  "performance": {
    "total_requests": 150,
    "avg_latency_ms": 245.3,
    "p95_latency_ms": 1200.0,
    "p99_latency_ms": 1800.0,
    "cache_hit_rate": 35.2,
    "tool_execution_stats": {
      "git_status": {
        "avg_execution_time": 0.8,
        "max_execution_time": 2.1,
        "budget": 5.0,
        "within_budget": true,
        "total_executions": 25
      }
    }
  },
  "cache": {
    "cache_hits": 53,
    "cache_misses": 97,
    "cache_hit_rate": 35.3,
    "cache_size": 45,
    "cache_max_entries": 64,
    "cache_ttl_seconds": 10
  }
}
```

## Performance Budgets

### Suggestion Latency Budgets

- **Cold Start**: < 1.5s P95 (first request after startup)
- **Warm Cache**: < 300ms P95 (subsequent requests)
- **Timeout**: 1.5s maximum per suggestion request

### Tool Execution Budgets

- **git_status**: 5 seconds
- **list_files**: 3 seconds  
- **read_file**: 2 seconds
- **generate_captions**: 30 seconds
- **Default**: 10 seconds

### Cache Performance Targets

- **Cache Hit Rate**: > 20% for production
- **Cache TTL**: 10 seconds (configurable)
- **Cache Size**: 64 entries maximum (configurable)

## Verification Checklist

The verification endpoint provides automated checks for rollout readiness:

- **Suggestion Latency**: P95 under 1.5s
- **Cache Hit Rate**: Above 20%
- **Request Volume**: At least 10 requests processed
- **Configuration**: Proper settings for environment
- **Rollback Status**: Emergency rollback disabled

## Quick Troubleshooting Tip

- If the server logs do not show NLWeb status, verify env variables are passed to the Python process and that `ConfigManagerService` loads without errors.

## Troubleshooting Guide

This section covers common issues and their solutions when working with the NLWeb integration.

### Configuration Issues

**Problem**: NLWeb integration not starting

- **Symptoms**: Server logs show "NLWeb integration disabled" or no NLWeb-related messages
- **Solutions**:
  1. Verify `NLWEB_ENABLED=true` is set in environment
  2. Check that `NLWEB_CONFIG_DIR` points to a valid directory containing `tools.xml`
  3. Ensure the config directory has proper read permissions
  4. Restart the server after changing environment variables

**Problem**: Router service fails to initialize

- **Symptoms**: Error messages about "NLWeb router service not available" or XML parsing errors
- **Solutions**:
  1. Verify `config/nlweb/tools.xml` exists and is valid XML
  2. Check XML syntax with `xmllint --noout config/nlweb/tools.xml`
  3. Ensure all referenced tool names in XML match actual tool registry names
  4. Check server logs for specific XML parsing error details

### Performance Issues

**Problem**: Tool suggestions are slow (>1.5s)

- **Symptoms**: Long delays before tool suggestions appear
- **Solutions**:
  1. Check if router cache is warming properly (look for "cache warm" logs)
  2. Verify LLM endpoint is responsive and not overloaded
  3. Consider reducing `top_k` parameter in router suggestions
  4. Monitor system resources (CPU, memory) during suggestions

**Problem**: Tool execution timeouts

- **Symptoms**: Tools fail with timeout errors or take too long to complete
- **Solutions**:
  1. Check individual tool performance and optimize slow operations
  2. Increase timeout values in tool configurations if appropriate
  3. Verify external dependencies (databases, APIs) are responsive
  4. Consider implementing tool-specific timeouts

### Rollout Issues

**Problem**: Canary rollout not working

- **Symptoms**: No users receiving NLWeb suggestions despite canary being enabled
- **Solutions**:
  1. Verify `NLWEB_CANARY_ENABLED=true` is set
  2. Check `NLWEB_CANARY_PERCENTAGE` value (should be > 0)
  3. Ensure user IDs are being passed correctly in context
  4. Check logs for canary selection messages

**Problem**: Emergency rollback not working

- **Symptoms**: NLWeb still active despite rollback being enabled
- **Solutions**:
  1. Verify `NLWEB_ROLLBACK_ENABLED=true` is set
  2. Restart the server after enabling rollback
  3. Check API endpoint `/api/nlweb/rollback` for status
  4. Verify admin permissions for API rollback

### XML Configuration Issues

**Problem**: Invalid tool suggestions

- **Symptoms**: Router suggests inappropriate tools or wrong parameters
- **Solutions**:
  1. Review and improve tool descriptions in `tools.xml`
  2. Add more specific examples to tool definitions
  3. Check that parameter extraction hints are clear and accurate
  4. Test with simpler queries to isolate the issue

**Problem**: XML parsing errors

- **Symptoms**: Server fails to start with XML-related errors
- **Solutions**:
  1. Validate XML syntax: `xmllint --noout config/nlweb/tools.xml`
  2. Check for special characters in tool descriptions
  3. Ensure all XML tags are properly closed
  4. Verify XML encoding is UTF-8

### MCP Proxy Issues

**Problem**: External NLWeb server connection failures

- **Symptoms**: 404/503 errors when using `NLWEB_BASE_URL`
- **Solutions**:
  1. Verify `NLWEB_BASE_URL` is correct and accessible
  2. Check network connectivity to external server
  3. Ensure external server supports required endpoints (`/ask`, `/mcp`, `/sites`)
  4. Verify authentication if external server requires it

**Problem**: MCP JSON-RPC errors

- **Symptoms**: MCP tool calls fail with JSON-RPC errors
- **Solutions**:
  1. Check MCP method names match external server capabilities
  2. Verify JSON-RPC request format is correct
  3. Ensure parameters match expected schema
  4. Check external server logs for detailed error information

### Streaming and Frontend Issues

**Problem**: Tool execution chunks not appearing in frontend

- **Symptoms**: Backend executes tools but frontend doesn't show progress
- **Solutions**:
  1. Verify `useOllama.ts` handles `tool_execution` and `tool_result` chunks
  2. Check SSE stream is properly formatted
  3. Ensure frontend notification system is working
  4. Check browser console for JavaScript errors

**Problem**: Assistant responses are incomplete

- **Symptoms**: Tool results not integrated into final response
- **Solutions**:
  1. Verify tool results are properly formatted for LLM context
  2. Check that `tool_result` chunks include necessary data
  3. Ensure LLM has sufficient context about executed tools
  4. Monitor assistant pipeline logs for integration issues

### Debugging Tools

**Enable Debug Logging**:

```bash
# Set debug level for NLWeb components
export LOG_LEVEL=DEBUG
export NLWEB_DEBUG=true
```

**Test Router Suggestions**:

```bash
# Use the demo script to test router functionality
python scripts/nlweb_demo.py --query "your test query"
```

**Check Tool Registry**:

```bash
# Verify tools are properly registered
curl http://localhost:7000/api/tools/list
```

**Monitor Server Logs**:

```bash
# Watch for NLWeb-related log messages
tail -f logs/app.log | grep -i nlweb
```

### Common Error Messages

- **"NLWeb router service not available"**: Router service failed to start or is disabled
- **"Tool suggestions rate-limited"**: Too many requests in short time period
- **"XML parsing failed"**: Invalid XML syntax in tools.xml
- **"External server unreachable"**: Cannot connect to NLWEB_BASE_URL
- **"Tool execution timeout"**: Tool took too long to complete
- **"Parameter validation failed"**: Extracted parameters don't match tool schema

### Performance Monitoring

Monitor these metrics to ensure optimal performance:

- **Router selection latency**: Should be <300ms (cached) or <1.5s (cold)
- **Tool execution success rate**: Should be ≥97%
- **Cache hit rate**: Should be >80% for common queries
- **Memory usage**: Monitor for memory leaks in router service
- **Error rates**: Should be <1% for production use

### Getting Help

If you encounter issues not covered in this guide:

1. Check the server logs for detailed error messages
2. Run the demo script to isolate the problem
3. Verify configuration with the troubleshooting tools above
4. Check the NLWeb project documentation for external server issues
5. Review recent changes to tools.xml or router configuration
