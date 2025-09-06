# Vision Embedding Framework

The Vision Embedding Framework provides a unified interface for managing vision embedding services with automatic memory management, model unloading, and service lifecycle handling. This framework enables easy integration of new vision embedding services while maintaining consistent behavior across all implementations.

## Overview

The framework consists of three main components:

1. **VisionEmbeddingService** - Base class for all vision embedding services
2. **VisionEmbeddingRegistry** - Service registry for discovery and management
3. **VisionEmbeddingUnloader** - Unified unloading interface for memory management

## Architecture

```
VisionEmbeddingService (Base Class)
├── Model Management
│   ├── Loading/Unloading
│   ├── Multi-model support
│   └── Memory tracking
├── Embedding Generation
│   ├── Batch processing
│   ├── Detailed results
│   └── Error handling
└── Service Lifecycle
    ├── Initialization
    ├── Health checks
    └── Shutdown

VisionEmbeddingRegistry
├── Service Registration
├── Instance Management
├── Model Discovery
└── Status Monitoring

VisionEmbeddingUnloader
├── Unified Unloading
├── Memory Pressure Detection
├── Timeout-based Unloading
└── LRU-based Unloading
```

## Quick Start

### 1. Create a Vision Embedding Service

```python
from app.services.integration.vision_embedding_service import VisionEmbeddingService
from app.services.integration.vision_embedding_registry import register_vision_embedding_service

class MyVisionEmbeddingService(VisionEmbeddingService):
    # Define your model registry
    MODEL_REGISTRY = {
        "my-model-1": {
            "name": "My Model 1",
            "description": "My custom vision model",
            "embed_dim": 512,
            "preprocess_size": 224,
            "memory_estimate_gb": 1.0,
            "performance_rating": "balanced",
            "recommended_use": "general purpose",
        }
    }

    def __init__(self):
        super().__init__(
            name="my_vision_embedding_service",
            dependencies=["config_manager"],
            required_packages=["torch", "transformers"],
            startup_priority=5,
            health_check_interval=60,
            auto_start=True,
        )

    def is_valid_model(self, model_id: str) -> bool:
        """Check if a model ID is valid."""
        return model_id in self.MODEL_REGISTRY

    async def _load_specific_model(self, model_id: str) -> bool:
        """Load your specific model implementation."""
        # Your model loading logic here
        model_info = self.MODEL_REGISTRY[model_id]
        self._current_model_id = model_id
        self._model_loaded = True
        self._embed_dim = model_info["embed_dim"]
        return True

    async def _unload_specific_model(self, model_id: str) -> bool:
        """Unload your specific model implementation."""
        # Your model unloading logic here
        if model_id == self._current_model_id:
            self._current_model_id = ""
            self._model_loaded = False
            self._embed_dim = 0
        return True

    async def _embed_batch(self, image_paths: List[str], variant: str) -> List[List[float]]:
        """Generate embeddings for a batch of images."""
        # Your embedding generation logic here
        embeddings = []
        for image_path in image_paths:
            # Process image and generate embedding
            embedding = self._generate_embedding(image_path)
            embeddings.append(embedding)
        return embeddings

    async def _embed_batch_detailed(self, image_paths: List[str], batch_size: int) -> List[Dict[str, Any]]:
        """Generate embeddings with detailed per-image results."""
        results = []
        for image_path in image_paths:
            try:
                embedding = await self._embed_batch([image_path], "default")
                results.append({
                    "path": image_path,
                    "variant": "default",
                    "embedding": embedding[0],
                    "model_id": self._current_model_id,
                    "embed_dim": self._embed_dim,
                })
            except Exception as e:
                results.append({
                    "path": image_path,
                    "error": str(e),
                })
        return results

    async def _get_default_model_id(self) -> Optional[str]:
        """Get the default model ID."""
        return "my-model-1"

    async def _get_model_info(self, model_id: str) -> Dict[str, Any]:
        """Get information about a specific model."""
        if model_id in self.MODEL_REGISTRY:
            info = self.MODEL_REGISTRY[model_id].copy()
            info.update({
                "model_id": model_id,
                "loaded_at": time.time(),
                "last_used": time.time(),
                "service_name": self.name,
            })
            return info
        return {}

    @classmethod
    def get_available_models(cls) -> List[Dict[str, str]]:
        """Get list of available models."""
        return [
            {
                "id": model_id,
                "name": info["name"],
                "description": info["description"],
                "embed_dim": info["embed_dim"],
                "preprocess_size": info["preprocess_size"],
                "memory_estimate_gb": info["memory_estimate_gb"],
                "performance_rating": info["performance_rating"],
                "recommended_use": info["recommended_use"],
            }
            for model_id, info in cls.MODEL_REGISTRY.items()
        ]

    @classmethod
    def get_model_info(cls, model_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific model."""
        return cls.MODEL_REGISTRY.get(model_id)

# Register your service
register_vision_embedding_service(
    MyVisionEmbeddingService,
    name="my_vision_embedding",
    metadata={
        "description": "My custom vision embedding service",
        "version": "1.0.0",
        "author": "Your Name",
        "tags": ["vision", "embedding", "custom"],
    }
)
```

### 2. Using the Service

```python
from app.services.integration.vision_embedding_registry import get_vision_embedding_registry

# Get the registry
registry = get_vision_embedding_registry()

# Create an instance
service = registry.create_service_instance("my_vision_embedding")

# Load a model
await service.load_model("my-model-1")

# Generate embeddings
image_paths = ["image1.jpg", "image2.jpg"]
embeddings = await service.embed_images(image_paths)

# Get detailed results
detailed_results = await service.embed_images_detailed(image_paths)

# Unload the model
await service.unload_model("my-model-1")
```

### 3. Using the Unified Unloading Interface

```python
from app.services.integration.vision_embedding_unloader import (
    unload_all_vision_embedding_models,
    unload_vision_embedding_service_models,
    unload_vision_embedding_model,
    unload_vision_embedding_models_by_memory_pressure,
    unload_vision_embedding_models_by_timeout,
)

# Unload all models from all services
results = await unload_all_vision_embedding_models()

# Unload all models from a specific service
success = await unload_vision_embedding_service_models("my_vision_embedding")

# Unload a specific model
success = await unload_vision_embedding_model("my_vision_embedding", "my-model-1")

# Unload based on memory pressure
results = await unload_vision_embedding_models_by_memory_pressure(threshold=0.85)

# Unload based on timeout
results = await unload_vision_embedding_models_by_timeout(vram_timeout=600, ram_timeout=1800)
```

## Key Features

### 1. Automatic Memory Management

The framework integrates with the existing `ModelUsageTracker` to automatically unload models based on:

- **VRAM Timeout**: Models are unloaded after a configurable time of inactivity (default: 10 minutes)
- **RAM Timeout**: Models are unloaded after a longer period of inactivity (default: 30 minutes)
- **Memory Pressure**: Models are unloaded when memory usage exceeds thresholds
- **LRU Policy**: Least recently used models are unloaded when new models need to be loaded

### 2. Multi-Model Support

Services can support multiple models with:

- **Concurrent Loading**: Multiple models can be loaded simultaneously (configurable limit)
- **Model Switching**: Easy switching between different models
- **Model Registry**: Centralized model information and metadata
- **Memory Tracking**: Per-model memory usage tracking

### 3. Unified Interface

All vision embedding services provide the same interface:

- **Standardized API**: Consistent methods across all services
- **Error Handling**: Robust error handling and recovery
- **Health Monitoring**: Built-in health checks and status reporting
- **Service Discovery**: Automatic service registration and discovery

### 4. Service Lifecycle Management

Complete lifecycle management including:

- **Initialization**: Proper service initialization with dependency checking
- **Health Checks**: Regular health monitoring and status reporting
- **Graceful Shutdown**: Proper cleanup and resource management
- **Dependency Management**: Automatic dependency resolution and startup ordering

## Configuration

### Service Configuration

```python
class MyVisionEmbeddingService(VisionEmbeddingService):
    def __init__(self):
        super().__init__(
            name="my_vision_embedding_service",  # Unique service name
            dependencies=["config_manager"],     # Required dependencies
            required_packages=["torch"],         # Required Python packages
            startup_priority=5,                  # Startup priority (lower = higher)
            health_check_interval=60,            # Health check interval in seconds
            auto_start=True,                     # Auto-start when dependencies are ready
        )
```

### Model Registry Configuration

```python
MODEL_REGISTRY = {
    "model-id": {
        "name": "Model Name",                    # Human-readable name
        "description": "Model description",      # Detailed description
        "embed_dim": 512,                        # Embedding dimension
        "preprocess_size": 224,                  # Input image size
        "memory_estimate_gb": 1.0,               # Estimated memory usage
        "performance_rating": "balanced",        # Performance rating
        "recommended_use": "general purpose",    # Recommended use case
    }
}
```

## Integration with Existing Services

The framework is designed to integrate seamlessly with existing services:

### 1. ModelUsageTracker Integration

```python
# Automatic integration with ModelUsageTracker
from app.managers.model_usage_tracker import get_model_usage_tracker

tracker = get_model_usage_tracker()
tracker.record_usage(model_id)  # Record model usage
tracker.mark_unloaded(model_id)  # Mark model as unloaded
```

### 2. Service Manager Integration

```python
# Register with service manager
from app.services.core.service_setup import get_service_manager

service_manager = get_service_manager()
service_manager.register_service(my_vision_embedding_service)
```

### 3. API Integration

```python
# Use in API endpoints
from app.services.integration.vision_embedding_registry import get_vision_embedding_registry

registry = get_vision_embedding_registry()
service = registry.get_service_instance("my_vision_embedding")
embeddings = await service.embed_images(image_paths)
```

## Best Practices

### 1. Model Implementation

- **Lazy Loading**: Load models only when needed
- **Memory Management**: Properly clean up model resources
- **Error Handling**: Handle loading/unloading errors gracefully
- **Validation**: Validate model IDs and parameters

### 2. Service Implementation

- **Dependency Management**: Declare all required dependencies
- **Health Checks**: Implement meaningful health checks
- **Error Recovery**: Provide error recovery mechanisms
- **Logging**: Use appropriate logging levels

### 3. Registry Usage

- **Service Registration**: Register services with descriptive metadata
- **Instance Management**: Use the registry for instance management
- **Discovery**: Use registry methods for service discovery
- **Cleanup**: Properly unregister services when no longer needed

### 4. Unloading Strategy

- **Proactive Unloading**: Unload models before memory pressure
- **Timeout Configuration**: Configure appropriate timeouts
- **Monitoring**: Monitor unloading events and performance
- **Fallback**: Provide fallback mechanisms for unloading failures

## Testing

### Unit Testing

```python
import pytest
from unittest.mock import AsyncMock, MagicMock

class TestMyVisionEmbeddingService:
    @pytest.fixture
    def service(self):
        return MyVisionEmbeddingService()

    @pytest.mark.asyncio
    async def test_model_loading(self, service):
        await service.initialize()
        success = await service.load_model("my-model-1")
        assert success is True
        assert service.is_model_loaded is True

    @pytest.mark.asyncio
    async def test_embedding_generation(self, service):
        await service.initialize()
        await service.load_model("my-model-1")
        embeddings = await service.embed_images(["test.jpg"])
        assert len(embeddings) == 1
        assert len(embeddings[0]) == 512
```

### Integration Testing

```python
@pytest.mark.asyncio
async def test_service_registration():
    registry = get_vision_embedding_registry()
    registry.register_service(MyVisionEmbeddingService)
    assert "my_vision_embedding" in registry.get_registered_services()

@pytest.mark.asyncio
async def test_unified_unloading():
    results = await unload_all_vision_embedding_models()
    assert isinstance(results, dict)
```

## Troubleshooting

### Common Issues

1. **Model Loading Failures**
   - Check required packages are installed
   - Verify model files are accessible
   - Check memory availability

2. **Service Registration Issues**
   - Ensure service inherits from VisionEmbeddingService
   - Verify all abstract methods are implemented
   - Check service name uniqueness

3. **Memory Management Issues**
   - Monitor memory usage patterns
   - Adjust timeout configurations
   - Check for memory leaks in model implementations

4. **Performance Issues**
   - Profile model loading/unloading times
   - Optimize batch processing
   - Consider model caching strategies

### Debugging

```python
# Enable debug logging
import logging
logging.getLogger("uvicorn").setLevel(logging.DEBUG)

# Check service status
registry = get_vision_embedding_registry()
status = registry.get_service_status()
print(status)

# Check model information
models = registry.get_available_models()
print(models)
```

## Future Enhancements

The framework is designed to be extensible and can be enhanced with:

1. **Model Compression**: Automatic model compression for inactive models
2. **Distributed Loading**: Support for distributed model loading across multiple nodes
3. **Advanced Caching**: Intelligent model caching with predictive loading
4. **Performance Optimization**: Advanced performance monitoring and optimization
5. **Plugin System**: Plugin-based architecture for easy service extension

## Conclusion

The Vision Embedding Framework provides a robust, extensible foundation for vision embedding services with automatic memory management, unified interfaces, and comprehensive lifecycle management. By following the patterns and best practices outlined in this documentation, you can easily create new vision embedding services that integrate seamlessly with the existing system.
