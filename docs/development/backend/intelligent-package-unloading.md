# Intelligent Package Unloading System

The Intelligent Package Unloading System is a comprehensive solution for managing memory usage in the lazy loading system by automatically unloading packages based on various criteria including memory pressure, usage patterns, user preferences, and system resources.

## Overview

The system provides intelligent, adaptive package unloading that balances memory efficiency with application performance. It automatically monitors package usage and memory pressure to make informed decisions about when to unload packages from memory.

## Features

### Core Functionality

- **Memory Pressure Unloading**: Automatically unloads packages when system memory pressure is high
- **Usage Pattern Unloading**: Unloads packages based on inactivity timeouts
- **User Preference Control**: Allows users to prevent specific packages from being unloaded
- **Adaptive Unloading**: Adjusts unloading behavior based on system resources
- **Performance Impact Analysis**: Tracks and analyzes the impact of unloading operations

### Unloading Strategies

The system supports three configurable unloading strategies:

#### AGGRESSIVE

- **Timeout**: 5 minutes of inactivity
- **Use Case**: Memory-constrained environments
- **Behavior**: Quickly frees memory but may require frequent reloading

#### BALANCED (Default)

- **Timeout**: 15 minutes of inactivity
- **Use Case**: General purpose environments
- **Behavior**: Balanced approach between memory efficiency and performance

#### CONSERVATIVE

- **Timeout**: 30 minutes of inactivity
- **Use Case**: Performance-critical environments
- **Behavior**: Keeps packages loaded longer to minimize reload overhead

## Configuration

### App Configuration Settings

The system can be configured through the application configuration with the following settings:

```python
# Enable/disable the unloading system
lazy_loading_unloading_enabled: bool = True

# Default unloading strategy
lazy_loading_unloading_strategy: str = "BALANCED"  # AGGRESSIVE, BALANCED, CONSERVATIVE

# Check interval for unloading decisions (seconds)
lazy_loading_unloading_check_interval: int = 60

# Timeout values for each strategy (seconds)
lazy_loading_unloading_aggressive_timeout: int = 300   # 5 minutes
lazy_loading_unloading_balanced_timeout: int = 900     # 15 minutes
lazy_loading_unloading_conservative_timeout: int = 1800 # 30 minutes

# Memory pressure settings
lazy_loading_unloading_memory_pressure_threshold: float = 0.8  # 80% memory usage
lazy_loading_unloading_memory_pressure_timeout: int = 60       # 1 minute under pressure

# Feature toggles
lazy_loading_unloading_enable_memory_pressure_unloading: bool = True
lazy_loading_unloading_enable_usage_pattern_unloading: bool = True
lazy_loading_unloading_enable_user_preference_unloading: bool = True
lazy_loading_unloading_enable_adaptive_unloading: bool = True

# Performance tracking
lazy_loading_unloading_performance_impact_tracking: bool = True

# Limits
lazy_loading_unloading_max_unloads_per_cycle: int = 5  # Max packages per cycle
lazy_loading_unloading_min_memory_savings_threshold: int = 1024 * 1024  # 1MB minimum
```

## API Endpoints

### Status and Metrics

#### GET `/api/package-unloading/status`

Get the current status of the unloading system.

**Response:**

```json
{
  "enabled": true,
  "check_interval": 60.0,
  "current_strategy": "balanced",
  "memory_pressure_threshold": 0.8,
  "max_unloads_per_cycle": 5,
  "min_memory_savings_threshold": 1048576
}
```

#### GET `/api/package-unloading/metrics`

Get comprehensive unloading metrics.

**Response:**

```json
{
  "total_unloads": 25,
  "successful_unloads": 23,
  "failed_unloads": 2,
  "total_memory_freed": 52428800,
  "average_memory_freed_per_unload": 2097152,
  "total_unload_time": 12.5,
  "average_unload_time": 0.5,
  "unload_success_rate": 0.92,
  "last_unload_time": 1640995200.0,
  "unload_reasons": {
    "Memory pressure unloading (high)": 10,
    "Usage pattern unloading (balanced)": 15
  },
  "performance_impact_score": 0.85,
  "memory_pressure_unloads": 10,
  "usage_pattern_unloads": 15,
  "user_preference_unloads": 0,
  "adaptive_unloads": 0
}
```

#### GET `/api/package-unloading/performance-impact`

Get performance impact analysis and recommendations.

**Response:**

```json
{
  "total_packages": 50,
  "loaded_packages": 35,
  "unloaded_packages": 15,
  "total_memory_freed_mb": 50.0,
  "average_memory_per_package_mb": 2.0,
  "total_unload_time_seconds": 12.5,
  "average_unload_time_seconds": 0.5,
  "memory_efficiency": 0.5,
  "time_efficiency": 0.97,
  "success_efficiency": 0.92,
  "performance_impact_score": 0.85,
  "recommendations": [
    {
      "type": "info",
      "message": "High unload frequency detected",
      "suggestion": "Consider using more conservative unloading strategy",
      "priority": "medium"
    }
  ]
}
```

### Package Management

#### GET `/api/package-unloading/packages`

Get unloading information for all packages.

**Response:**

```json
{
  "packages": {
    "torch": {
      "name": "torch",
      "is_loaded": true,
      "unloading_strategy": "balanced",
      "user_preference_unload": null,
      "last_used": 1640995200.0,
      "unload_attempt_count": 2,
      "unload_failure_count": 0,
      "unloading_metrics": {
        "total_unloads": 2,
        "successful_unloads": 2,
        "failed_unloads": 0,
        "total_memory_freed": 10485760,
        "average_memory_freed_per_unload": 5242880,
        "unload_success_rate": 1.0,
        "last_unload_time": 1640995200.0
      }
    }
  },
  "total_packages": 50,
  "loaded_packages": 35
}
```

#### PUT `/api/package-unloading/packages/{package_name}/strategy`

Set the unloading strategy for a specific package.

**Request:**

```json
{
  "strategy": "aggressive"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully set unloading strategy for package 'torch' to aggressive",
  "data": {
    "package_name": "torch",
    "strategy": "aggressive"
  }
}
```

#### PUT `/api/package-unloading/packages/{package_name}/user-preference`

Set user preference for package unloading.

**Request:**

```json
{
  "allow_unload": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully set user preference for package 'torch' unloading to false",
  "data": {
    "package_name": "torch",
    "allow_unload": false
  }
}
```

#### POST `/api/package-unloading/packages/{package_name}/unload`

Manually unload a specific package.

**Response:**

```json
{
  "success": true,
  "message": "Successfully unloaded package 'torch'",
  "data": {
    "package_name": "torch",
    "was_loaded": true
  }
}
```

### System Operations

#### POST `/api/package-unloading/force-garbage-collection`

Force garbage collection and return memory statistics.

**Response:**

```json
{
  "memory_before": 1073741824,
  "memory_after": 1048576000,
  "memory_freed": 25165824,
  "objects_collected": 150,
  "garbage_collection_time": 1640995200.0
}
```

## Decision Logic

### Unloading Decision Factors

The system evaluates multiple factors when deciding whether to unload a package:

1. **User Preference Override**: If user explicitly prevents unloading, package is kept loaded
2. **Memory Pressure**: Under high/critical memory pressure, packages are unloaded after a short timeout
3. **Usage Pattern**: Packages are unloaded after exceeding their strategy's timeout
4. **Memory Savings**: Packages with insufficient memory footprint are not unloaded
5. **Priority Score**: Higher priority packages are unloaded first when multiple candidates exist

### Priority Scoring

Packages are scored based on:

- **Memory Pressure**: 1.0 (highest priority)
- **Usage Pattern**: 0.8 (medium priority)
- **Memory Savings**: 0.0 (no priority if insufficient)

### Memory Pressure Levels

- **Low**: < 50% memory usage
- **Medium**: 50-70% memory usage
- **High**: 70-85% memory usage
- **Critical**: > 85% memory usage

## Performance Monitoring

### Metrics Tracked

- **Unload Counts**: Total, successful, and failed unloads
- **Memory Efficiency**: Total and average memory freed
- **Time Efficiency**: Total and average unload times
- **Success Rate**: Percentage of successful unloads
- **Reason Analysis**: Breakdown of unload reasons
- **Performance Impact**: Overall system impact score

### Recommendations

The system provides automatic recommendations based on:

- **Low Success Rate**: Suggests reviewing dependencies and unload order
- **Low Memory Savings**: Suggests adjusting minimum savings threshold
- **High Frequency**: Suggests using more conservative strategy

## Usage Examples

### Basic Usage

```python
from app.utils.lazy_loader import get_lazy_loader, UnloadingStrategy

# Get the lazy loader instance
loader = get_lazy_loader()

# Set unloading strategy for a package
loader.set_unloading_strategy("torch", UnloadingStrategy.AGGRESSIVE)

# Set user preference to prevent unloading
loader.set_user_preference_unload("critical_package", False)

# Get unloading metrics
metrics = loader.get_unloading_metrics()
print(f"Total memory freed: {metrics['total_memory_freed'] / (1024*1024):.2f}MB")

# Get performance analysis
analysis = loader.get_unloading_performance_impact_analysis()
print(f"Performance impact score: {analysis['performance_impact_score']:.2f}")
```

### API Usage

```python
import requests

# Get unloading status
response = requests.get("/api/package-unloading/status")
status = response.json()
print(f"System enabled: {status['enabled']}")

# Set package strategy
response = requests.put("/api/package-unloading/packages/torch/strategy",
                       json={"strategy": "aggressive"})
result = response.json()
print(f"Strategy set: {result['success']}")

# Get performance analysis
response = requests.get("/api/package-unloading/performance-impact")
analysis = response.json()
for rec in analysis['recommendations']:
    print(f"Recommendation: {rec['message']}")
```

## Integration with Existing Systems

### Lazy Loading Integration

The unloading system integrates seamlessly with the existing lazy loading system:

- Automatically starts when lazy loading is initialized
- Respects package loading states and dependencies
- Updates package status when unloaded
- Maintains compatibility with existing APIs

### Memory Monitoring Integration

Uses the existing memory monitoring system:

- Leverages memory pressure detection
- Utilizes memory footprint calculations
- Integrates with memory leak detection
- Shares memory statistics and trends

### Configuration Integration

Integrates with the application configuration system:

- Loads settings from AppConfig
- Supports environment variable overrides
- Provides runtime configuration updates
- Maintains configuration persistence

## Best Practices

### Strategy Selection

- **AGGRESSIVE**: Use in memory-constrained environments or when memory is critical
- **BALANCED**: Default choice for most applications
- **CONSERVATIVE**: Use when performance is critical and memory is abundant

### User Preferences

- Set `user_preference_unload=False` for frequently used packages
- Set `user_preference_unload=True` for rarely used packages
- Use sparingly to allow the system to optimize automatically

### Monitoring

- Regularly check performance impact analysis
- Monitor unload success rates
- Review recommendations and adjust settings accordingly
- Track memory efficiency over time

### Configuration

- Start with default settings and adjust based on usage patterns
- Monitor system performance after configuration changes
- Use conservative settings in production environments
- Test different strategies in development environments

## Troubleshooting

### Common Issues

1. **High Unload Failure Rate**
   - Check package dependencies
   - Review unload order
   - Verify memory availability

2. **Low Memory Savings**
   - Adjust minimum savings threshold
   - Review package memory footprints
   - Consider different unloading strategies

3. **Performance Degradation**
   - Switch to more conservative strategy
   - Increase unload timeouts
   - Set user preferences for critical packages

### Debug Information

Enable debug logging to get detailed information about unloading decisions:

```python
import logging
logging.getLogger("uvicorn").setLevel(logging.DEBUG)
```

The system logs:

- Unloading decisions and reasons
- Memory pressure levels
- Package status changes
- Performance metrics updates
- Configuration changes

## Future Enhancements

### Planned Features

- **Machine Learning Optimization**: Use ML to predict optimal unloading times
- **Predictive Loading**: Pre-load packages based on usage patterns
- **Cross-Process Coordination**: Coordinate unloading across multiple processes
- **Advanced Analytics**: More sophisticated performance analysis and recommendations
- **Custom Strategies**: User-defined unloading strategies
- **Integration APIs**: APIs for third-party monitoring and control tools

### Performance Improvements

- **Parallel Unloading**: Unload multiple packages simultaneously
- **Incremental Unloading**: Partial package unloading for large packages
- **Smart Caching**: Intelligent caching of frequently used package components
- **Memory Pooling**: Shared memory pools for similar packages

## Conclusion

The Intelligent Package Unloading System provides a robust, configurable solution for managing memory usage in the lazy loading system. It balances memory efficiency with application performance through intelligent decision-making and comprehensive monitoring capabilities.

The system is designed to be:

- **Automatic**: Requires minimal manual intervention
- **Configurable**: Adaptable to different environments and requirements
- **Transparent**: Provides comprehensive monitoring and analysis
- **Efficient**: Optimizes memory usage without impacting performance
- **Reliable**: Handles edge cases and provides fallback mechanisms

By implementing this system, applications can achieve better memory efficiency while maintaining optimal performance and user experience.
