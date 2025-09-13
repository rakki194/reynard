# Runtime Configuration Management

The Runtime Configuration Management system provides comprehensive dynamic configuration management for
the lazy loading system, including real-time updates, validation, rollback mechanisms, and change notifications.

## Overview

The system consists of two main components:

1. **Configuration Engine** (`app/utils/configuration_engine.py`) - Core configuration management logic
2. **Configuration API** (`app/api/lazy_loading_config.py`) - REST API endpoints for configuration management

## Features

### ✅ Dynamic Configuration Updates

- Real-time configuration value updates without application restart
- Support for multiple configuration sources (default, environment, config file, runtime, service)
- Thread-safe configuration operations
- Batch configuration updates

### ✅ Configuration Validation and Testing

- Built-in validation rules for common configuration types
- Custom validation rule support
- Validation error reporting and handling
- Pre-validation testing without applying changes

### ✅ Configuration Rollback Mechanisms

- Snapshot-based rollback system
- Automatic snapshot cleanup
- Snapshot metadata and tagging
- Rollback to any previous configuration state

### ✅ Configuration Change Notifications

- Real-time change tracking
- User attribution for changes
- Change history and audit trail
- Notification system for configuration events

## API Endpoints

### Configuration Status

```http
GET /api/lazy-loading-config/status
```

Returns the current status of the configuration system including summary statistics.

### Configuration Values

```http
GET /api/lazy-loading-config/values
GET /api/lazy-loading-config/values/{key}
```

Retrieve configuration values (all or specific key).

### Update Configuration

```http
PUT /api/lazy-loading-config/values/{key}
```

Update a single configuration value.

**Request Body:**

```json
{
  "key": "lazy_loading_unloading_check_interval",
  "value": 30.0,
  "source": "runtime",
  "description": "Reduced check interval for faster response"
}
```

### Batch Updates

```http
POST /api/lazy-loading-config/values/batch
```

Update multiple configuration values in a single operation.

**Request Body:**

```json
{
  "updates": [
    {
      "key": "lazy_loading_unloading_enabled",
      "value": true,
      "source": "runtime",
      "description": "Enable unloading system"
    },
    {
      "key": "lazy_loading_unloading_strategy",
      "value": "BALANCED",
      "source": "runtime",
      "description": "Set balanced unloading strategy"
    }
  ],
  "create_snapshot": true,
  "snapshot_description": "Batch configuration update"
}
```

### Validation

```http
POST /api/lazy-loading-config/validate
```

Validate a configuration value without applying it.

**Request Body:**

```json
{
  "key": "lazy_loading_unloading_memory_pressure_threshold",
  "value": 0.8
}
```

### Snapshots

```http
POST /api/lazy-loading-config/snapshots
GET /api/lazy-loading-config/snapshots
POST /api/lazy-loading-config/snapshots/{snapshot_id}/rollback
DELETE /api/lazy-loading-config/snapshots/{snapshot_id}
```

Manage configuration snapshots for rollback functionality.

### Notifications

```http
GET /api/lazy-loading-config/notifications
```

Retrieve configuration change notifications.

### Reset and Import/Export

```http
POST /api/lazy-loading-config/reset
POST /api/lazy-loading-config/export
POST /api/lazy-loading-config/import
```

Reset configuration to defaults, export configuration, or import configuration.

## Configuration Keys

### Unloading Configuration

- `lazy_loading_unloading_enabled` - Enable/disable the unloading system
- `lazy_loading_unloading_check_interval` - Interval between unloading checks (seconds)
- `lazy_loading_unloading_strategy` - Unloading strategy (AGGRESSIVE, BALANCED, CONSERVATIVE)
- `lazy_loading_unloading_aggressive_timeout` - Timeout for aggressive strategy (seconds)
- `lazy_loading_unloading_balanced_timeout` - Timeout for balanced strategy (seconds)
- `lazy_loading_unloading_conservative_timeout` - Timeout for conservative strategy (seconds)
- `lazy_loading_unloading_memory_pressure_threshold` - Memory pressure threshold (0.0-1.0)
- `lazy_loading_unloading_memory_pressure_timeout` - Memory pressure timeout (seconds)
- `lazy_loading_unloading_max_unloads_per_cycle` - Maximum packages to unload per cycle
- `lazy_loading_unloading_min_memory_savings_threshold` - Minimum memory savings threshold (bytes)

### Reloading Configuration

- `package_reloading_enabled` - Enable/disable package reloading
- `smart_reloading_enabled` - Enable/disable smart reloading
- `reloading_check_interval` - Interval between reloading checks (seconds)
- `max_reloads_per_cycle` - Maximum packages to reload per cycle
- `reloading_performance_threshold` - Performance threshold for reloading

### Memory Management

- `memory_pressure_threshold` - Global memory pressure threshold (0.0-1.0)
- `memory_optimization_enabled` - Enable/disable memory optimization
- `memory_cleanup_interval` - Memory cleanup interval (seconds)

### Performance Settings

- `max_concurrent_loads` - Maximum concurrent package loads
- `load_timeout` - Package load timeout (seconds)
- `cache_enabled` - Enable/disable caching
- `cache_size_limit` - Cache size limit (bytes)

### Analytics and Monitoring

- `analytics_enabled` - Enable/disable analytics
- `performance_monitoring_enabled` - Enable/disable performance monitoring
- `metrics_collection_interval` - Metrics collection interval (seconds)

## Usage Examples

### Python API Usage

```python
from app.utils.configuration_engine import get_configuration_engine

# Get the configuration engine
engine = get_configuration_engine()

# Set a configuration value
success = engine.set("lazy_loading_unloading_check_interval", 30.0)
if success:
    print("Configuration updated successfully")

# Get a configuration value
value = engine.get("lazy_loading_unloading_check_interval")
print(f"Check interval: {value}")

# Create a snapshot
snapshot_id = engine.create_snapshot("Before performance tuning")

# Update multiple values
updates = {
    "lazy_loading_unloading_strategy": "AGGRESSIVE",
    "lazy_loading_unloading_check_interval": 15.0
}
results = engine.update(updates)

# Rollback if needed
engine.rollback_to_snapshot(snapshot_id)
```

### REST API Usage

```bash
# Get configuration status
curl -X GET "http://localhost:7000/api/lazy-loading-config/status" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update configuration
curl -X PUT "http://localhost:7000/api/lazy-loading-config/values/lazy_loading_unloading_check_interval" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "lazy_loading_unloading_check_interval",
    "value": 30.0,
    "source": "runtime",
    "description": "Optimized check interval"
  }'

# Create snapshot
curl -X POST "http://localhost:7000/api/lazy-loading-config/snapshots" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Before major configuration changes",
    "tags": ["backup", "major-changes"]
  }'

# Get notifications
curl -X GET "http://localhost:7000/api/lazy-loading-config/notifications?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Validation Rules

The system includes built-in validation rules for common configuration types:

### Numeric Validation

- Positive integers for counts and limits
- Positive floats for intervals and thresholds
- Range validation for percentages (0.0-1.0)

### String Validation

- Non-empty strings for required text fields
- Enum validation for strategy selections

### Custom Validation

You can add custom validation rules:

```python
from app.utils.configuration_engine import ConfigurationValidationRule

# Create custom validation rule
rule = ConfigurationValidationRule(
    key="custom_setting",
    validator=lambda x: isinstance(x, str) and len(x) > 0,
    error_message="Custom setting must be a non-empty string",
    required=True,
    default_value="default"
)

# Add the rule
engine.add_validation_rule(rule)
```

## Best Practices

### 1. Always Create Snapshots Before Major Changes

```python
# Create snapshot before making changes
snapshot_id = engine.create_snapshot("Before performance optimization")

try:
    # Make configuration changes
    engine.set("lazy_loading_unloading_strategy", "AGGRESSIVE")
    engine.set("lazy_loading_unloading_check_interval", 15.0)

    # Test the changes
    # ... perform testing ...

except Exception as e:
    # Rollback on error
    engine.rollback_to_snapshot(snapshot_id)
    raise e
```

### 2. Use Batch Updates for Multiple Changes

```python
# Use batch updates for multiple related changes
updates = {
    "lazy_loading_unloading_enabled": True,
    "lazy_loading_unloading_strategy": "BALANCED",
    "lazy_loading_unloading_check_interval": 60.0
}

# Create snapshot and apply updates
snapshot_id = engine.create_snapshot("Enable unloading system")
results = engine.update(updates)

# Check results
if all(results.values()):
    print("All updates successful")
else:
    # Rollback on failure
    engine.rollback_to_snapshot(snapshot_id)
```

### 3. Validate Configuration Before Applying

```python
# Validate configuration before applying
validation_data = {
    "key": "lazy_loading_unloading_memory_pressure_threshold",
    "value": 0.9
}

# Use the validation endpoint
response = requests.post(
    "http://localhost:7000/api/lazy-loading-config/validate",
    json=validation_data,
    headers={"Authorization": f"Bearer {token}"}
)

if response.json()["is_valid"]:
    # Apply the configuration
    engine.set(validation_data["key"], validation_data["value"])
else:
    print("Validation failed:", response.json()["validation_errors"])
```

### 4. Monitor Configuration Changes

```python
# Get recent configuration changes
response = requests.get(
    "http://localhost:7000/api/lazy-loading-config/notifications?limit=20",
    headers={"Authorization": f"Bearer {token}"}
)

notifications = response.json()["notifications"]
for notification in notifications:
    print(f"{notification['timestamp']}: {notification['key']} = {notification['new_value']}")
```

## Error Handling

The system provides comprehensive error handling:

### Validation Errors

- Invalid values are rejected with detailed error messages
- Default values are applied when validation fails
- Validation errors are logged and tracked

### Rollback Errors

- Invalid snapshot IDs return appropriate error responses
- Rollback failures are logged with details
- Automatic cleanup of invalid snapshots

### API Errors

- Authentication and authorization errors (401/403)
- Not found errors for invalid keys or snapshots (404)
- Validation errors with detailed messages (400)
- Internal server errors with logging (500)

## Monitoring and Debugging

### Configuration Summary

```python
# Get comprehensive configuration summary
summary = engine.get_configuration_summary()
print(f"Total values: {summary['total_values']}")
print(f"Sources: {summary['sources']}")
print(f"Validation status: {summary['validation_status']}")
```

### Validation Status

```python
# Check for validation errors
errors = engine.validate_configuration()
if errors:
    print("Configuration validation errors:")
    for key, error_list in errors.items():
        print(f"  {key}: {error_list}")
```

### Snapshot Management

```python
# List all snapshots
snapshots = engine.list_snapshots()
for snapshot in snapshots:
    print(f"{snapshot['id']}: {snapshot['description']} ({snapshot['timestamp']})")
```

## Integration with Service Management

The configuration engine integrates with the service management system:

```python
# Integrate with service manager
engine.integrate_with_service_manager()

# Configuration values from services are automatically loaded
# and synchronized with the configuration engine
```

## Performance Considerations

- Configuration operations are thread-safe using RLock
- Snapshots are automatically cleaned up to prevent memory leaks
- Validation is performed efficiently with cached rules
- API responses are optimized for minimal latency

## Security

- All API endpoints require authentication
- Configuration changes are attributed to users
- Sensitive configuration values are not exposed in summaries
- Validation prevents malicious configuration values

## Future Enhancements

Planned enhancements for the runtime configuration management system:

1. **WebSocket Notifications** - Real-time configuration change notifications
2. **Configuration Templates** - Predefined configuration templates for common scenarios
3. **A/B Testing** - Configuration A/B testing capabilities
4. **Configuration Analytics** - Usage analytics for configuration changes
5. **Configuration Migration** - Automated configuration migration tools
6. **Configuration Backup/Restore** - Automated backup and restore functionality
