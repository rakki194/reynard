# CLIP Multi-Model Support

## Overview

The ClipEmbeddingService now supports multiple CLIP model variants with intelligent model management, automatic unloading, and concurrent model loading capabilities. This enhancement allows users to switch between different CLIP models based on their specific needs while maintaining optimal memory usage.

## Features

### Model Registry

A comprehensive model registry containing 6 different CLIP model variants:

- **ViT-L-14/openai**: Large Vision Transformer (768d) - OpenAI weights
- **ViT-L-14/laion2b_s32b_b82k**: Large Vision Transformer (768d) - LAION-2B weights
- **ViT-B-32/openai**: Base Vision Transformer (512d) - OpenAI weights
- **ViT-B-32/laion2b_s34b_b79k**: Base Vision Transformer (512d) - LAION-2B weights
- **ViT-H-14/laion2b_s32b_b79k**: Huge Vision Transformer (1024d) - LAION-2B weights
- **ViT-L-14@336px/openai**: Large Vision Transformer (768d) - 336px resolution

Each model includes detailed metadata:

- Model name and pretrained weights
- Description and recommended use cases
- Embedding dimensions and preprocessing size
- Memory usage estimates
- Performance ratings

### Model Management

#### Loading Models

```python
# Load a specific model
success = await clip_service.load_model("ViT-L-14/openai")

# Check if model is loaded
is_loaded = clip_service.is_model_loaded("ViT-L-14/openai")

# Get current model ID
current_model = clip_service.get_current_model_id()
```

#### Switching Models

```python
# Switch to a different model (automatically unloads current)
success = await clip_service.switch_model_by_id("ViT-B-32/openai")
```

#### Unloading Models

```python
# Unload specific model
success = await clip_service.unload_model("ViT-L-14/openai")

# Unload current model
success = await clip_service.unload_model()
```

### Concurrent Model Support

- **Concurrent Limit**: Up to 2 models can be loaded simultaneously
- **LRU Eviction**: When the limit is reached, the least recently used model is automatically unloaded
- **Memory Management**: Intelligent memory usage tracking and pressure detection

### Memory Usage Tracking

Each model tracks:

- GPU memory usage (CUDA)
- System memory usage
- Loading times
- Last usage timestamps
- Memory pressure levels

## API Endpoints

### Get Available Models

```text
GET /api/rag/embedding/models
```

Returns information about all available models for both vision and text embeddings.

### Load Vision Model

```text
POST /api/rag/embedding/vision/load/{model_id}
```

Loads a specific CLIP model by ID.

### Switch Vision Model

```text
POST /api/rag/embedding/vision/switch/{model_id}
```

Switches to a different CLIP model, automatically unloading the current one.

### Unload Vision Model

```text
POST /api/rag/embedding/vision/unload/{model_id}
```

Unloads a specific CLIP model.

### Get Vision Status

```text
GET /api/rag/embedding/vision/status
```

Returns detailed status of all CLIP models including loading state, memory usage, and performance metrics.

## Usage Examples

### Basic Model Switching

```python
from app.services.access import get_clip_embedding_service

clip_service = get_clip_embedding_service()

# Switch to a faster, lower-memory model
await clip_service.switch_model_by_id("ViT-B-32/openai")

# Switch to highest quality model
await clip_service.switch_model_by_id("ViT-H-14/laion2b_s32b_b79k")

# Switch to higher resolution model
await clip_service.switch_model_by_id("ViT-L-14@336px/openai")
```

### Concurrent Model Management

```python
# Load multiple models
await clip_service.load_model("ViT-L-14/openai")
await clip_service.load_model("ViT-B-32/openai")

# Check loaded models
loaded_models = clip_service.get_loaded_models()
print(f"Loaded models: {loaded_models}")

# Get detailed info
all_info = clip_service.get_all_loaded_models_info()
print(f"Model info: {all_info}")
```

### Memory Monitoring

```python
# Get memory usage for current model
memory_info = clip_service.get_model_memory_usage()

# Get memory usage for specific model
memory_info = clip_service.get_model_memory_usage("ViT-L-14/openai")

# Check memory pressure
pressure_level = clip_service.get_memory_pressure_level()
```

## Configuration

### Model Selection

The default model is configured via the `rag_clip_model` setting:

```json
{
  "rag_clip_model": "ViT-L-14/openai"
}
```

### Concurrent Model Limit

The maximum number of models that can be loaded simultaneously is configurable:

```python
clip_service._concurrent_models_limit = 2  # Default value
```

## Performance Considerations

### Memory Usage

- **ViT-L-14 models**: ~1.2GB GPU memory
- **ViT-B-32 models**: ~0.6GB GPU memory
- **ViT-H-14 models**: ~2.4GB GPU memory
- **336px models**: ~1.8GB GPU memory

### Loading Times

- Model loading typically takes 2-5 seconds depending on hardware
- Loading times are tracked and cached for optimization

### Recommendations

- Use **ViT-B-32** models for faster inference and lower memory usage
- Use **ViT-L-14** models for general purpose, high quality embeddings
- Use **ViT-H-14** models for highest quality when memory allows
- Use **336px** models for better detail in high-resolution images

## Integration with Existing Systems

### ModelUsageTracker Integration

All models are automatically registered with the ModelUsageTracker for:

- Automatic unloading based on timeouts
- Usage statistics and metrics
- Memory pressure monitoring

### Health Monitoring

The service provides enhanced health information including:

- Multi-model support status
- Current model information
- Memory usage metrics
- Loading/unloading events

## Testing

Comprehensive test coverage includes:

- Model registry validation
- Loading/unloading functionality
- Model switching
- Concurrent model management
- Memory usage tracking
- API endpoint testing

Run tests with:

```bash
python -m pytest app/tests/services/test_clip_embedding_multi_model.py -v
python -m pytest app/tests/api/test_rag_multi_model_endpoints.py -v
```

## Migration from Single Model

The multi-model support is backward compatible. Existing code will continue to work with the default model, but can now take advantage of the new capabilities:

```python
# Old way (still works)
await clip_service.embed_images(image_paths)

# New way with model selection
await clip_service.switch_model_by_id("ViT-B-32/openai")
await clip_service.embed_images(image_paths)
```

## Future Enhancements

Potential future improvements:

- Dynamic model loading based on usage patterns
- Model compression for inactive models
- Automatic model selection based on image characteristics
- Support for custom model variants
- Integration with model serving frameworks
