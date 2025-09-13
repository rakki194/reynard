# Plugin Service Integration

This document describes the integration of ultralytics, pillow-jxl, and pillow-avif plugins into the service management system and lazy loading stack.

## Overview

The plugin dependencies (ultralytics, pillow-jxl, pillow-avif) have been moved from direct imports to a service-based management system that provides:

- **Lazy loading** - Plugins are loaded only when needed
- **Service management** - Centralized plugin availability detection and management
- **Backward compatibility** - Existing code continues to work with fallback mechanisms
- **Health monitoring** - Service health checks for plugin availability
- **Proper error handling** - Graceful degradation when plugins are not available

## Services Implemented

### ImageProcessingService

**Location**: `app/services/image_processing.py`

**Purpose**: Manages image processing capabilities including pillow-jxl and pillow-avif plugin support.

**Features**:

- Detects pillow-jxl and pillow-avif availability at startup
- Provides supported image formats information
- Health checks for plugin availability
- Service information with plugin status

**Key Methods**:

- `is_jxl_supported()` - Check if JXL format is supported
- `is_avif_supported()` - Check if AVIF format is supported
- `get_supported_formats()` - Get set of supported image formats
- `get_format_info()` - Get detailed information about supported formats
- `get_supported_formats_for_inference()` - Get MIME types used by inference workflows
- `get_pil_image()` / `get_pil_imagedraw()` / `get_pil_imagefont()` - Safe accessors for Pillow modules respecting plugin state

**Usage**:

```python
from app.services.access import get_image_processing

image_service = get_image_processing()
if image_service.is_jxl_supported():
    # Process JXL images
    pass
```

Additional details from implementation:

- Startup priority: 2 (early) and `required_packages=["PIL"]`
- Health checks every 60s update plugin availability at runtime
- `get_info()` includes `pillow_jxl_available`, `pillow_avif_available`, `supported_formats`, `format_info`

Code reference:

```170:210:app/services/image_processing.py
def _initialize_supported_formats(self) -> None:
    # ... adds standard formats, then conditionally adds .jxl and .avif when plugins are present
    if self._pillow_jxl_available:
        self._supported_formats.add(".jxl")
        self._format_info[".jxl"] = {"plugin_name": "pillow-jxl", ...}
    if self._pillow_avif_available:
        self._supported_formats.add(".avif")
        self._format_info[".avif"] = {"plugin_name": "pillow-avif", ...}
```

### DetectionModelsService (Enhanced)

**Location**: `app/services/detection_models.py`

**Purpose**: Enhanced to include ultralytics availability detection for YOLO models.

**New Features**:

- Detects ultralytics availability at startup
- Provides ultralytics availability status
- Enhanced service information with ultralytics status

**Key Methods**:

- `is_ultralytics_available()` - Check if ultralytics is available for YOLO models
- `get_available_models()` / `list_available_models()` - Discovery of registered detection models
- `load_model(model_id)` / `unload_model(model_id)` - Async lifecycle helpers
- `get_info()` includes `ultralytics_available` and model counts

**Usage**:

```python
from app.services.access import get_detection_models

detection_service = get_detection_models()
if detection_service.is_ultralytics_available():
    # Use YOLO models
    pass
```

Additional details from implementation:

- Startup priority: 7 and `required_packages=["torch", "torchvision"]`
- Ultralytics detection uses lazy export; absence is handled gracefully

Code reference:

```39:53:app/services/detection_models.py
# Check for ultralytics availability
try:
    from app.utils.lazy_loader import ultralytics
    YOLO = ultralytics.YOLO
    self._ultralytics_available = True
except ImportError:
    self._ultralytics_available = False
```

## Lazy Loader Integration

### New Package Registrations

The following packages have been added to the lazy loader:

- `pillow_jxl` - Priority 2 (high priority for image processing)
- `pillow_avif` - Priority 2 (high priority for image processing)
- `ultralytics` - Priority 3 (medium priority for ML models)

### Lazy Exports

New lazy exports have been added:

```python
pillow_jxl = LazyPackageExport("pillow_jxl")
pillow_avif = LazyPackageExport("pillow_avif")
```

### Helper utilities

The lazy loader also exposes helpers that consult `ImageProcessingService` when available and fall back to direct imports:

- `get_pil_image_with_plugins()`
- `get_pil_imagedraw()`
- `get_pil_imagefont()`
- `check_image_plugin_support(plugin_name: Literal["jxl"|"avif"])`
- `get_supported_image_formats()` (MIME list for inference)

Example:

```python
from app.utils.lazy_loader import get_pil_image_with_plugins, check_image_plugin_support

Image = get_pil_image_with_plugins()
if check_image_plugin_support("avif"):
    img = Image.open(path_to_avif)
```

Initialization (optional):

```python
from app.utils.lazy_loader import initialize_lazy_loading
loader = initialize_lazy_loading()
await loader.start_background_loading()
```

## Backward Compatibility

### Image Format Detection

The `get_supported_image_formats()` function in `app/caption_generation/utils.py` has been updated to:

1. First try to get formats from the ImageProcessingService
2. Fall back to direct plugin checks if the service is not available
3. Maintain the same return format and behavior

### YOLO Models

The YOLO models in `app/detection_models/yolo_models.py` have been updated to:

1. First try to get ultralytics availability from the DetectionModelsService
2. Fall back to direct checks if the service is not available
3. Maintain the same behavior and error handling

Code reference:

```24:49:app/detection_models/yolo_models.py
from app.utils.lazy_loader import ultralytics
try:
    from app.services.access import get_detection_models
    detection_models_service = get_detection_models()
    if detection_models_service and detection_models_service.status.value == "running":
        ULTRALYTICS_AVAILABLE = detection_models_service.is_ultralytics_available()
    else:
        YOLO = ultralytics.YOLO
        ULTRALYTICS_AVAILABLE = True
except (RuntimeError, ImportError):
    try:
        YOLO = ultralytics.YOLO
        ULTRALYTICS_AVAILABLE = True
    except ImportError:
        ULTRALYTICS_AVAILABLE = False
```

## Service Integration

### Core Service Setup

Both new services are integrated into the core service setup in `app/services/core/service_setup.py`:

- ImageProcessingService is registered with startup priority 2 (early startup)
- DetectionModelsService is enhanced with ultralytics detection
- Both services are properly registered with the service manager

Registration reference:

```130:138:app/services/core/service_setup.py
_service_manager.register_service(caption_generator_service)
_service_manager.register_service(detection_models_service)
_service_manager.register_service(image_processing_service)
```

### Service Access

New service access functions have been added to `app/services/access.py`:

- `get_image_processing()` - Get the ImageProcessingService instance
- Enhanced DetectionModelsService access with ultralytics status

Convenience accessors for Pillow respecting plugin state:

- `get_pil_image()`
- `get_pil_imagedraw()`
- `get_pil_imagefont()`

These call into `ImageProcessingService` when available and fall back to direct Pillow imports.

```110:137:app/services/access.py
def get_pil_image():
    image_service = get_image_processing()
    return image_service.get_pil_image() if image_service else Image
```

## Testing

### ImageProcessingService Tests

Comprehensive test coverage in `app/tests/services/test_image_processing_service.py`:

- Service initialization and startup
- Plugin availability detection (pillow-jxl, pillow-avif)
- Supported formats detection
- Health checks
- Service information
- Error handling

File: `app/tests/services/test_image_processing_service.py`

Covered cases include plugin detection, supported formats and info, health checks, and shutdown behavior.

```118:136:app/tests/services/test_image_processing_service.py
format_info = service.get_format_info()
assert ".jxl" in format_info
assert format_info[".jxl"]["plugin_name"] == "pillow-jxl"
```

### Test Results

All tests pass successfully:

```text
================================ 9 passed in 1.24s =================================
```

## Benefits

### Performance

- **Lazy loading** reduces startup time by loading plugins only when needed
- **Service-based management** provides better resource utilization
- **Parallel initialization** of independent services

### Reliability

- **Graceful degradation** when plugins are not available
- **Health monitoring** for plugin availability
- **Proper error handling** with fallback mechanisms

### Maintainability

- **Centralized plugin management** through services
- **Consistent API** for plugin availability checking
- **Service-based architecture** for better code organization

### User Experience

- **Clear logging** of plugin availability status
- **Informative error messages** when plugins are missing
- **Service status information** for debugging

## Migration Guide

### For Existing Code

Existing code that directly imports or checks for plugins will continue to work:

```python
# This still works
try:
    import pillow_jxl
    # Process JXL images
except ImportError:
    # Handle missing plugin
    pass
```

### For New Code

New code should use the service-based approach:

```python
from app.services.access import get_image_processing

image_service = get_image_processing()
if image_service.is_jxl_supported():
    # Process JXL images
    pass
```

When working with Pillow directly in new code, prefer the service-aware helpers from `app.services.access` or `app.utils.lazy_loader` to ensure correct plugin handling.

### For Service Integration

To integrate with the service system:

```python
from app.services.access import get_image_processing, get_detection_models

# Get service instances
image_service = get_image_processing()
detection_service = get_detection_models()

# Check plugin availability
if image_service.is_jxl_supported():
    # JXL support available
    pass

if detection_service.is_ultralytics_available():
    # YOLO models available
    pass
```

## Future Enhancements

### Planned Features

- **Plugin installation management** through services
- **Dynamic plugin loading** during runtime
- **Plugin version compatibility** checking
- **Plugin performance monitoring**

### Potential Improvements

- **Plugin marketplace** integration
- **Automatic plugin discovery**
- **Plugin dependency resolution**
- **Plugin configuration management**

## Conclusion

The plugin service integration provides a robust, maintainable, and performant solution for managing plugin dependencies. It maintains backward compatibility while providing a modern service-based architecture for future development.

The implementation successfully addresses the original requirements:

- ✅ Ultralytics moved to lazy loading/service management
- ✅ Pillow-jxl moved to lazy loading/service management
- ✅ Pillow-avif moved to lazy loading/service management
- ✅ Proper dependency management and error handling
- ✅ Comprehensive test coverage
- ✅ Backward compatibility maintained

## Environment and Packaging Notes

- Packages are declared in `requirements.txt` and `requirements.cpu.txt` as `pillow-avif-plugin`, `pillow-jxl-plugin`, and `ultralytics`.
- Ultralytics caches are directed via `YOLO_CONFIG_DIR` (see docker-compose files) and commonly mounted to `./.ultralytics` in the container.

## External References

- Ultralytics YOLO documentation: [docs.ultralytics.com](https://docs.ultralytics.com)
- Pillow image file formats: [Pillow handbook – Image File Formats](https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html)
- pillow-avif-plugin (PyPI): [pypi.org/project/pillow-avif-plugin](https://pypi.org/project/pillow-avif-plugin/)
- pillow-jxl-plugin (PyPI): [pypi.org/project/pillow-jxl-plugin](https://pypi.org/project/pillow-jxl-plugin/)
