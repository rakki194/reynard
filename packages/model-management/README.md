# reynard-model-management

A comprehensive model management system for Reynard applications that handles ML model registration, downloading, loading, and lifecycle management.

## Features

- **Model Registry**: Centralized registration and discovery of ML models
- **Download Management**: Concurrent model downloading with progress tracking
- **Model Loading**: Lifecycle management for loaded models
- **Health Monitoring**: Built-in health checks for loaded models
- **Event System**: Comprehensive event system for model lifecycle events
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install reynard-model-management
```

## Quick Start

```typescript
import {
  ModelManager,
  ModelType,
  ModelStatus,
  ModelHealth,
} from "reynard-model-management";

// Create model manager
const modelManager = new ModelManager({
  maxConcurrentDownloads: 3,
  maxConcurrentLoads: 2,
  downloadTimeout: 300000,
  loadTimeout: 120000,
});

// Register a model
modelManager.registerModel({
  modelId: "my-caption-model",
  modelType: ModelType.CAPTION_GENERATOR,
  repoId: "my-org/my-caption-model",
  description: "A caption generation model",
  totalSizeEstimate: 500_000_000, // 500MB
  fileCountEstimate: 3,
});

// Download the model
await modelManager.downloadModel("my-caption-model", (progress) => {
  console.log(`Download progress: ${progress.progress}%`);
});

// Load the model
const instance = await modelManager.loadModel("my-caption-model", {
  threshold: 0.2,
  forceCpu: false,
});

console.log("Model loaded:", instance);

// Check model health
const health = modelManager.getModelHealth("my-caption-model");
console.log("Model health:", health);

// Unload the model
await modelManager.unloadModel("my-caption-model");
```

## API Reference

### ModelManager

The main orchestrator for model management.

#### ModelManager Constructor

```typescript
new ModelManager(config?: ModelManagerConfig)
```

#### Methods

- `registerModel(modelInfo: ModelInfo): void` - Register a model
- `downloadModel(modelId: string, progressCallback?: (progress: ModelDownloadProgress) => void): Promise<void>` - Download a model
- `loadModel(modelId: string, config?: Record<string, any>): Promise<ModelInstance>` - Load a model
- `unloadModel(modelId: string): Promise<void>` - Unload a model
- `getModelInfo(modelId: string): ModelInfo | undefined` - Get model information
- `getModelInstance(modelId: string): ModelInstance | undefined` - Get loaded model instance
- `isModelAvailable(modelId: string): boolean` - Check if model is available
- `isModelLoaded(modelId: string): boolean` - Check if model is loaded
- `getModelStatus(modelId: string): ModelStatus` - Get model status
- `getModelHealth(modelId: string): ModelHealth` - Get model health

### BaseModel

Abstract base class that all model implementations must extend.

#### BaseModel Constructor

```typescript
constructor(modelId: string, modelType: ModelType, config: Record<string, any> = {})
```

#### Abstract Methods

- `download(): Promise<void>` - Download the model
- `load(config?: Record<string, any>): Promise<void>` - Load the model
- `unload(): Promise<void>` - Unload the model
- `healthCheck(): Promise<ModelHealth>` - Perform health check
- `isAvailable(): Promise<boolean>` - Check if model is available

#### Properties

- `modelId: string` - Model identifier
- `modelType: ModelType` - Model type
- `status: ModelStatus` - Current model status
- `health: ModelHealth` - Current model health
- `config: Record<string, any>` - Model configuration

### Types

#### ModelType

```typescript
enum ModelType {
  CAPTION_GENERATOR = "caption_generator",
  DETECTION_MODEL = "detection_model",
  EMBEDDING_MODEL = "embedding_model",
  DIFFUSION_LM = "diffusion_lm",
  CLASSIFICATION_MODEL = "classification_model",
}
```

#### ModelStatus

```typescript
enum ModelStatus {
  NOT_DOWNLOADED = "not_downloaded",
  DOWNLOADING = "downloading",
  DOWNLOADED = "downloaded",
  LOADING = "loading",
  LOADED = "loaded",
  ERROR = "error",
}
```

#### ModelHealth

```typescript
enum ModelHealth {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  UNHEALTHY = "unhealthy",
  UNKNOWN = "unknown",
}
```

## Advanced Usage

### Event Handling

```typescript
modelManager.addEventListener((event) => {
  console.log("Model event:", event);
});
```

### Custom Model Implementation

```typescript
import { BaseModel, ModelType, ModelHealth } from "reynard-model-management";

class MyCaptionModel extends BaseModel {
  constructor() {
    super("my-caption-model", ModelType.CAPTION_GENERATOR, {
      threshold: 0.2,
      forceCpu: false,
    });
  }

  async download(): Promise<void> {
    // Implement model download logic
  }

  async load(config?: Record<string, any>): Promise<void> {
    // Implement model loading logic
  }

  async unload(): Promise<void> {
    // Implement model unloading logic
  }

  async healthCheck(): Promise<ModelHealth> {
    // Implement health check logic
    return ModelHealth.HEALTHY;
  }

  async isAvailable(): Promise<boolean> {
    // Check if model files exist
    return true;
  }
}
```

### Model Configuration

```typescript
// Update model configuration
modelManager.updateModelConfig("my-caption-model", {
  threshold: 0.3,
  batchSize: 8,
});

// Get model configuration
const instance = modelManager.getModelInstance("my-caption-model");
console.log("Model config:", instance?.config);
```

### Statistics and Monitoring

```typescript
// Get model manager statistics
const stats = modelManager.getStatistics();
console.log("Total models:", stats.totalModels);
console.log("Loaded models:", stats.loadedModels);
console.log("Active downloads:", stats.activeDownloads);

// Get model manager state
const state = modelManager.getState();
console.log("Manager state:", state);
```

## License

MIT
