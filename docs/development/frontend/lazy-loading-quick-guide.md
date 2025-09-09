# Lazy Loading Quick Guide

## What is Lazy Loading?

Lazy loading is a technique that delays loading heavy packages until they're actually needed. Instead of importing everything at startup (which can take 5-10 seconds), packages are loaded on-demand when you first use them.

## The Problem

Heavy Python packages like `torch`, `transformers`, and `tensorflow` take a long time to import:

```python
# This makes your app startup slow
import torch  # Takes ~5 seconds
import transformers  # Takes ~1 second
import tensorflow  # Takes ~3 seconds
```

## The Solution

The lazy loading system provides proxy objects that only load the real package when you first access it:

```python
# This is fast - no packages are loaded yet
from app.utils.lazy_loader import torch, transformers, tensorflow

# Only now does torch actually get loaded
model = torch.nn.Linear(10, 5)  # First access triggers loading

# Only now does transformers get loaded
model = transformers.AutoModel.from_pretrained("bert-base-uncased")  # First access triggers loading
```

## How It Works

### 1. Proxy Objects

The system creates proxy objects that look like the real packages:

```python
# In app/utils/lazy_loader.py
torch = LazyPackageExport("torch")
transformers = LazyPackageExport("transformers")
```

### 2. On-Demand Loading

When you access any attribute of these proxies, they load the real package:

```python
# This triggers the actual import
_ = torch.__version__  # Loads torch now
_ = transformers.__version__  # Loads transformers now
```

### 3. Caching

Once loaded, the package stays in memory for future use:

```python
# First access - loads torch
model = torch.nn.Linear(10, 5)

# Second access - uses cached torch
tensor = torch.tensor([1, 2, 3])  # No loading needed
```

## Common Usage Patterns

### Basic Package Access

```python
from app.utils.lazy_loader import torch, transformers, sklearn

# Use exactly like normal imports
model = torch.nn.Linear(10, 5)
tokenizer = transformers.AutoTokenizer.from_pretrained("bert-base-uncased")
pca = sklearn.decomposition.PCA(n_components=2)
```

### Torch Components

```python
from app.utils.lazy_loader import torch, F, nn, checkpoint

# F is torch.nn.functional
output = F.relu(input)

# nn is torch.nn
layer = nn.Linear(10, 5)

# checkpoint is torch.utils.checkpoint
saved_output = checkpoint.checkpoint(model, input)
```

### Image Processing with Plugins

```python
from app.utils.lazy_loader import get_pil_image_with_plugins, check_image_plugin_support

Image = get_pil_image_with_plugins()

# Check for modern image format support
if check_image_plugin_support("jxl"):
    img = Image.open("image.jxl")  # JPEG XL support
elif check_image_plugin_support("avif"):
    img = Image.open("image.avif")  # AVIF support
else:
    img = Image.open("image.jpg")  # Fallback to JPEG
```

## What Packages Are Available?

The system pre-registers these common packages:

### Core ML Packages

- `torch` - PyTorch
- `torchvision` - PyTorch vision models
- `transformers` - Hugging Face transformers
- `timm` - Image models
- `tensorflow` - TensorFlow
- `sklearn` - Scikit-learn
- `ultralytics` - YOLO models

### Data Science

- `numpy` - Numerical computing
- `pandas` - Data manipulation
- `matplotlib` - Plotting
- `seaborn` - Statistical plotting
- `tslearn` - Time series learning

### Image Processing

- `PIL` - Python Imaging Library
- `cv2` - OpenCV
- `pillow_jxl` - JPEG XL support
- `pillow_avif` - AVIF support

### Utilities

- `safetensors` - Safe tensor serialization
- `einops` - Einstein operations
- `pygit2` - Git operations
- `watchfiles` - File watching
- `sqlalchemy` - Database ORM

## Performance Benefits

### Startup Time

- **Before**: 5-10 seconds to start the app
- **After**: 1-2 seconds to start the app

### Load Times (examples)

- `torch`: 5.8 seconds (heaviest)
- `transformers`: 0.9 seconds
- `sklearn`: 1.5 seconds
- `numpy`: 0.0 seconds (very fast)

## Background Loading

The system can also load packages in the background during startup:

```python
from app.utils.lazy_loader import initialize_lazy_loading

# Initialize the system
loader = initialize_lazy_loading()

# Start background loading (optional)
await loader.start_background_loading()
```

This loads packages with different priorities:

- **Priority 1**: `torch`, `numpy`, `PIL` (load first)
- **Priority 2**: `transformers`, `torchvision` (load second)
- **Priority 3**: `tensorflow`, `sklearn` (load last)

## Monitoring

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

## Error Handling

If a package isn't available, you'll get a clear error:

```python
from app.utils.lazy_loader import nonexistent_package

try:
    _ = nonexistent_package.some_attribute
except ImportError as e:
    print(f"Package not available: {e}")
```

## Migration Guide

To migrate existing code:

1. **Find heavy imports**:

   ```python
   # Old way
   import torch
   import torch.nn.functional as F
   from transformers import AutoModel
   ```

2. **Replace with lazy imports**:

   ```python
   # New way
   from app.utils.lazy_loader import torch, F, transformers
   ```

3. **Test thoroughly** - the behavior should be identical

## Common Mistakes

### ❌ Don't do this - Direct imports

```python
# This loads torch immediately
import torch
model = torch.nn.Linear(10, 5)
```

### ✅ Do this instead - Lazy imports

```python
# This loads torch only when first accessed
from app.utils.lazy_loader import torch
model = torch.nn.Linear(10, 5)  # torch loads here
```

### ❌ Don't do this - Transformers imports

```python
# This loads transformers immediately
from transformers import AutoModel
model = AutoModel.from_pretrained("bert-base-uncased")
```

### ✅ Do this instead - Lazy transformers

```python
# This loads transformers only when first accessed
from app.utils.lazy_loader import transformers
model = transformers.AutoModel.from_pretrained("bert-base-uncased")  # transformers loads here
```

## Thread Safety

The system is thread-safe - multiple threads can safely access the same package:

```python
import threading
from app.utils.lazy_loader import torch

def worker():
    _ = torch.__version__  # Safe to call from multiple threads

threads = [threading.Thread(target=worker) for _ in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()
# torch is only loaded once, all threads get the same instance
```

## Summary

The lazy loading system makes your app start faster by:

1. **Delaying imports** until they're actually needed
2. **Providing proxy objects** that look like real packages
3. **Loading on first access** and caching for future use
4. **Supporting background loading** for common packages
5. **Maintaining thread safety** for concurrent access

The key insight is that you use the lazy-loaded packages exactly like normal imports - the only difference is when they get loaded (on-demand vs. at startup).
