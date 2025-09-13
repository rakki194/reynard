# Reynard Annotating

Unified annotation system for Reynard with production features and
modular architecture. This package integrates all caption generators into a single, easy-to-use interface.

## Features

- **Backend Integration**: Interfaces with FastAPI backend for caption generation
- **Simplified Architecture**: No complex local model management
- **Type Safety**: Full TypeScript support with comprehensive types
- **Event System**: Real-time event handling for caption lifecycle
- **Configuration Packages**: Individual packages for generator configurations
- **Easy Migration**: Simple migration from legacy local mode

## Installation

```bash
npm install reynard-annotating
```

## Quick Start

### Backend Mode (Recommended)

```typescript
import {
  createBackendAnnotationManager,
  DEFAULT_BACKEND_CONFIG,
  type CaptionTask,
} from "reynard-annotating";

// Create backend manager that interfaces with FastAPI backend
const manager = createBackendAnnotationManager({
  ...DEFAULT_BACKEND_CONFIG,
  baseUrl: "http://localhost:8000", // Your FastAPI backend URL
});

// Initialize connection to backend
await manager.initialize();

// Generate captions using different generators
const furryTags = await manager.generateFurryTags("/path/to/image.jpg");
const detailedCaption =
  await manager.generateDetailedCaption("/path/to/image.jpg");
const animeTags = await manager.generateAnimeTags("/path/to/image.jpg");

// Or use the service directly
const service = manager.getService();
const task: CaptionTask = {
  imagePath: "/path/to/image.jpg",
  generatorName: "jtp2",
  config: { threshold: 0.2 },
};

const result = await service.generateCaption(task);
console.log("Generated caption:", result.caption);

// Monitor system health
const health = manager.getHealthStatus();
console.log("System healthy:", health.isHealthy);

// Cleanup
await manager.shutdown();
```

## Architecture

The Reynard Annotating system now uses a clean backend-integrated architecture:

```
reynard-annotating/
├── annotating-core/          # Core functionality and FastAPI client
│   ├── clients/             # FastAPI client for backend communication
│   ├── services/            # Backend annotation services
│   ├── types/               # TypeScript definitions and interfaces
│   └── utils/               # Shared utilities
├── annotating-jtp2/          # JTP2 configuration package
│   └── config/              # Configuration schemas and defaults
├── annotating-joy/           # JoyCaption configuration package
│   └── config/              # Configuration schemas and defaults
├── annotating-florence2/     # Florence2 configuration package
│   └── config/              # Configuration schemas and defaults
├── annotating-wdv3/          # WDv3 configuration package
│   └── config/              # Configuration schemas and defaults
└── annotating/               # Unified interface (this package)
    ├── BackendAnnotationManager.ts  # Main backend manager
    └── MIGRATION.md          # Migration guide from legacy system
```

## Available Generators

### JTP2 (Joint Tagger Project PILOT2)

- **Purpose**: Furry artwork tagging
- **Category**: Lightweight
- **Specialization**: High accuracy for furry content
- **Usage**: `manager.generateFurryTags(imagePath)`

### JoyCaption

- **Purpose**: Detailed image captioning
- **Category**: Heavy
- **Specialization**: Multilingual, detailed descriptions
- **Usage**: `manager.generateDetailedCaption(imagePath)`

### Florence2

- **Purpose**: General purpose captioning
- **Category**: Heavy
- **Specialization**: Multiple tasks, versatile
- **Usage**: `manager.generateGeneralCaption(imagePath)`

### WDv3 (Waifu Diffusion v3)

- **Purpose**: Anime/manga tagging
- **Category**: Lightweight
- **Specialization**: Danbooru-style tags
- **Usage**: `manager.generateAnimeTags(imagePath)`

## Production Features

### Usage Tracking

```typescript
// Get usage statistics for any model
const stats = manager.getModelUsageStats("jtp2");
console.log("Total requests:", stats?.totalRequests);
console.log("Success rate:", stats?.successfulRequests / stats?.totalRequests);
console.log("Average processing time:", stats?.averageProcessingTime);
```

### Health Monitoring

```typescript
// Get system health
const health = manager.getHealthStatus();
console.log("System healthy:", health.isHealthy);
console.log("Performance metrics:", health.performance);

// Get model-specific health
const modelHealth = manager.getModelManager().getHealthStatus("jtp2");
console.log("Model healthy:", modelHealth?.isHealthy);
```

### Event System

```typescript
// Listen to all annotation events
manager.addEventListener((event) => {
  switch (event.type) {
    case "model_loaded":
      console.log("Model loaded:", event.data.modelName);
      break;
    case "caption_completed":
      console.log("Caption generated:", event.data.result.caption);
      break;
    case "batch_progress":
      console.log("Batch progress:", event.data.progress + "%");
      break;
  }
});
```

### System Statistics

```typescript
// Get comprehensive system statistics
const stats = manager.getSystemStatistics();
console.log("Total processed:", stats.totalProcessed);
console.log("Loaded models:", stats.loadedModels);
console.log("Queue status:", stats.queueStatus);
console.log("Health status:", stats.healthStatus);
```

## Configuration

```typescript
const config = {
  maxConcurrentDownloads: 2, // Max concurrent model downloads
  maxConcurrentLoads: 4, // Max concurrent model loads
  downloadTimeout: 300000, // Download timeout (5 minutes)
  loadTimeout: 60000, // Load timeout (1 minute)
  autoUnloadDelay: 300000, // Auto-unload delay (5 minutes)
  healthCheckInterval: 30000, // Health check interval (30 seconds)
  usageTrackingEnabled: true, // Enable usage tracking
  preloadEnabled: true, // Enable model preloading
  preloadModels: ["jtp2", "wdv3"], // Models to preload
};

const manager = createUnifiedAnnotationManager(config);
```

## Advanced Usage

### Custom Generator Integration

```typescript
import { registerJTP2Plugin } from "reynard-annotating-jtp2";

// Get specific generator
const jtp2Generator = await manager.getJTP2Generator();
console.log("JTP2 features:", jtp2Generator?.features);

// Use generator directly
if (jtp2Generator) {
  await jtp2Generator.load();
  const caption = await jtp2Generator.generate("/path/to/image.jpg");
  await jtp2Generator.unload();
}
```

### Batch Processing

#### Programmatic Batch Processing

```typescript
const tasks = [
  { imagePath: "/path/to/image1.jpg", generatorName: "jtp2" },
  { imagePath: "/path/to/image2.jpg", generatorName: "joycaption" },
  { imagePath: "/path/to/image3.jpg", generatorName: "wdv3" },
];

const results = await service.generateBatchCaptions(tasks, (progress) => {
  console.log(
    `Progress: ${progress.progress}% (${progress.completed}/${progress.total})`,
  );
});
```

#### Interactive Batch Processing UI

```typescript
import { BatchCaptionProcessor, createAnnotationManager } from "reynard-annotating";

const manager = createAnnotationManager({
  baseUrl: "http://localhost:8000"
});

await manager.initialize();

<BatchCaptionProcessor
  manager={manager}
  onComplete={(results) => console.log("Batch completed!", results)}
  onError={(error) => console.error("Batch failed:", error)}
/>
```

**Batch Processing Features:**

- **Drag & Drop Upload**: Intuitive file selection with visual feedback
- **Real-time Progress**: Live updates during batch processing with progress bars
- **Multiple Generators**: Support for all available caption generators
- **Configuration Options**: Concurrency control, force regeneration, post-processing
- **Error Handling**: Comprehensive error tracking and recovery
- **Results Export**: JSON export of all generated captions
- **Responsive Design**: Works on desktop and mobile devices

### Model Management

```typescript
// Preload specific models
await manager.preloadModel("jtp2");
await manager.preloadModel("joycaption");

// Check if models are loaded
const loadedModels = manager.getModelManager().getLoadedModels();
console.log("Loaded models:", loadedModels);

// Unload models when done
await manager.unloadModel("jtp2");
```

## API Reference

### UnifiedAnnotationManager

Main entry point for the unified annotation system.

#### Methods

- `initialize()`: Initialize the manager with all generators
- `shutdown()`: Shutdown the manager and cleanup resources
- `getService()`: Get the annotation service
- `getAvailableGenerators()`: Get all available generators
- `isGeneratorAvailable(name)`: Check if a generator is available
- `preloadModel(name)`: Preload a specific model
- `unloadModel(name)`: Unload a specific model
- `getModelUsageStats(name)`: Get usage statistics for a model
- `getHealthStatus()`: Get system health status
- `getConfiguration()`: Get current configuration
- `updateConfiguration(config)`: Update configuration
- `getSystemStatistics()`: Get comprehensive system statistics
- `addEventListener(listener)`: Add event listener
- `removeEventListener(listener)`: Remove event listener

#### Convenience Methods

- `generateFurryTags(imagePath, config?)`: Generate furry tags using JTP2
- `generateDetailedCaption(imagePath, config?)`: Generate detailed caption using JoyCaption
- `generateAnimeTags(imagePath, config?)`: Generate anime tags using WDv3
- `generateGeneralCaption(imagePath, config?)`: Generate general caption using Florence2
- `getJTP2Generator()`: Get JTP2 generator instance
- `getJoyCaptionGenerator()`: Get JoyCaption generator instance
- `getFlorence2Generator()`: Get Florence2 generator instance
- `getWDv3Generator()`: Get WDv3 generator instance

### Package Dependencies

- **annotating-core**: Base package with FastAPI client and shared utilities
- **annotating-{generator}**: Each generator package provides only configuration schemas
- **annotating**: Main package that provides the BackendAnnotationManager

### Key Architectural Principles

1. **Backend Integration**: All actual model processing happens on the FastAPI backend
2. **Configuration Only**: Frontend packages only provide configuration schemas
3. **Clean Separation**: Clear separation between frontend configuration and backend processing
4. **Production Features**: Built-in health monitoring, circuit breakers, and usage tracking
5. **Type Safety**: Full TypeScript support with comprehensive type definitions
6. **Event-Driven**: Comprehensive event system for monitoring and debugging

## License

MIT
