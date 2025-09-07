# Embedding Model Management

This document provides comprehensive guidance for managing embedding models in the YipYap RAG system, including automatic unloading, memory optimization, configuration options, and operational best practices.

## Overview

The embedding model management system transforms the traditional "load once, keep forever" approach into a dynamic, memory-efficient model lifecycle management system. It automatically handles model loading, unloading, and memory optimization based on usage patterns, system resources, and configurable policies.

### Key Features

- **Automatic Model Unloading**: Models are automatically unloaded after configurable periods of inactivity
- **Memory Pressure Detection**: Proactive unloading when system memory usage is high
- **Usage Pattern Tracking**: Intelligent preloading based on usage patterns
- **Multi-Model Support**: Support for multiple CLIP variants and text embedding models
- **Health Monitoring**: Comprehensive health checks and metrics collection
- **API Management**: RESTful endpoints for manual model management

## Architecture

The embedding model management system consists of several interconnected components:

### Core Components

- **ModelUsageTracker**: Centralized tracking and automatic cleanup for all model types
- **ClipEmbeddingService**: Manages CLIP vision embedding models with automatic unloading
- **EmbeddingService**: Manages Ollama text embedding models with lifecycle tracking
- **VisionEmbeddingUnloader**: Specialized unloader for vision embedding services
- **Memory Pressure Monitor**: Monitors system memory and triggers proactive unloading

### Service Integration

The system integrates with existing services through well-defined interfaces:

- **Service Lifecycle**: Models are automatically unloaded during service shutdown
- **Health Checks**: Model loading status is included in service health reports
- **Metrics Collection**: Memory usage and performance metrics are tracked
- **Configuration Management**: Settings are managed through the configuration system

## Configuration

### Environment Variables

Embedding model management can be configured through environment variables:

```bash
# Enable/disable automatic model unloading
MODEL_USAGE_TRACKER_ENABLED=true

# Cleanup interval (seconds)
MODEL_USAGE_TRACKER_CLEANUP_INTERVAL=60

# Vision embedding model timeouts (seconds)
MODEL_USAGE_TRACKER_VISION_EMBEDDING_VRAM_TIMEOUT=600
MODEL_USAGE_TRACKER_VISION_EMBEDDING_RAM_TIMEOUT=1800

# Text embedding model timeouts (seconds)
MODEL_USAGE_TRACKER_EMBEDDING_MODEL_VRAM_TIMEOUT=600
MODEL_USAGE_TRACKER_EMBEDDING_MODEL_RAM_TIMEOUT=1800

# Memory pressure settings
LAZY_LOADING_UNLOADING_MEMORY_PRESSURE_THRESHOLD=0.8
LAZY_LOADING_UNLOADING_MEMORY_PRESSURE_TIMEOUT=60
```

### Configuration File

Settings can also be configured through the configuration file:

```json
{
  "model_usage_tracker_enabled": true,
  "model_usage_tracker_cleanup_interval": 60,
  "model_usage_tracker_vision_embedding_vram_timeout": 600,
  "model_usage_tracker_vision_embedding_ram_timeout": 1800,
  "model_usage_tracker_embedding_model_vram_timeout": 600,
  "model_usage_tracker_embedding_model_ram_timeout": 1800,
  "lazy_loading_unloading_memory_pressure_threshold": 0.8,
  "lazy_loading_unloading_memory_pressure_timeout": 60
}
```

### Timeout Configuration

Timeout settings control when models are automatically unloaded:

- **VRAM Timeout**: Time in seconds before unloading from GPU memory (default: 600 seconds)
- **RAM Timeout**: Time in seconds before unloading from system memory (default: 1800 seconds)
- **Memory Pressure Timeout**: Time in seconds before unloading under memory pressure (default: 60 seconds)

## API Reference

### Model Management Endpoints

#### Unload Models

```http
POST /api/rag/embedding/unload/{model_type}
```

Manually unload embedding models by type.

**Parameters:**

- `model_type`: Type of model to unload (`vision` or `text`)

**Response:**

```json
{
  "unloaded": true,
  "model_type": "vision",
  "message": "CLIP model unloaded successfully"
}
```

**Example:**

```bash
curl -X POST "http://localhost:7000/api/rag/embedding/unload/vision" \
  -H "Authorization: Bearer <token>"
```

#### Get Model Status

```http
GET /api/rag/embedding/status
```

Get the current status of all embedding models.

**Response:**

```json
{
  "vision_embeddings": {
    "loaded": true,
    "model_info": {
      "model_id": "ViT-L-14/openai",
      "dimension": 768,
      "metric": "cosine"
    },
    "memory_usage": {
      "vram_mb": 512,
      "ram_mb": 128
    },
    "memory_pressure_level": "normal",
    "last_used": 1640995200.0
  },
  "text_embeddings": {
    "mxbai-embed-large": {
      "loaded": true,
      "model_info": {
        "model_id": "mxbai-embed-large",
        "dimension": 1024,
        "metric": "cosine"
      },
      "memory_usage": {
        "ram_mb": 256
      },
      "last_used": 1640995200.0
    }
  },
  "memory_pressure": {
    "text_embeddings": "normal"
  },
  "tracker_status": {
    "clip_vision_embedding": {
      "model_type": "vision_embedding",
      "last_used": 1640995200.0,
      "usage_count": 42,
      "is_loaded": true,
      "vram_timeout": 600,
      "ram_timeout": 1800
    }
  }
}
```

#### Reload Models

```http
POST /api/rag/embedding/reload/{model_type}
```

Force reload a specific embedding model type.

**Parameters:**

- `model_type`: Type of model to reload (`vision` or `text`)

**Request Body:**

```json
{
  "model_id": "ViT-L-14/openai"
}
```

**Response:**

```json
{
  "success": true,
  "model_id": "ViT-L-14/openai",
  "message": "Model ViT-L-14/openai reloaded successfully"
}
```

#### Get Health Information

```http
GET /api/rag/embedding/health
```

Get detailed health information for embedding services.

**Response:**

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "clip_embedding_service": {
      "status": "healthy",
      "model_loaded": true,
      "memory_usage": {
        "vram_mb": 512,
        "ram_mb": 128
      },
      "last_used": 1640995200.0
    },
    "embedding_service": {
      "status": "healthy",
      "loaded_models": ["mxbai-embed-large"],
      "memory_usage": {
        "ram_mb": 256
      }
    }
  },
  "summary": {
    "total_services": 2,
    "healthy": 2,
    "degraded": 0,
    "unhealthy": 0
  }
}
```

### Vision Model Management

#### Switch Vision Model

```http
POST /api/rag/embedding/vision/switch/{model_id}
```

Switch to a different CLIP vision embedding model.

**Parameters:**

- `model_id`: ID of the model to switch to (e.g., `ViT-L-14/openai`)

**Response:**

```json
{
  "success": true,
  "model_id": "ViT-L-14/openai",
  "message": "Successfully switched to ViT-L-14/openai"
}
```

#### Unload Specific Vision Model

```http
POST /api/rag/embedding/vision/unload/{model_id}
```

Unload a specific CLIP vision embedding model.

**Parameters:**

- `model_id`: ID of the model to unload

**Response:**

```json
{
  "unloaded": true,
  "model_id": "ViT-L-14/openai",
  "message": "CLIP model ViT-L-14/openai unloaded successfully"
}
```

#### Get Vision Model Status

```http
GET /api/rag/embedding/vision/status
```

Get detailed status information for vision embedding models.

**Response:**

```json
{
  "current_model": {
    "model_id": "ViT-L-14/openai",
    "loaded": true,
    "memory_usage": {
      "vram_mb": 512,
      "ram_mb": 128
    }
  },
  "available_models": [
    {
      "model_id": "ViT-L-14/openai",
      "name": "ViT-L/14",
      "dimension": 768,
      "supported_features": ["image_embedding", "text_embedding"]
    }
  ]
}
```

## Model Types and Variants

### Vision Embedding Models (CLIP)

The system supports multiple CLIP model variants for vision embedding:

- **ViT-L-14/openai**: Default CLIP model with 768-dimensional embeddings
- **ViT-B-32/openai**: Smaller model with 512-dimensional embeddings
- **ViT-H-14/laion2b**: High-performance model with 1024-dimensional embeddings

### Text Embedding Models

Text embedding models are managed through the Ollama integration:

- **mxbai-embed-large**: 1024-dimensional embeddings (default)
- **bge-m3**: 1024-dimensional embeddings
- **nomic-embed-text**: 768-dimensional embeddings

## Memory Management

### Automatic Unloading

Models are automatically unloaded based on configurable timeouts:

1. **VRAM Timeout**: Models are unloaded from GPU memory after the specified timeout
2. **RAM Timeout**: Models are unloaded from system memory after the specified timeout
3. **Memory Pressure**: Models are proactively unloaded when system memory usage exceeds thresholds

### Memory Pressure Detection

The system monitors memory usage and automatically responds to pressure:

- **Threshold Monitoring**: Continuously monitors system memory usage
- **Proactive Unloading**: Unloads models when memory usage exceeds configurable thresholds
- **Priority-Based Unloading**: Unloads least recently used models first
- **Graceful Degradation**: Maintains system stability during memory pressure

### Memory Optimization Strategies

Several strategies are employed to optimize memory usage:

- **Lazy Loading**: Models are loaded only when first needed
- **Smart Preloading**: Frequently used models are preloaded during idle periods
- **Model Switching**: Automatic cleanup when switching between model variants
- **Resource Cleanup**: Proper cleanup of GPU and system resources

## Best Practices

### Configuration Best Practices

1. **Set Appropriate Timeouts**: Balance memory efficiency with user experience
   - VRAM timeouts: 5-15 minutes for most use cases
   - RAM timeouts: 15-60 minutes depending on system resources

2. **Monitor Memory Usage**: Use the health endpoints to monitor memory consumption
   - Set up alerts for high memory usage
   - Adjust timeouts based on observed patterns

3. **Configure Memory Pressure Thresholds**: Set thresholds based on system capabilities
   - Default: 80% memory usage
   - Adjust based on system stability requirements

### Operational Best Practices

1. **Regular Health Checks**: Monitor embedding service health regularly
   - Use the health endpoints to check service status
   - Monitor memory usage and model loading status

2. **Graceful Shutdown**: Ensure proper model unloading during service shutdown
   - Models are automatically unloaded during service shutdown
   - Monitor shutdown logs for any issues

3. **Performance Monitoring**: Track model loading and inference performance
   - Monitor loading times and memory consumption
   - Optimize timeouts based on performance patterns

### Development Best Practices

1. **Model Registration**: Register models with appropriate timeouts
   - Use the ModelUsageTracker to register new models
   - Set appropriate timeouts based on model characteristics

2. **Error Handling**: Implement proper error handling for model operations
   - Handle model loading failures gracefully
   - Implement fallback mechanisms for critical operations

3. **Testing**: Test model management functionality thoroughly
   - Test automatic unloading under various conditions
   - Verify memory cleanup and resource management

## Troubleshooting

### Common Issues

#### Models Not Unloading

**Symptoms:** Models remain loaded despite timeout settings

**Possible Causes:**

- ModelUsageTracker is disabled
- Incorrect timeout configuration
- Service integration issues

**Solutions:**

1. Check if `MODEL_USAGE_TRACKER_ENABLED=true`
2. Verify timeout settings in configuration
3. Check service logs for integration errors
4. Use manual unload endpoints to test functionality

#### Memory Pressure Not Detected

**Symptoms:** Models not unloading under memory pressure

**Possible Causes:**

- Memory pressure thresholds not configured
- Monitoring system not working properly
- Thresholds set too high

**Solutions:**

1. Verify memory pressure threshold configuration
2. Check system memory monitoring
3. Lower memory pressure thresholds if needed
4. Monitor system logs for pressure detection events

#### Model Loading Failures

**Symptoms:** Models fail to load or reload

**Possible Causes:**

- Insufficient system resources
- Model file corruption
- Service configuration issues

**Solutions:**

1. Check system resources (GPU memory, RAM)
2. Verify model files and dependencies
3. Check service configuration and logs
4. Try manual reload through API endpoints

#### Performance Degradation

**Symptoms:** Slow model loading or inference

**Possible Causes:**

- Frequent model loading/unloading
- Suboptimal timeout settings
- System resource constraints

**Solutions:**

1. Adjust timeout settings to reduce frequency
2. Monitor system resources and performance
3. Consider preloading frequently used models
4. Optimize model loading strategies

### Debugging Tools

#### Health Check Endpoints

Use the health check endpoints to diagnose issues:

```bash
# Check overall embedding service health
curl "http://localhost:7000/api/rag/embedding/health"

# Check specific model status
curl "http://localhost:7000/api/rag/embedding/status"
```

#### Log Monitoring

Monitor service logs for debugging information:

```bash
# Monitor embedding service logs
tail -f logs/embedding_service.log

# Monitor model usage tracker logs
tail -f logs/model_usage_tracker.log
```

#### Memory Monitoring

Use system tools to monitor memory usage:

```bash
# Monitor GPU memory usage
nvidia-smi -l 1

# Monitor system memory usage
free -h
```

### Performance Tuning

#### Optimizing Timeouts

Adjust timeouts based on usage patterns:

- **High-frequency usage**: Shorter timeouts for better memory efficiency
- **Low-frequency usage**: Longer timeouts for better user experience
- **Memory-constrained systems**: Shorter timeouts to prevent memory pressure

#### Memory Pressure Thresholds

Configure memory pressure thresholds based on system capabilities:

- **High-memory systems**: Higher thresholds (85-90%)
- **Low-memory systems**: Lower thresholds (70-80%)
- **Production systems**: Conservative thresholds for stability

## Integration with Other Systems

### Model Usage Tracker Integration

The embedding model management system integrates with the ModelUsageTracker:

- **Automatic Registration**: Models are automatically registered when loaded
- **Usage Tracking**: Usage patterns are tracked for optimization
- **Timeout Management**: Timeouts are managed centrally
- **Performance Metrics**: Loading times and memory usage are tracked

### Service Lifecycle Integration

Models are properly managed during service lifecycle events:

- **Service Startup**: Models are loaded on first use
- **Service Shutdown**: Models are automatically unloaded
- **Service Restart**: Model state is properly restored
- **Health Checks**: Model status is included in health reports

### Configuration Management Integration

Settings are managed through the configuration system:

- **Environment Variables**: Settings can be overridden via environment
- **Configuration Files**: Settings can be managed through config files
- **Runtime Updates**: Some settings can be updated at runtime
- **Validation**: Settings are validated for correctness

## Future Enhancements

### Planned Features

- **Predictive Loading**: Load models based on predicted usage patterns
- **Adaptive Timeouts**: Automatically adjust timeouts based on usage patterns
- **Model Compression**: Compress inactive models to save memory
- **Distributed Management**: Support for distributed model management

### Extension Points

The system is designed for extensibility:

- **New Model Types**: Easy addition of new embedding model types
- **Custom Unloading Strategies**: Support for custom unloading logic
- **External Integrations**: Integration with external monitoring systems
- **Plugin Architecture**: Plugin-based architecture for custom features

## References

- [RAG Documentation](rag.md): General RAG system documentation
- [Model Usage Tracker Documentation](model-usage-tracker.md): Model usage tracking system
- [Embeddings and Vector DB Documentation](embeddings-and-vector-db.md): Vector database operations
- [Memory Pressure Management Documentation](memory-pressure-management.md): Memory management strategies
