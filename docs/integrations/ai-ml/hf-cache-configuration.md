# HuggingFace Cache Configuration

This document explains how to configure HuggingFace cache paths for Reynard, including Docker support and environment variable configuration.

## Overview

Reynard uses HuggingFace Hub for downloading and caching machine learning models. The cache location can be configured using environment variables to support different deployment scenarios, including Docker containers.

## Environment Variables

The following environment variables control the HuggingFace cache location:

### `HF_HOME` (Recommended)

- **Priority**: Highest
- **Description**: The main HuggingFace cache directory
- **Default**: `~/.cache/huggingface`
- **Example**: `/app/hf_cache` or `/data/huggingface`

### `HF_CACHE` (Alternative)

- **Priority**: Medium
- **Description**: Alternative cache directory variable
- **Default**: `~/.cache/huggingface`
- **Example**: `/app/hf_cache` or `/data/huggingface`

### Fallback

If neither `HF_HOME` nor `HF_CACHE` is set, the system defaults to `~/.cache/huggingface`.

## Local Development

### Basic Configuration

```bash
# Set HF cache to a custom directory
export HF_HOME=/path/to/your/hf_cache

# Or use HF_CACHE
export HF_CACHE=/path/to/your/hf_cache
```

### Example with Custom Directory

```bash
# Create a custom cache directory
mkdir -p ~/reynard_hf_cache

# Set environment variable
export HF_HOME=~/reynard_hf_cache

# Run Reynard
python -m app
```

## Docker Configuration

### Using Docker Compose

1. **Create a `.env` file** with your cache configuration:

   ```bash
   # .env
   HF_HOME=/app/hf_cache
   HF_CACHE_VOLUME=./hf_cache
   ```

2. **Use the provided Docker Compose configuration**:

   ```bash
   # Use the HF cache configuration
   docker-compose -f docker-compose.hf-cache.yml up

   # Or for development
   docker-compose -f docker-compose.hf-cache.yml up reynard-backend
   ```

### Manual Docker Run

```bash
# Create cache directory
mkdir -p ./hf_cache

# Run with volume mount
docker run -d \
  -p 7000:7000 \
  -v $(pwd)/data:/app/images \
  -v $(pwd)/hf_cache:/app/hf_cache \
  -e HF_HOME=/app/hf_cache \
  reynard:latest
```

### Docker Compose Examples

#### Development with Persistent Cache

```yaml
# docker-compose.override.yml
services:
  reynard-backend:
    environment:
      HF_HOME: /app/hf_cache
      HF_CACHE: /app/hf_cache
    volumes:
      - ./hf_cache:/app/hf_cache
```

#### Production with Named Volume

```yaml
# docker-compose.prod.yml
services:
  reynard:
    environment:
      HF_HOME: /app/hf_cache
    volumes:
      - hf_cache:/app/hf_cache

volumes:
  hf_cache:
    driver: local
```

## Cache Directory Structure

The HuggingFace cache follows this structure:

```text
{HF_HOME}/
├── hub/
│   ├── models--RedRocket--JointTaggerProject/
│   │   └── snapshots/
│   │       └── main/
│   │           ├── JTP_PILOT2-e3-vit_so400m_patch14_siglip_384.safetensors
│   │           └── tags.json
│   ├── models--fancyfeast--llama-joycaption-beta-one-hf-llava/
│   │   └── snapshots/
│   │       └── main/
│   │           ├── config.json
│   │           ├── pytorch_model.bin
│   │           └── ...
│   └── models--fancyfeast--joycaption-watermark-detection/
│       └── snapshots/
│           └── main/
│               ├── yolo11x-train28-best.pt
│               └── far5y1y5-8000.pt
└── ...
```

## Model Downloads

The following models are automatically downloaded to the HF cache:

1. **JTP2 Model** (`RedRocket/JointTaggerProject`)
   - Model file: `JTP_PILOT2-e3-vit_so400m_patch14_siglip_384.safetensors`
   - Tags file: `tags.json`

2. **JoyCaption Model** (`fancyfeast/llama-joycaption-beta-one-hf-llava`)
   - Complete model files for LLaVA-based caption generation

3. **Watermark Detection Models** (`fancyfeast/joycaption-watermark-detection`)
   - YOLO model: `yolo11x-train28-best.pt`
   - OWLv2 model: `far5y1y5-8000.pt`

## Benefits

### Persistent Storage

- Models are cached and persist across container restarts
- No need to re-download models on every deployment

### Shared Cache

- Multiple containers can share the same cache directory
- Reduces storage requirements and download time

### Flexible Configuration

- Environment variable support allows easy configuration
- Works seamlessly in local, Docker, and cloud environments

### Performance

- Faster startup times after initial model download
- Reduced bandwidth usage for repeated deployments

## Troubleshooting

### Cache Permission Issues

```bash
# Ensure proper permissions for Docker
sudo chown -R 1000:1000 ./hf_cache

# Or set UID/GID in Docker Compose
export UID=$(id -u)
export GID=$(id -g)
```

### Cache Location Verification

```bash
# Check current cache location
python -c "from app.utils.hf_cache import get_hf_cache_dir; print(get_hf_cache_dir())"

# List cached models
ls -la $(python -c "from app.utils.hf_cache import get_hf_cache_dir; print(get_hf_cache_dir())")/hub/
```

### Clearing Cache

```bash
# Remove specific model cache
rm -rf ~/.cache/huggingface/hub/models--fancyfeast--llama-joycaption-beta-one-hf-llava

# Clear entire cache (use with caution)
rm -rf ~/.cache/huggingface
```

## Best Practices

1. **Use Named Volumes** for production deployments
2. **Set HF_HOME** explicitly in Docker environments
3. **Monitor Cache Size** as models can be large (several GB)
4. **Backup Cache** for critical deployments
5. **Use Bind Mounts** for development to easily inspect cache contents
