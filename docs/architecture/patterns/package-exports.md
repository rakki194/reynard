# Package Export System

The Package Export System provides a comprehensive solution for lazy loading of heavy packages with
advanced features including validation, performance monitoring, and specialized exports.

## Overview

The system is designed to replace the basic lazy loading functionality in the original `lazy_loader.py` with
a more sophisticated approach that includes:

- **Proxy-based lazy loading** with automatic cleanup
- **Export validation and type checking** at multiple levels
- **Performance monitoring and optimization**
- **Specialized exports** for common packages
- **Export registry** for centralized management

## Core Components

### LazyPackageExport

The main class for lazy loading packages with enhanced features:

```python
from app.utils.package_exports import LazyPackageExport, ExportValidationLevel

# Basic usage
torch = LazyPackageExport("torch")

# With custom validation level
numpy = LazyPackageExport("numpy", validation_level=ExportValidationLevel.STRICT)

# With performance monitoring disabled
sklearn = LazyPackageExport("sklearn", enable_performance_monitoring=False)
```

### Validation Levels

The system supports multiple validation levels:

- **NONE**: No validation performed
- **BASIC**: Checks for basic module attributes (`__name__`, `__file__`)
- **STRICT**: Checks for common module attributes (`__name__`, `__file__`, `__package__`)
- **COMPREHENSIVE**: Package-specific validation (e.g., checks for `torch.Tensor` and `torch.nn`)

### Specialized Exports

Specialized exports provide type-safe access to specific components of packages:

```python
from app.utils.package_exports import TorchExports, TransformersExports

# PyTorch specialized exports
torch_exports = TorchExports()
nn_module = torch_exports.nn
functional = torch_exports.F

# Transformers specialized exports
tr_exports = TransformersExports()
pretrained_model = tr_exports.PreTrainedModel
auto_processor = tr_exports.AutoProcessor
```

### Performance Monitoring

The system includes built-in performance monitoring:

```python
from app.utils.package_exports import get_export_metadata, get_all_performance_metrics

# Get metadata for a specific export
metadata = get_export_metadata("torch")
print(f"Access count: {metadata.access_count}")
print(f"Load time: {metadata.load_time}")

# Get performance metrics for all exports
metrics = get_all_performance_metrics()
for package, package_metrics in metrics.items():
    print(f"{package}: {package_metrics}")
```

## Export Registry

The export registry provides centralized management of all exports:

```python
from app.utils.package_exports import (
    get_export_registry,
    register_export,
    get_export,
    cleanup_exports
)

# Get the global registry
registry = get_export_registry()

# Register a custom export
custom_export = LazyPackageExport("my_package")
register_export("my_package", custom_export)

# Get an export
export = get_export("my_package")

# Clean up unused exports
cleanup_exports()
```

## Factory Functions

The system provides factory functions for creating exports:

```python
from app.utils.package_exports import create_lazy_export, create_specialized_export

# Create a lazy export with custom settings
export = create_lazy_export(
    "my_package",
    validation_level=ExportValidationLevel.STRICT,
    enable_performance_monitoring=True
)

# Create a specialized export
torch_exports = create_specialized_export(TorchExports)
```

## Available Specialized Exports

### TorchExports

Provides access to PyTorch components:

- `F`: `torch.nn.functional`
- `nn`: `torch.nn`
- `checkpoint`: `torch.utils.checkpoint`
- `CrossEntropyLoss`: `torch.nn.CrossEntropyLoss`
- `Module`: `torch.nn.Module`
- And many more...

### TransformersExports

Provides access to Transformers components:

- `PreTrainedModel`: `transformers.modeling_utils.PreTrainedModel`
- `AutoProcessor`: `transformers.AutoProcessor`
- `AutoModelForCausalLM`: `transformers.AutoModelForCausalLM`
- Flash attention components (when available)
- And many more...

### TensorflowExports

Provides access to TensorFlow components:

- `TF`: Main tensorflow module
- `TVF`: `tensorflow.keras`
- `keras`: `tensorflow.keras`
- And various Keras submodules...

### PILExports

Provides access to PIL components with plugin support:

- `Image`: `PIL.Image`
- `ImageDraw`: `PIL.ImageDraw`
- `ImageFont`: `PIL.ImageFont`
- Plugin support methods for JXL/AVIF formats

### Other Specialized Exports

- `AiohttpExports`: For aiohttp components
- `EinopsExports`: For einops components

## Migration from Old System

The new system is backward compatible. Existing code using the old lazy loader exports will continue to work:

```python
# Old way (still works)
from app.utils.lazy_loader import torch, numpy, PIL

# New way (recommended)
from app.utils.package_exports import torch, numpy, PIL
```

## Performance Benefits

The new system provides several performance benefits:

1. **Automatic cleanup**: Unused exports are automatically cleaned up to free memory
2. **Performance monitoring**: Track load times and access patterns
3. **Optimization suggestions**: System can suggest when exports should be optimized
4. **Caching**: Specialized exports cache accessed components

## Error Handling

The system provides robust error handling:

```python
try:
    export = LazyPackageExport("missing_package")
    result = export.some_function()
except ImportError as e:
    print(f"Package not available: {e}")
except ExportValidationError as e:
    print(f"Validation failed: {e}")
```

## Best Practices

1. **Use appropriate validation levels**: Use `BASIC` for simple packages, `STRICT` for complex ones
2. **Enable performance monitoring**: Keep it enabled unless you have specific reasons to disable it
3. **Use specialized exports**: They provide better type hints and caching
4. **Clean up when needed**: Use `cleanup_exports()` periodically to free memory
5. **Monitor performance**: Check performance metrics to identify bottlenecks

## Testing

The system includes comprehensive tests in `tests/test_package_exports.py` that cover:

- LazyPackageExport functionality
- Validation at all levels
- Performance monitoring
- Specialized exports
- Export registry
- Integration scenarios

Run the tests with:

```bash
python -m pytest tests/test_package_exports.py -v
```
