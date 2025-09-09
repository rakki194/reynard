# Unified WebSocket Configuration System

The Unified WebSocket Configuration System provides comprehensive configuration management for all WebSocket implementations in yipyap. It offers environment-based configuration with defaults, runtime configuration updates with hot-reloading, and extensive validation capabilities.

## Overview

The system consolidates configuration management across all WebSocket components:

- **WebSocketManager** - Main WebSocket management hub
- **WebSocketEngine** - Lazy loader communication engine
- **WebSocketAnalytics** - Performance monitoring and analytics
- **WebSocketEndpoint** - Standardized API endpoint patterns

## Features

### ✅ Environment-Based Configuration

- Automatic loading from environment variables
- Comprehensive default values
- Type conversion and validation
- Source tracking and metadata

### ✅ Runtime Configuration Updates

- Hot-reloading without application restart
- Real-time configuration changes
- Thread-safe operations
- Change notifications and webhooks

### ✅ Configuration Validation

- Built-in validation rules for all settings
- Range validation for numeric values
- Type validation for complex types
- Custom validation support

### ✅ Configuration Management

- Snapshot creation and rollback
- Import/export in JSON and YAML formats
- Configuration history and audit trail
- Health monitoring and alerts

## Architecture

### Core Components

#### WebSocketConfigurationManager

The central configuration management class that handles:

- Configuration storage and retrieval
- Environment variable loading
- File-based configuration
- Runtime updates and hot-reloading
- Validation and error tracking
- Snapshot management

#### UnifiedWebSocketConfig

A comprehensive dataclass containing all WebSocket configuration settings:

- Core WebSocket settings (connections, timeouts, etc.)
- Authentication and security settings
- Analytics and monitoring settings
- Performance optimization settings
- Development and debugging settings

#### Configuration API

REST API endpoints for configuration management:

- Configuration retrieval and updates
- Snapshot management
- Import/export functionality
- Health monitoring
- Validation status

## Configuration Settings

### Core WebSocket Settings

```python
# Connection management
max_connections: int = 100                    # Maximum concurrent connections
max_message_size: int = 1024 * 1024          # Maximum message size (1MB)
heartbeat_interval: float = 30.0              # Heartbeat interval in seconds
connection_timeout: float = 60.0              # Connection timeout in seconds
retry_attempts: int = 3                       # Number of retry attempts
retry_delay: float = 1.0                      # Delay between retries

# Performance settings
enable_compression: bool = True               # Enable message compression
enable_heartbeat: bool = True                 # Enable heartbeat mechanism
enable_metrics: bool = True                   # Enable performance metrics
enable_error_recovery: bool = True            # Enable error recovery
enable_rate_limiting: bool = True             # Enable rate limiting
rate_limit_messages_per_second: int = 100     # Rate limit per second
rate_limit_burst_size: int = 10               # Burst size for rate limiting
```

### Authentication Settings

```python
# Authentication configuration
enable_authentication: bool = True            # Enable authentication
authentication_timeout: float = 30.0          # Authentication timeout
require_authentication: bool = False          # Require authentication for all connections
```

### Connection Pooling Settings

```python
# Connection pooling
enable_connection_pooling: bool = True        # Enable connection pooling
pool_size: int = 50                           # Pool size
pool_cleanup_interval: float = 300.0          # Cleanup interval in seconds
```

### Circuit Breaker Settings

```python
# Circuit breaker configuration
enable_circuit_breaker: bool = True           # Enable circuit breaker
circuit_breaker_threshold: int = 5            # Failure threshold
circuit_breaker_timeout: float = 60.0         # Open timeout in seconds
circuit_breaker_reset_timeout: float = 300.0  # Reset timeout in seconds
```

### Message Routing Settings

```python
# Message routing and filtering
enable_message_routing: bool = True           # Enable message routing
enable_message_filtering: bool = True         # Enable message filtering
max_message_queue_size: int = 1000            # Maximum queue size
message_processing_workers: int = 4           # Number of processing workers
```

### Analytics Settings

```python
# Analytics and monitoring
enable_analytics: bool = True                 # Enable analytics
analytics_retention_hours: int = 24           # Data retention in hours
analytics_health_check_interval: float = 60.0 # Health check interval
analytics_metrics_update_interval: float = 30.0 # Metrics update interval
analytics_optimization_check_interval: float = 300.0 # Optimization check interval
analytics_max_event_history: int = 10000      # Maximum event history
analytics_max_health_history: int = 1000      # Maximum health history
analytics_max_optimization_suggestions: int = 100 # Maximum optimization suggestions
```

### Security Settings

```python
# Security configuration
enable_security: bool = True                  # Enable security features
enable_cors: bool = True                      # Enable CORS
allowed_origins: List[str] = ["*"]            # Allowed origins
enable_ip_filtering: bool = False             # Enable IP filtering
allowed_ips: List[str] = []                   # Allowed IP addresses
enable_ddos_protection: bool = True           # Enable DDoS protection
ddos_threshold: int = 1000                    # DDoS threshold
```

### Performance Settings

```python
# Performance optimization
enable_performance_optimization: bool = True  # Enable performance optimization
enable_message_batching: bool = True          # Enable message batching
batch_size: int = 10                          # Batch size
batch_timeout: float = 0.1                    # Batch timeout in seconds
enable_connection_multiplexing: bool = True   # Enable connection multiplexing
max_multiplexed_connections: int = 10         # Maximum multiplexed connections
```

### Monitoring Settings

```python
# Monitoring and alerting
enable_monitoring: bool = True                # Enable monitoring
monitoring_interval: float = 30.0             # Monitoring interval
enable_health_checks: bool = True             # Enable health checks
health_check_interval: float = 60.0           # Health check interval
enable_alerting: bool = True                  # Enable alerting
alert_threshold_error_rate: float = 5.0       # Error rate threshold
alert_threshold_response_time: float = 1.0    # Response time threshold
```

### Development Settings

```python
# Development and debugging
enable_debug_mode: bool = False               # Enable debug mode
enable_detailed_logging: bool = False         # Enable detailed logging
log_level: str = "INFO"                       # Log level
enable_profiling: bool = False                # Enable profiling
profiling_interval: float = 300.0             # Profiling interval
```

## Environment Variables

The system automatically loads configuration from environment variables with the `WEBSOCKET_` prefix:

### Core Settings

```bash
# Connection management
WEBSOCKET_MAX_CONNECTIONS=200
WEBSOCKET_MAX_MESSAGE_SIZE=2097152
WEBSOCKET_HEARTBEAT_INTERVAL=45.0
WEBSOCKET_CONNECTION_TIMEOUT=120.0
WEBSOCKET_RETRY_ATTEMPTS=5
WEBSOCKET_RETRY_DELAY=2.0

# Performance settings
WEBSOCKET_ENABLE_COMPRESSION=true
WEBSOCKET_ENABLE_HEARTBEAT=true
WEBSOCKET_ENABLE_METRICS=true
WEBSOCKET_ENABLE_ERROR_RECOVERY=true
WEBSOCKET_ENABLE_RATE_LIMITING=true
WEBSOCKET_RATE_LIMIT_MESSAGES_PER_SECOND=200
WEBSOCKET_RATE_LIMIT_BURST_SIZE=20
```

### Authentication Settings

```bash
# Authentication
WEBSOCKET_ENABLE_AUTHENTICATION=true
WEBSOCKET_AUTHENTICATION_TIMEOUT=60.0
WEBSOCKET_REQUIRE_AUTHENTICATION=false
```

### Connection Pooling Settings

```bash
# Connection pooling
WEBSOCKET_ENABLE_CONNECTION_POOLING=true
WEBSOCKET_POOL_SIZE=100
WEBSOCKET_POOL_CLEANUP_INTERVAL=600.0
```

### Circuit Breaker Settings

```bash
# Circuit breaker
WEBSOCKET_ENABLE_CIRCUIT_BREAKER=true
WEBSOCKET_CIRCUIT_BREAKER_THRESHOLD=10
WEBSOCKET_CIRCUIT_BREAKER_TIMEOUT=120.0
WEBSOCKET_CIRCUIT_BREAKER_RESET_TIMEOUT=600.0
```

### Message Routing Settings

```bash
# Message routing
WEBSOCKET_ENABLE_MESSAGE_ROUTING=true
WEBSOCKET_ENABLE_MESSAGE_FILTERING=true
WEBSOCKET_MAX_MESSAGE_QUEUE_SIZE=2000
WEBSOCKET_MESSAGE_PROCESSING_WORKERS=8
```

### Analytics Settings

```bash
# Analytics
WEBSOCKET_ENABLE_ANALYTICS=true
WEBSOCKET_ANALYTICS_RETENTION_HOURS=48
WEBSOCKET_ANALYTICS_HEALTH_CHECK_INTERVAL=120.0
WEBSOCKET_ANALYTICS_METRICS_UPDATE_INTERVAL=60.0
WEBSOCKET_ANALYTICS_OPTIMIZATION_CHECK_INTERVAL=600.0
WEBSOCKET_ANALYTICS_MAX_EVENT_HISTORY=20000
WEBSOCKET_ANALYTICS_MAX_HEALTH_HISTORY=2000
WEBSOCKET_ANALYTICS_MAX_OPTIMIZATION_SUGGESTIONS=200
```

### Security Settings

```bash
# Security
WEBSOCKET_ENABLE_SECURITY=true
WEBSOCKET_ENABLE_CORS=true
WEBSOCKET_ALLOWED_ORIGINS=http://localhost:3000,https://example.com
WEBSOCKET_ENABLE_IP_FILTERING=false
WEBSOCKET_ALLOWED_IPS=127.0.0.1,192.168.1.1
WEBSOCKET_ENABLE_DDOS_PROTECTION=true
WEBSOCKET_DDOS_THRESHOLD=2000
```

### Performance Settings

```bash
# Performance
WEBSOCKET_ENABLE_PERFORMANCE_OPTIMIZATION=true
WEBSOCKET_ENABLE_MESSAGE_BATCHING=true
WEBSOCKET_BATCH_SIZE=20
WEBSOCKET_BATCH_TIMEOUT=0.2
WEBSOCKET_ENABLE_CONNECTION_MULTIPLEXING=true
WEBSOCKET_MAX_MULTIPLEXED_CONNECTIONS=20
```

### Monitoring Settings

```bash
# Monitoring
WEBSOCKET_ENABLE_MONITORING=true
WEBSOCKET_MONITORING_INTERVAL=60.0
WEBSOCKET_ENABLE_HEALTH_CHECKS=true
WEBSOCKET_HEALTH_CHECK_INTERVAL=120.0
WEBSOCKET_ENABLE_ALERTING=true
WEBSOCKET_ALERT_THRESHOLD_ERROR_RATE=10.0
WEBSOCKET_ALERT_THRESHOLD_RESPONSE_TIME=2.0
```

### Development Settings

```bash
# Development
WEBSOCKET_ENABLE_DEBUG_MODE=false
WEBSOCKET_ENABLE_DETAILED_LOGGING=false
WEBSOCKET_LOG_LEVEL=INFO
WEBSOCKET_ENABLE_PROFILING=false
WEBSOCKET_PROFILING_INTERVAL=600.0
```

## Usage Examples

### Basic Configuration Management

```python
from app.utils.websocket_configuration import (
    get_websocket_config_manager,
    get_websocket_config,
    update_websocket_config
)

# Get the configuration manager
manager = get_websocket_config_manager()

# Get current configuration
config = get_websocket_config()
print(f"Max connections: {config.max_connections}")

# Update configuration
success = update_websocket_config(
    max_connections=200,
    heartbeat_interval=45.0,
    enable_analytics=True
)

# Get specific configuration value
max_conn = manager.get("max_connections")
print(f"Max connections: {max_conn}")
```

### WebSocket Manager Integration

```python
from app.utils.websocket_manager import WebSocketManager
from app.utils.websocket_configuration import get_websocket_config

# Create WebSocket manager with unified configuration
manager = WebSocketManager()  # Uses unified config automatically

# Get current configuration
config = manager.get_configuration()
print(f"Current max connections: {config.max_connections}")

# Update configuration at runtime
new_config = get_websocket_config()
new_config.max_connections = 300
success = await manager.update_configuration(new_config)

# Reload configuration from file
manager.reload_configuration()
```

### Configuration Validation

```python
from app.utils.websocket_configuration import get_websocket_config_manager

manager = get_websocket_config_manager()

# Set valid configuration
success = manager.set("max_connections", 500)
print(f"Valid configuration: {success}")  # True

# Set invalid configuration
success = manager.set("max_connections", 20000)
print(f"Invalid configuration: {success}")  # False

# Get validation status
config_with_metadata = manager.get_with_metadata()
for key, metadata in config_with_metadata.items():
    if not metadata["validated"]:
        print(f"Invalid {key}: {metadata['validation_errors']}")
```

### Snapshot Management

```python
from app.utils.websocket_configuration import get_websocket_config_manager

manager = get_websocket_config_manager()

# Create snapshot
snapshot_id = manager.create_snapshot("Production configuration")

# Make changes
manager.set("max_connections", 500)
manager.set("heartbeat_interval", 60.0)

# Rollback to snapshot
success = manager.rollback_to_snapshot(snapshot_id)

# Get all snapshots
snapshots = manager.get_snapshots()
for snapshot in snapshots:
    print(f"Snapshot {snapshot['snapshot_id']}: {snapshot['description']}")
```

### Configuration Import/Export

```python
from app.utils.websocket_configuration import get_websocket_config_manager

manager = get_websocket_config_manager()

# Export configuration
json_config = manager.export_configuration("json")
yaml_config = manager.export_configuration("yaml")

print("JSON Configuration:")
print(json_config)

print("YAML Configuration:")
print(yaml_config)

# Import configuration
success = manager.import_configuration(json_config, "json")
print(f"Import successful: {success}")
```

## API Reference

### WebSocketConfigurationManager

#### Constructor

```python
WebSocketConfigurationManager(config_file: Optional[str] = None)
```

Creates a new configuration manager instance.

**Parameters:**

- `config_file`: Optional path to configuration file (default: "websocket_config.json")

#### Methods

##### get(key: str, default: Any = None) -> Any

Get a configuration value.

**Parameters:**

- `key`: Configuration key
- `default`: Default value if key not found

**Returns:**

- Configuration value or default

##### set(key: str, value: Any, source: WebSocketConfigSource = WebSocketConfigSource.RUNTIME) -> bool

Set a configuration value.

**Parameters:**

- `key`: Configuration key
- `value`: Configuration value
- `source`: Source of the configuration value

**Returns:**

- True if successful, False otherwise

##### get_all() -> Dict[str, Any]

Get all configuration values.

**Returns:**

- Dictionary of all configuration values

##### get_with_metadata() -> Dict[str, Dict[str, Any]]

Get all configuration values with metadata.

**Returns:**

- Dictionary of configuration values with metadata

##### create_snapshot(description: str = "") -> str

Create a configuration snapshot.

**Parameters:**

- `description`: Snapshot description

**Returns:**

- Snapshot ID

##### rollback_to_snapshot(snapshot_id: str) -> bool

Rollback to a configuration snapshot.

**Parameters:**

- `snapshot_id`: Snapshot ID

**Returns:**

- True if successful, False otherwise

##### get_snapshots() -> List[Dict[str, Any]]

Get all configuration snapshots.

**Returns:**

- List of snapshot metadata

##### add_config_watcher(watcher: Callable) -> None

Add a configuration watcher.

**Parameters:**

- `watcher`: Callback function to call when configuration changes

##### remove_config_watcher(watcher: Callable) -> None

Remove a configuration watcher.

**Parameters:**

- `watcher`: Callback function to remove

##### export_configuration(format: str = "json") -> str

Export configuration in specified format.

**Parameters:**

- `format`: Export format ("json" or "yaml")

**Returns:**

- Exported configuration string

##### import_configuration(config_data: str, format: str = "json") -> bool

Import configuration from string.

**Parameters:**

- `config_data`: Configuration data string
- `format`: Import format ("json" or "yaml")

**Returns:**

- True if successful, False otherwise

##### get_configuration_summary() -> Dict[str, Any]

Get configuration summary statistics.

**Returns:**

- Configuration summary dictionary

### Global Functions

#### get_websocket_config_manager() -> WebSocketConfigurationManager

Get the global WebSocket configuration manager instance.

**Returns:**

- Global configuration manager

#### get_websocket_config() -> UnifiedWebSocketConfig

Get the current WebSocket configuration.

**Returns:**

- Current configuration object

#### update_websocket_config(\*\*kwargs) -> bool

Update WebSocket configuration values.

**Parameters:**

- `**kwargs`: Configuration key-value pairs

**Returns:**

- True if all updates successful, False otherwise

## REST API Endpoints

### Configuration Status

```http
GET /api/websocket-config/status
```

Get the current status of the WebSocket configuration system.

**Response:**

```json
{
  "total_values": 50,
  "validated_values": 48,
  "invalid_values": 2,
  "source_distribution": {
    "default": 45,
    "environment": 3,
    "runtime": 2
  },
  "snapshots_count": 5,
  "config_file": "/path/to/websocket_config.json",
  "last_modified": 1640995200.0
}
```

### Configuration Values

```http
GET /api/websocket-config/values
GET /api/websocket-config/values?include_metadata=true
```

Get all configuration values.

**Response:**

```json
{
  "success": true,
  "message": "Configuration values retrieved successfully",
  "data": {
    "values": {
      "max_connections": 100,
      "heartbeat_interval": 30.0,
      "enable_authentication": true
    }
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Update Configuration Value

```http
PUT /api/websocket-config/values/{key}
```

Update a specific configuration value.

**Request Body:**

```json
{
  "value": 200,
  "source": "runtime",
  "description": "Increased max connections for high load"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Configuration key 'max_connections' updated successfully",
  "data": {
    "key": "max_connections",
    "old_value": 100,
    "new_value": 200,
    "source": "runtime",
    "notification": {
      "key": "max_connections",
      "old_value": 100,
      "new_value": 200,
      "source": "runtime",
      "timestamp": "2024-01-15T10:30:00",
      "user_id": "user123",
      "description": "Increased max connections for high load"
    }
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Batch Update Configuration

```http
POST /api/websocket-config/values/batch
```

Update multiple configuration values in a batch.

**Request Body:**

```json
{
  "updates": {
    "max_connections": 200,
    "heartbeat_interval": 45.0,
    "enable_analytics": true
  },
  "source": "runtime",
  "description": "Performance optimization batch update"
}
```

### Configuration Snapshots

```http
POST /api/websocket-config/snapshots
```

Create a configuration snapshot.

**Request Body:**

```json
{
  "description": "Production configuration before update"
}
```

```http
GET /api/websocket-config/snapshots
```

Get all configuration snapshots.

```http
POST /api/websocket-config/snapshots/rollback
```

Rollback to a configuration snapshot.

**Request Body:**

```json
{
  "snapshot_id": "snapshot_1640995200",
  "description": "Emergency rollback due to performance issues"
}
```

### Configuration Import/Export

```http
POST /api/websocket-config/export
```

Export configuration in specified format.

**Request Body:**

```json
{
  "format": "json"
}
```

```http
POST /api/websocket-config/import
```

Import configuration from string.

**Request Body:**

```json
{
  "config_data": "{\"max_connections\": 200, \"heartbeat_interval\": 45.0}",
  "format": "json"
}
```

### Configuration Validation

```http
GET /api/websocket-config/validation
```

Get configuration validation status.

**Response:**

```json
{
  "success": true,
  "message": "Configuration validation status retrieved successfully",
  "data": {
    "validation_status": {
      "max_connections": {
        "validated": true,
        "validation_errors": []
      },
      "heartbeat_interval": {
        "validated": false,
        "validation_errors": ["Value 400.0 is above maximum 300.0"]
      }
    },
    "invalid_keys": ["heartbeat_interval"],
    "total_keys": 50,
    "valid_keys": 49,
    "invalid_count": 1
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Configuration Reset

```http
POST /api/websocket-config/reset
```

Reset configuration to default values.

**Response:**

```json
{
  "success": true,
  "message": "Configuration reset to defaults successfully",
  "data": {
    "reset_count": 50,
    "snapshot_id": "snapshot_1640995200",
    "previous_values": {
      "max_connections": 200,
      "heartbeat_interval": 45.0
    },
    "timestamp": "2024-01-15T10:30:00"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Configuration Health

```http
GET /api/websocket-config/health
```

Get configuration system health status.

**Response:**

```json
{
  "success": true,
  "message": "Configuration health check completed",
  "data": {
    "health_status": "healthy",
    "issues": [],
    "summary": {
      "total_values": 50,
      "validated_values": 50,
      "invalid_values": 0,
      "source_distribution": {
        "default": 45,
        "environment": 3,
        "runtime": 2
      },
      "snapshots_count": 5,
      "config_file": "/path/to/websocket_config.json",
      "last_modified": 1640995200.0
    },
    "timestamp": "2024-01-15T10:30:00"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

## Best Practices

### Configuration Management

1. **Use Environment Variables for Deployment**: Set configuration values through environment variables for different deployment environments.

2. **Create Snapshots Before Changes**: Always create snapshots before making significant configuration changes.

3. **Validate Configuration**: Use the validation endpoints to ensure configuration is correct before applying changes.

4. **Monitor Configuration Health**: Regularly check configuration health to identify issues.

### Performance Optimization

1. **Tune Connection Limits**: Adjust `max_connections` based on server capacity and expected load.

2. **Optimize Heartbeat Intervals**: Set appropriate heartbeat intervals to balance responsiveness and overhead.

3. **Enable Compression**: Use compression for large messages to reduce bandwidth usage.

4. **Configure Rate Limiting**: Set appropriate rate limits to prevent abuse while allowing legitimate traffic.

### Security Configuration

1. **Enable Authentication**: Use authentication for sensitive WebSocket endpoints.

2. **Configure CORS**: Set appropriate CORS policies for your deployment environment.

3. **Use IP Filtering**: Enable IP filtering for additional security in production environments.

4. **Enable DDoS Protection**: Configure DDoS protection thresholds based on expected traffic patterns.

### Monitoring and Analytics

1. **Enable Analytics**: Use analytics to monitor WebSocket performance and usage patterns.

2. **Set Alert Thresholds**: Configure alert thresholds to get notified of performance issues.

3. **Monitor Error Rates**: Track error rates and response times to identify problems.

4. **Use Health Checks**: Enable health checks to monitor system status.

### Development and Debugging

1. **Use Debug Mode**: Enable debug mode during development for detailed logging.

2. **Profile Performance**: Use profiling to identify performance bottlenecks.

3. **Test Configuration Changes**: Always test configuration changes in a development environment first.

4. **Document Configuration**: Document configuration changes and their rationale.

## Migration Guide

### From Legacy Configuration

The unified configuration system is backward compatible with existing WebSocket configurations:

```python
# Legacy configuration
from app.utils.websocket_manager import WebSocketConfig

legacy_config = WebSocketConfig(
    max_connections=100,
    heartbeat_interval=30.0
)

# Automatically converted to unified configuration
from app.utils.websocket_manager import WebSocketManager

manager = WebSocketManager(legacy_config)  # Automatic conversion
```

### Environment Variable Migration

Existing environment variables are automatically supported:

```bash
# Legacy environment variables (still supported)
WEBSOCKET_MAX_CONNECTIONS=100
WEBSOCKET_HEARTBEAT_INTERVAL=30.0

# New unified environment variables (recommended)
WEBSOCKET_MAX_CONNECTIONS=200
WEBSOCKET_HEARTBEAT_INTERVAL=45.0
WEBSOCKET_ENABLE_ANALYTICS=true
WEBSOCKET_ENABLE_SECURITY=true
```

### API Migration

The configuration API provides a unified interface for all WebSocket configuration:

```python
# Legacy approach (still supported)
manager = WebSocketManager(config=legacy_config)

# New unified approach (recommended)
from app.utils.websocket_configuration import get_websocket_config

config = get_websocket_config()
manager = WebSocketManager(config=config)
```

## Troubleshooting

### Common Issues

#### Configuration Not Loading

**Problem**: Configuration values are not being loaded from environment variables.

**Solution**: Ensure environment variables have the correct `WEBSOCKET_` prefix and are set before the application starts.

#### Validation Errors

**Problem**: Configuration validation is failing.

**Solution**: Check the validation endpoint to see specific error messages and adjust values accordingly.

#### Hot-Reloading Not Working

**Problem**: Configuration changes are not being detected automatically.

**Solution**: Ensure the configuration file exists and has proper permissions. Check that the file watcher is running.

#### Performance Issues

**Problem**: WebSocket performance is degraded after configuration changes.

**Solution**: Use snapshots to rollback to a known good configuration. Monitor performance metrics to identify the cause.

### Debug Mode

Enable debug mode for detailed logging:

```bash
export WEBSOCKET_ENABLE_DEBUG_MODE=true
export WEBSOCKET_ENABLE_DETAILED_LOGGING=true
export WEBSOCKET_LOG_LEVEL=DEBUG
```

### Health Monitoring

Use the health endpoint to monitor configuration system status:

```bash
curl http://localhost:7000/api/websocket-config/health
```

### Configuration Validation

Validate configuration before applying changes:

```bash
curl http://localhost:7000/api/websocket-config/validation
```

## Conclusion

The Unified WebSocket Configuration System provides a comprehensive, flexible, and robust solution for managing WebSocket configuration across all components of the yipyap application. With its environment-based configuration, runtime updates, validation, and monitoring capabilities, it ensures that WebSocket communication is optimized, secure, and maintainable.

For more information about specific WebSocket components, see:

- [WebSocket Manager Documentation](websocket-manager.md)
- [WebSocket Analytics Documentation](websocket-analytics.md)
- [WebSocket Endpoint Documentation](websocket-endpoint.md)
