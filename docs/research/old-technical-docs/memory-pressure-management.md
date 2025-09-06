# Memory Pressure Management

This document describes the enhanced memory pressure management system that provides comprehensive monitoring, alerting, and automatic optimization of memory usage in the lazy loading system.

## Overview

The memory pressure management system monitors system memory usage in real-time and automatically takes action to prevent memory exhaustion. It includes:

- **System Memory Monitoring**: Real-time monitoring of RAM and swap usage
- **Memory Pressure Alerts**: Configurable alerts based on memory usage thresholds
- **Automatic Package Unloading**: Intelligent unloading of packages under memory pressure
- **Memory Optimization Suggestions**: Proactive recommendations for memory optimization

## System Memory Monitoring

### MemoryMonitor Class

The `MemoryMonitor` class provides comprehensive system memory monitoring capabilities:

```python
from app.utils.lazy_loader import MemoryMonitor

monitor = MemoryMonitor()

# Get comprehensive system memory information
system_info = monitor.get_system_memory_info()
print(f"Memory usage: {system_info['percent']:.1f}%")
print(f"Swap usage: {system_info['swap_percent']:.1f}%")
print(f"Available memory: {system_info['available'] / (1024**3):.1f}GB")
```

### System Memory Information

The `get_system_memory_info()` method returns detailed memory information:

```python
{
    "total": 8589934592,           # Total RAM in bytes
    "available": 2147483648,       # Available RAM in bytes
    "used": 6442450944,            # Used RAM in bytes
    "percent": 75.0,               # Memory usage percentage
    "swap_total": 2147483648,      # Total swap in bytes
    "swap_used": 1073741824,       # Used swap in bytes
    "swap_percent": 50.0,          # Swap usage percentage
    "swap_available": 1073741824,  # Available swap in bytes
    "memory_pressure_level": "medium",  # Current pressure level
    "timestamp": 1703123456.789    # Timestamp of measurement
}
```

## Memory Pressure Levels

The system defines four memory pressure levels:

- **Low**: < 50% memory usage
- **Medium**: 50-70% memory usage
- **High**: 70-85% memory usage
- **Critical**: > 85% memory usage

### Configurable Thresholds

Memory pressure thresholds can be customized:

```python
from app.utils.lazy_loader import get_lazy_loader

loader = get_lazy_loader()

# Set custom thresholds
thresholds = {
    "warning": 0.6,        # 60% - send warning
    "unload_packages": 0.8, # 80% - start unloading packages
    "aggressive_unload": 0.85, # 85% - aggressive unloading
    "emergency": 0.9,      # 90% - emergency measures
}

loader.set_memory_pressure_thresholds(thresholds)
```

## Memory Pressure Alerts

### Alert System

The system automatically generates alerts based on memory pressure conditions:

```python
from app.utils.lazy_loader import get_lazy_loader

loader = get_lazy_loader()

# Get current memory pressure alerts
alerts = loader.get_memory_pressure_alerts()

for alert in alerts:
    print(f"Level: {alert['level']}")
    print(f"Message: {alert['message']}")
    print(f"Recommendation: {alert['recommendation']}")
    print(f"Action Required: {alert['action_required']}")
```

### Alert Levels

- **Warning**: Memory usage approaching threshold
- **Medium**: Moderate memory pressure detected
- **High**: High memory pressure requiring action
- **Emergency**: Critical memory pressure requiring immediate action

### Alert Cooldown

Alerts include a cooldown period (default: 5 minutes) to prevent spam:

```python
from app.utils.lazy_loader import MemoryMonitor

monitor = MemoryMonitor()

# Enable/disable alerts
monitor.enable_memory_pressure_alerts(True)   # Enable alerts
monitor.enable_memory_pressure_alerts(False)  # Disable alerts
```

## Automatic Package Unloading

### Enhanced Unloading Logic

The system automatically unloads packages under memory pressure with different strategies:

#### Critical Pressure (≥ 95% memory usage)

- Unloads packages after 30 seconds of inactivity
- Maximum priority for unloading
- Overrides user preferences

#### High Pressure (≥ 85% memory usage)

- Unloads packages after half the normal timeout
- Increased unloading priority
- Overrides user preferences

#### Medium/Low Pressure

- Normal unloading behavior
- Respects user preferences
- Standard timeout periods

### Adaptive Unloading

The system adjusts unloading behavior based on memory pressure:

```python
# Under normal pressure: max 5 packages per cycle
# Under high pressure: max 7-8 packages per cycle  
# Under critical pressure: max 10 packages per cycle
```

## Memory Optimization Suggestions

### Intelligent Recommendations

The system provides proactive memory optimization suggestions:

```python
from app.utils.lazy_loader import get_lazy_loader

loader = get_lazy_loader()

# Get memory optimization suggestions
suggestions = loader.get_memory_optimization_suggestions()

for suggestion in suggestions:
    print(f"Type: {suggestion['type']}")
    print(f"Severity: {suggestion['severity']}")
    print(f"Message: {suggestion['message']}")
    print(f"Recommendation: {suggestion['recommendation']}")
    print(f"Priority: {suggestion['priority']}")
```

### Suggestion Types

#### System-Level Suggestions

- **emergency_memory_reduction**: Critical memory usage requiring immediate action
- **aggressive_package_unloading**: High memory usage requiring aggressive unloading
- **moderate_package_unloading**: Moderate memory usage requiring package unloading
- **swap_usage_high**: High swap usage indicating memory pressure
- **swap_usage_moderate**: Moderate swap usage requiring monitoring
- **memory_trend_increasing**: Memory usage trending upward
- **low_available_memory**: Low available memory requiring action

#### Package-Level Suggestions

- **high_memory_footprint**: Packages with large memory footprints
- **memory_leak**: Packages showing signs of memory leaks
- **increasing_memory_trend**: Packages with increasing memory usage

### Suggestion Priorities

Suggestions are prioritized by severity:

1. **Critical**: Immediate action required
2. **High**: Action required soon
3. **Medium**: Consider action
4. **Low**: Monitor and consider

## API Endpoints

### Memory Pressure Summary

**GET** `/api/packages/memory/pressure-summary`

Returns comprehensive memory pressure information.

**Response:**

```json
{
  "status": "success",
  "data": {
    "system_memory": {
      "total": 8589934592,
      "available": 2147483648,
      "used": 6442450944,
      "percent": 75.0,
      "swap_total": 2147483648,
      "swap_used": 1073741824,
      "swap_percent": 50.0,
      "memory_pressure_level": "medium",
      "timestamp": 1703123456.789
    },
    "current_alerts": [
      {
        "level": "medium",
        "message": "Moderate memory pressure: 75.0% memory usage",
        "usage_percent": 0.75,
        "timestamp": 1703123456.789,
        "recommendation": "Consider unloading unused packages",
        "action_required": false
      }
    ],
    "optimization_suggestions": [
      {
        "type": "moderate_package_unloading",
        "severity": "medium",
        "message": "Moderate memory usage detected",
        "recommendation": "Consider unloading unused packages",
        "value": 0.75,
        "priority": 3
      }
    ],
    "alert_history": [...],
    "memory_trend": "stable",
    "last_check": 1703123456.789,
    "alerts_enabled": true,
    "suggestions_enabled": true
  }
}
```

### Memory Pressure Alerts

**GET** `/api/packages/memory/pressure-alerts`

Returns current memory pressure alerts.

**Response:**

```json
{
  "status": "success",
  "data": {
    "alerts": [...],
    "total_alerts": 1,
    "critical_alerts": 0,
    "high_alerts": 0,
    "medium_alerts": 1,
    "warning_alerts": 0,
    "check_time": 1703123456.789
  }
}
```

### System Memory Information

**GET** `/api/packages/memory/system-info`

Returns detailed system memory information.

**Response:**

```json
{
  "status": "success",
  "data": {
    "total": 8589934592,
    "available": 2147483648,
    "used": 6442450944,
    "percent": 75.0,
    "swap_total": 2147483648,
    "swap_used": 1073741824,
    "swap_percent": 50.0,
    "swap_available": 1073741824,
    "memory_pressure_level": "medium",
    "timestamp": 1703123456.789
  }
}
```

### Set Memory Pressure Thresholds

**POST** `/api/packages/memory/pressure-thresholds`

Set custom memory pressure thresholds.

**Request:**

```json
{
  "warning": 0.6,
  "unload_packages": 0.8,
  "aggressive_unload": 0.85,
  "emergency": 0.9
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Memory pressure thresholds updated",
    "thresholds": {
      "warning": 0.6,
      "unload_packages": 0.8,
      "aggressive_unload": 0.85,
      "emergency": 0.9
    },
    "update_time": 1703123456.789
  }
}
```

### Toggle Memory Pressure Alerts

**POST** `/api/packages/memory/pressure-alerts/{enabled}`

Enable or disable memory pressure alerts.

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Memory pressure alerts enabled",
    "enabled": true,
    "update_time": 1703123456.789
  }
}
```

### Toggle Memory Optimization Suggestions

**POST** `/api/packages/memory/optimization-suggestions/{enabled}`

Enable or disable memory optimization suggestions.

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Memory optimization suggestions enabled",
    "enabled": true,
    "update_time": 1703123456.789
  }
}
```

## Configuration

### Environment Variables

Memory pressure management can be configured through environment variables:

```bash
# Memory pressure thresholds
LAZY_LOADING_UNLOADING_MEMORY_PRESSURE_THRESHOLD=0.8
LAZY_LOADING_UNLOADING_MEMORY_PRESSURE_TIMEOUT=60

# Enable/disable features
LAZY_LOADING_UNLOADING_ENABLE_MEMORY_PRESSURE_UNLOADING=true
LAZY_LOADING_UNLOADING_ENABLE_USAGE_PATTERN_UNLOADING=true
```

### Configuration File

Settings can also be configured in the application configuration:

```json
{
  "lazy_loading_unloading_memory_pressure_threshold": 0.8,
  "lazy_loading_unloading_memory_pressure_timeout": 60,
  "lazy_loading_unloading_enable_memory_pressure_unloading": true,
  "lazy_loading_unloading_enable_usage_pattern_unloading": true
}
```

## Usage Examples

### Basic Memory Monitoring

```python
from app.utils.lazy_loader import get_lazy_loader

loader = get_lazy_loader()

# Get memory pressure summary
summary = loader.get_memory_pressure_summary()

# Check for alerts
if summary["current_alerts"]:
    for alert in summary["current_alerts"]:
        print(f"Alert: {alert['message']}")
        if alert["action_required"]:
            print("Action required!")

# Get optimization suggestions
suggestions = loader.get_memory_optimization_suggestions()
for suggestion in suggestions:
    if suggestion["severity"] == "critical":
        print(f"Critical: {suggestion['message']}")
```

### Custom Threshold Configuration

```python
from app.utils.lazy_loader import get_lazy_loader

loader = get_lazy_loader()

# Set custom thresholds for your environment
custom_thresholds = {
    "warning": 0.7,        # 70% - more conservative
    "unload_packages": 0.85, # 85% - start unloading later
    "aggressive_unload": 0.9, # 90% - aggressive unloading later
    "emergency": 0.95,     # 95% - emergency measures later
}

loader.set_memory_pressure_thresholds(custom_thresholds)
```

### Memory Pressure Response

```python
from app.utils.lazy_loader import get_lazy_loader

loader = get_lazy_loader()

# Get current memory pressure
summary = loader.get_memory_pressure_summary()
pressure_level = summary["system_memory"]["memory_pressure_level"]

if pressure_level == "critical":
    # Force garbage collection
    gc_stats = loader.force_garbage_collection()
    print(f"Freed {gc_stats['memory_freed'] / (1024**2):.1f}MB")
    
    # Get urgent suggestions
    suggestions = loader.get_memory_optimization_suggestions()
    critical_suggestions = [s for s in suggestions if s["severity"] == "critical"]
    
    for suggestion in critical_suggestions:
        print(f"Critical action: {suggestion['recommendation']}")
```

## Best Practices

### Monitoring

1. **Regular Monitoring**: Check memory pressure summary regularly
2. **Alert Configuration**: Set appropriate thresholds for your environment
3. **Trend Analysis**: Monitor memory usage trends over time

### Optimization

1. **Proactive Unloading**: Use memory optimization suggestions proactively
2. **Threshold Tuning**: Adjust thresholds based on your workload
3. **Garbage Collection**: Use forced garbage collection when needed

### Troubleshooting

1. **High Memory Usage**: Check for memory leaks in packages
2. **Frequent Alerts**: Adjust thresholds or investigate memory growth
3. **Swap Usage**: Monitor swap usage to avoid thrashing

## Performance Impact

The memory pressure management system is designed to have minimal performance impact:

- **Monitoring Overhead**: < 1ms per check
- **Alert Generation**: < 0.1ms per alert
- **Suggestion Generation**: < 1ms per suggestion
- **Memory Footprint**: < 1MB additional memory usage

## Integration with Existing Systems

The memory pressure management system integrates seamlessly with:

- **Package Unloading System**: Enhanced unloading based on memory pressure
- **Memory Tracking**: Leverages existing memory metrics
- **Configuration System**: Uses existing configuration infrastructure
- **API Framework**: Extends existing API endpoints
- **Logging System**: Integrates with existing logging infrastructure

## Future Enhancements

Planned enhancements include:

- **Machine Learning**: Predictive memory pressure detection
- **Advanced Analytics**: Detailed memory usage analytics
- **Integration**: Integration with external monitoring systems
- **Custom Actions**: User-defined actions for memory pressure events
- **Historical Analysis**: Long-term memory usage trend analysis
