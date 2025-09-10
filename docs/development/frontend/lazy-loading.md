# Lazy Loading System

The lazy loading system is a project-wide solution for managing heavy Python packages that slow down startup. Instead of importing everything at once, it lets you import packages only when they're actually needed, so the application starts quickly and loads heavy dependencies in the background.

## Quick Start

Lazy loading delays importing heavy packages until first use, avoiding the 5–10 second startup penalty from packages like `torch`, `transformers`, and `tensorflow`:

```python
# This is fast - no packages are loaded yet
from app.utils.lazy_loader import torch, transformers, tensorflow

# Only now does torch actually get loaded
model = torch.nn.Linear(10, 5)  # First access triggers loading

# Only now does transformers get loaded
model = transformers.AutoModel.from_pretrained("bert-base-uncased")  # First access triggers loading
```

## Overview

- **Deferred Loading**: Packages are only imported when first accessed
- **Background Loading**: Common packages are loaded in the background during startup
- **Thread Safety**: Multiple threads can safely access the same package
- **Error Handling**: Graceful fallback when packages are unavailable
- **Performance Tracking**: Monitor load times and success rates

## How It Works

### Core Components

1. **LazyPackageExport**: A proxy wrapper that only imports the actual package when accessed
2. **LazyLoader**: Central manager that handles multiple packages and background loading
3. **Global Registry**: Pre-registered common packages with aliases
4. **Component Exports**: Specialized exports for common package components (torch.nn, torch.nn.functional, etc.)

### Package Registration

The system pre-registers common heavy packages using `LazyPackageExport`:

```python
# Pre-registered packages (from app/utils/lazy_loader.py)
torch = LazyPackageExport("torch")
torchvision = LazyPackageExport("torchvision")
transformers = LazyPackageExport("transformers")
timm = LazyPackageExport("timm")
numpy = LazyPackageExport("numpy")
PIL = LazyPackageExport("PIL")
cv2 = LazyPackageExport("cv2")
tensorflow = LazyPackageExport("tensorflow")
sklearn = LazyPackageExport("sklearn")
ultralytics = LazyPackageExport("ultralytics")
safetensors = LazyPackageExport("safetensors")
tslearn = LazyPackageExport("tslearn")
pillow_jxl = LazyPackageExport("pillow_jxl")
pillow_avif = LazyPackageExport("pillow_avif")
einops = LazyPackageExport("einops")
pandas = LazyPackageExport("pandas")
matplotlib = LazyPackageExport("matplotlib")
seaborn = LazyPackageExport("seaborn")

# Common component aliases
F = TorchExports()  # torch.nn.functional
nn = TorchExports()  # torch.nn
checkpoint = TorchExports()  # torch.utils.checkpoint
CrossEntropyLoss = TorchExports()  # torch.nn.CrossEntropyLoss
rearrange = einops.rearrange  # einops.rearrange
```

### Usage

Instead of direct imports, use the lazy loading system:

```python
# Before (slow startup)
import torch
import torch.nn.functional as F
from transformers import AutoModel

# After (fast startup)
from app.utils.lazy_loader import torch, F, transformers

# The packages are only loaded when first accessed
model = transformers.AutoModel.from_pretrained("bert-base-uncased")
tensor = torch.tensor([1, 2, 3])
activation = F.relu(tensor)
```

### Component Access

The system provides specialized access to common package components:

```python
from app.utils.lazy_loader import torch, F, nn, checkpoint

# These work exactly like the real components
model = nn.Linear(10, 5)
output = F.relu(model(input))
saved_output = checkpoint.checkpoint(model, input)
```

### PIL with Plugin Support

For image processing, the system provides enhanced PIL access with optional plugin support:

```python
from app.utils.lazy_loader import get_pil_image_with_plugins, check_image_plugin_support

Image = get_pil_image_with_plugins()

# Check if JXL/AVIF support is available
if check_image_plugin_support("jxl"):
    img = Image.open("image.jxl")
elif check_image_plugin_support("avif"):
    img = Image.open("image.avif")
else:
    img = Image.open("image.jpg")
```

## Integration Points

### Application Startup

The lazy loading system is initialized early in the application startup process:

```python
# In app/main.py
from app.utils.lazy_loader import initialize_lazy_loading

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize lazy loading system first
    t0 = time.time()
    initialize_lazy_loading()
    logger.info(f"Lazy loading system initialized in {time.time() - t0:.2f}s")
```

### Detection Models

Detection models use lazy loading for heavy ML packages:

```python
# app/detection_models/yolo_models.py
from app.utils.lazy_loader import torch, torchvision, transformers, F, nn

class DetectorModelOwl(torch.nn.Module):
    def __init__(self, model_path: str, dropout: float, n_hidden: int = 768):
        super().__init__()
        owl = transformers.Owlv2VisionModel.from_pretrained(model_path)
        # ...
```

### Caption Generators

Caption generation plugins use lazy loading:

```python
# app/caption_generation/plugins/jtp2/generator.py
from app.utils.lazy_loader import torch, torchvision, safetensors, F, nn

class JTP2Generator(CaptionGenerator):
    def _initialize(self) -> None:
        # Model initialization using lazy-loaded packages
        # ...
```

### Analysis Tools

Vector analysis and visualization tools use lazy loading:

```python
# app/vector_analysis.py
from app.utils.lazy_loader import sklearn

def apply_pca(matrix: pd.DataFrame, n_components: int = 2) -> pd.DataFrame:
    pca = sklearn.decomposition.PCA(n_components=n_components)
    # ...
```

## Monitoring

### Lazy Loading Status

Check the status of lazy loading:

```python
from app.utils.lazy_loader import get_lazy_loading_status

status = get_lazy_loading_status()
print(f"Loaded {status['progress']['loaded_packages']} of {status['progress']['total_packages']} packages")
```

Or via HTTP endpoint:

```bash
curl http://localhost:7000/api/debug/lazy-loading-status
```

### API Endpoints

#### Lazy Loading Status

Monitor the status of lazy loading:

```http
GET /api/debug/lazy-loading-status
```

Returns:

```json
{
  "progress": {
    "total_packages": 18,
    "loaded_packages": 15,
    "failed_packages": 0,
    "is_loading": false,
    "progress_percentage": 83.33
  },
  "packages": {
    "torch": {
      "status": "loaded",
      "load_time": 5.804,
      "error": null,
      "priority": 1
    },
    "transformers": {
      "status": "loaded",
      "load_time": 0.931,
      "error": null,
      "priority": 2
    }
  }
}
```

## Performance Benefits

### Startup Time Improvement

- **Before**: 5-10 seconds startup time due to heavy package imports
- **After**: 1-2 seconds startup time with background loading

### Load Time Examples

From testing:

- `torch`: 5.804s (heaviest package)
- `sklearn`: 1.456s
- `transformers`: 0.931s
- `tslearn`: 0.002s
- `numpy`: 0.000s (already cached)
- `PIL`: 0.000s (already cached)

### Background Loading

Common packages are loaded in the background during startup with priorities:

1. **Priority 1** (highest): `torch`, `numpy`, `PIL`, `cv2`, `pygit2`
2. **Priority 2** (high): `transformers`, `torchvision`, `timm`, `pillow_jxl`, `pillow_avif`, `watchfiles`, `sqlalchemy`
3. **Priority 3** (medium): `tensorflow`, `sklearn`, `ultralytics`, `safetensors`, `tslearn`

## Error Handling

The system gracefully handles missing packages:

```python
# If a package is not available
from app.utils.lazy_loader import nonexistent_package

# Accessing will raise an ImportError with details
try:
    _ = nonexistent_package.some_attribute
except ImportError as e:
    print(f"Package not available: {e}")
```

## Thread Safety

The lazy loading system is thread-safe:

```python
# Multiple threads can safely access the same package
import threading

def access_package():
    _ = torch.__version__

threads = [threading.Thread(target=access_package) for _ in range(5)]
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()
# Package is only loaded once, all threads get the same instance
```

## Testing

The lazy loading system includes comprehensive tests:

```bash
# Run lazy loading tests
python -m pytest app/tests/test_lazy_loader.py -v
```

Tests cover:

- Package initialization
- Lazy loading behavior
- Thread safety
- Error handling
- Background loading
- Performance tracking

## Best Practices

### When to Use Lazy Loading

Use lazy loading for:

- Heavy packages that take >0.1s to import
- Packages used in optional features
- Packages that may not be available in all environments
- Packages used in background tasks

### When Not to Use Lazy Loading

Avoid lazy loading for:

- Lightweight packages (<0.1s import time)
- Core dependencies required for startup
- Packages used in critical startup paths

### Migration Guide

1. **Identify heavy imports**: Look for `import torch`, `import transformers`, etc.
2. **Replace with lazy imports**: Use `from app.utils.lazy_loader import torch, transformers`
3. **Update aliases**: Replace `import torch.nn.functional as F` with `from app.utils.lazy_loader import F`
4. **Test thoroughly**: Ensure all functionality works with lazy loading
5. **Monitor performance**: Use the status endpoint to track load times

### What Packages Are Available?

The system pre-registers these common packages:

#### Core ML Packages

- `torch` - PyTorch
- `torchvision` - PyTorch vision models
- `transformers` - Hugging Face transformers
- `timm` - Image models
- `tensorflow` - TensorFlow
- `sklearn` - Scikit-learn
- `ultralytics` - YOLO models

#### Data Science

- `numpy` - Numerical computing
- `pandas` - Data manipulation
- `matplotlib` - Plotting
- `seaborn` - Statistical plotting
- `tslearn` - Time series learning

#### Image Processing

- `PIL` - Python Imaging Library
- `cv2` - OpenCV
- `pillow_jxl` - JPEG XL support
- `pillow_avif` - AVIF support

#### Utilities

- `safetensors` - Safe tensor serialization
- `einops` - Einstein operations
- `pygit2` - Git operations
- `watchfiles` - File watching
- `sqlalchemy` - Database ORM

### Common Patterns

```python
# For torch components
from app.utils.lazy_loader import torch, F, nn, checkpoint

# For transformers
from app.utils.lazy_loader import transformers

# For image processing with plugins
from app.utils.lazy_loader import get_pil_image_with_plugins, check_image_plugin_support

# For data analysis
from app.utils.lazy_loader import sklearn, pandas, matplotlib, seaborn

# For ML models
from app.utils.lazy_loader import torch, torchvision, timm, ultralytics
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Check if the package is properly registered in `app/utils/lazy_loader.py`
2. **Performance Issues**: Monitor load times via the status endpoint
3. **Thread Safety**: Ensure proper locking in custom implementations
4. **Component Access**: Use the correct export class for package components

### Debugging

Use the status endpoint to diagnose issues:

```python
from app.utils.lazy_loader import get_lazy_loading_status

status = get_lazy_loading_status()
for package, info in status["packages"].items():
    if info["error"]:
        print(f"Error loading {package}: {info['error']}")
```

### Common Error Messages

- `ImportError: Could not import {package_name}`: Package not installed or not available
- `AttributeError: '{class}' object has no attribute '{name}'`: Component not available in export class
- `ModuleNotFoundError`: Package not registered in lazy loader
