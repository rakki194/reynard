# Model Management System

This document describes the comprehensive model management system in yipyap,
which provides administrators with a centralized interface for configuring and
managing all AI models used by the application.

## Overview

The Model Management system is an admin-only feature that allows administrators
to:

- View and manage all registered models (JTP2, WDv3, Florence2, YOLO, etc.)
- Configure model parameters and settings
- Monitor download progress and status
- Manage HuggingFace cache
- Configure Ollama models
- Start and manage model downloads

## Access Control

The Model Management interface is only accessible to users with the `admin`
role. Regular users and guests cannot access this functionality.

### Accessing Model Management

1. Log in as an administrator
2. Open the Settings panel
3. Look for the "Model Management" tab (only visible to admins)
4. Click on the tab to access the model management interface

## Interface Overview

The Model Management interface is organized into six main tabs:

### 1. Overview Tab

The Overview tab provides a high-level summary of all models and system status:

- **Total Models**: Number of registered models
- **Downloaded**: Number of models ready to use
- **Ollama Models**: Number of local Ollama models
- **Cache Size**: Total size of HuggingFace cache

Quick action buttons allow administrators to:

- Refresh all data
- Navigate to download management
- Access cache management

### 2. Caption Models Tab

This tab provides configuration options for caption generation models:

#### JTP2 Configuration

- **Threshold**: Confidence threshold for tag inclusion (0.0 to 1.0)
- **Force CPU**: Force JTP2 to use CPU instead of GPU
- **Model Path**: Path to JTP2 model file
- **Tags Path**: Path to JTP2 tags file

#### WDv3 Configuration

- **Model Architecture**: Select from ViT, SwinV2, ConvNeXT, or ConvNeXTv2
- **General Threshold**: Confidence threshold for general tags (0.0 to 1.0)
- **Character Threshold**: Confidence threshold for character tags (0.0 to 1.0)
- **Force CPU**: Force WDv3 to use CPU instead of GPU

#### Florence2 Configuration

- **Model Variant**: Select from various Florence2 model variants
- **Max Tokens**: Maximum number of tokens for generation (1-512)
- **Use GPU**: Enable/disable GPU acceleration
- **Precision**: Select precision mode (FP16, FP32, BF16)

### 3. Detection Models Tab

This tab manages object detection and vision models:

#### YOLO Configuration

- **Model Size**: Select from Nano, Small, Medium, Large, or Extra Large
- **Confidence Threshold**: Detection confidence threshold (0.0 to 1.0)
- **IoU Threshold**: Intersection over Union threshold (0.0 to 1.0)

#### Detection Models Status

Shows the status of all registered detection models:

- Model information and description
- Download status and progress
- Download/retry buttons for failed downloads

### 4. Ollama Models Tab

This tab manages local Ollama models:

#### Ollama Service Status

- **Service Status**: Shows if Ollama service is available
- **Assistant Availability**: Indicates if the assistant is ready

#### Installed Ollama Models

Lists all locally installed Ollama models with:

- Model name and size
- Last modification date
- Model digest

#### Pull New Model

Allows administrators to pull new models from the Ollama registry:

- Enter model name (e.g., `llama2:7b`)
- Click "Pull Model" to start download

### 5. HF Cache Tab

This tab manages the HuggingFace cache:

#### Cache Information

- **Cache Directory**: Path to the HF cache
- **Total Size**: Total size of cached models
- **Model Count**: Number of cached models

#### Cache Actions

- **Refresh**: Update cache information
- **Clear Cache**: Remove all cached models (use with caution)

#### Cached Models

Lists all models in the HF cache with:

- Model name and size
- Last accessed date

### 6. Downloads Tab

This tab provides detailed download management:

#### Model Download Status

For each registered model, shows:

- Model information and description
- Repository ID
- Estimated size
- Current download status
- Progress bar and percentage
- Download speed and ETA
- Error messages (if any)

#### Download Actions

- **Download**: Start download for models not yet downloaded
- **Retry**: Retry failed downloads
- **Refresh Status**: Update all download statuses

## Model Types

The system supports several types of models:

### Caption Generators and Text LLMs

- **JTP2**: Joint Tagger Project for specialized tagging
- **WDv3**: WD-1.4 Tagger v3 for general purpose tagging
- **Florence2**: Microsoft's vision-language model
- **DreamOn (Diffusion LLM)**: Diffusion-based text LLM supporting infilling and
  generation
- **LLaDA (Diffusion LLM)**: Diffusion-based text LLM with streaming generation
- **JoyCaption**: Large language model for image captioning

### Detection Models

- **YOLO**: Object detection models
- **Watermark Detection**: YOLO and OWLv2 models for watermark detection

### Local Models

- **Ollama Models**: Locally hosted language models

### Diffusion LLMs

These are registered under a dedicated type (e.g., `diffusion_lm`) and are
available for download via the unified model download manager. In the UI,
DreamOn and LLaDA appear with their IDs and can be loaded from the Diffusion LLM
panels or from admin-only model loading routes.

Admin endpoints include:

- `GET /api/diffusion/models`
- `POST /api/diffusion/models/{model_id}/load`

## Configuration Management

### Model Configuration Management

Each model type has specific configuration options that can be adjusted:

1. Navigate to the appropriate tab (Caption Models, Detection Models)
2. Modify the desired settings
3. Click the "Update [Model] Config" button
4. The system will apply the changes and show a success notification

### Environment Variables

Some model configurations can also be controlled via environment variables:

- `DISABLE_MODEL_DOWNLOADS`: Disable all model downloads
- `HF_HOME`: Set HuggingFace cache directory
- `HF_CACHE`: Alternative HF cache directory

## Download Management

### Starting Downloads

1. Navigate to the Downloads tab
2. Find the model you want to download
3. Click the "Download" button
4. Monitor progress in the status section

### Download Status

Downloads can have the following statuses:

- **not_started**: Model not yet downloaded
- **downloading**: Currently being downloaded
- **completed**: Successfully downloaded
- **failed**: Download failed
- **disabled**: Downloads disabled by configuration

### Progress Tracking

During downloads, the system shows:

- Progress bar with percentage
- Downloaded size vs total size
- Download speed
- Estimated time remaining

## Cache Management

### HF Cache Storage

The HF cache stores downloaded models for reuse:

- **Location**: Configured via `HF_HOME` or `HF_CACHE` environment variables
- **Structure**: Organized by model repository
- **Persistence**: Survives application restarts

### Cache Operations

- **View**: See cache size and contents
- **Clear**: Remove all cached models (frees disk space)
- **Refresh**: Update cache information

## Troubleshooting

### Common Issues

#### Model Downloads Fail

1. Check if `DISABLE_MODEL_DOWNLOADS` is set
2. Verify internet connectivity
3. Check available disk space
4. Review error messages in the Downloads tab

#### Ollama Service Unavailable

1. Ensure Ollama is installed and running
2. Check Ollama service status
3. Verify network connectivity to Ollama

#### Configuration Not Applied

1. Check for error messages in notifications
2. Verify admin permissions
3. Check backend logs for errors

### Error Messages

Common error messages and solutions:

- **"Model downloads are disabled"**: Set `DISABLE_MODEL_DOWNLOADS=false`
- **"Ollama service not available"**: Start Ollama service
- **"Failed to update config"**: Check backend logs for details

## Best Practices

### Model Management

1. **Monitor Cache Size**: Regularly check HF cache size to prevent disk space
   issues
2. **Test Configurations**: Test model configurations before applying to
   production
3. **Backup Configurations**: Document custom configurations for recovery
4. **Monitor Downloads**: Watch download progress for large models

### Performance

1. **GPU Usage**: Enable GPU acceleration when available for better performance
2. **Model Selection**: Choose appropriate model sizes for your use case
3. **Cache Management**: Keep frequently used models in cache
4. **Resource Monitoring**: Monitor system resources during model operations

### Security

1. **Admin Access**: Restrict model management to trusted administrators
2. **Network Security**: Ensure secure connections for model downloads
3. **Model Validation**: Verify model sources and integrity
4. **Access Logging**: Monitor model management activities

## API Reference

The Model Management system provides several API endpoints:

### Model Registry

- `GET /api/model-registry`: Get all registered models
- `GET /api/model-download-status/{model_id}`: Get download status
- `POST /api/model-download/{model_id}/start`: Start model download

### HuggingFace Cache

- `GET /api/hf-cache/info`: Get cache information
- `POST /api/hf-cache/clear`: Clear cache

### Model Configuration

- `GET /api/captioner-config/{name}`: Get captioner configuration
- `PUT /api/captioner-config/{name}`: Update captioner configuration

### Ollama Integration

- `GET /api/ollama/status`: Get Ollama service status
- `GET /api/ollama/models`: List Ollama models
- `POST /api/ollama/models/pull`: Pull Ollama model

All endpoints require admin authentication and return appropriate error
responses for unauthorized access.
