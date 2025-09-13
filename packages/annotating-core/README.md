# Reynard Annotating Core

Core annotation and caption generation system for Reynard with production features including usage tracking,
download coordination, request queuing, circuit breakers, and health monitoring.

## Features

- **Enhanced Model Management**: Smart loading, usage tracking, and lifecycle management
- **Production Features**: Circuit breakers, request queuing, download coordination
- **Health Monitoring**: Real-time health checks and performance metrics
- **Event System**: Comprehensive event handling for all annotation operations
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Plugin Architecture**: Extensible plugin system for adding new generators

## Installation

```bash
npm install reynard-annotating-core
```

## Quick Start

```typescript
import {
  createAnnotationManager,
  DEFAULT_CONFIG,
  type CaptionTask,
  type CaptionResult,
} from "reynard-annotating-core";

// Create annotation manager with production features
const manager = createAnnotationManager({
  ...DEFAULT_CONFIG,
  usageTrackingEnabled: true,
  healthCheckInterval: 30000,
  preloadEnabled: true,
  preloadModels: ["jtp2", "wdv3"],
});

// Start the manager
await manager.start();

// Get the annotation service
const service = manager.getService();

// Generate a caption
const task: CaptionTask = {
  imagePath: "/path/to/image.jpg",
  generatorName: "jtp2",
  config: { threshold: 0.2 },
  postProcess: true,
};

const result: CaptionResult = await service.generateCaption(task);
console.log("Generated caption:", result.caption);

// Generate captions in batch with progress tracking
const tasks: CaptionTask[] = [
  { imagePath: "/path/to/image1.jpg", generatorName: "jtp2" },
  { imagePath: "/path/to/image2.jpg", generatorName: "joycaption" },
];

const results = await service.generateBatchCaptions(tasks, (progress) => {
  console.log(
    `Progress: ${progress.progress}% (${progress.completed}/${progress.total})`,
  );
});

// Get system statistics
const stats = manager.getSystemStatistics();
console.log("System health:", stats.isHealthy);
console.log("Loaded models:", stats.loadedModels);
console.log("Queue status:", stats.queueStatus);

// Monitor events
manager.addEventListener((event) => {
  console.log("Annotation event:", event.type, event.data);
});

// Cleanup
await manager.stop();
```

## Production Features

### Model Usage Tracking

```typescript
// Get usage statistics for a specific model
const usageStats = service.getModelUsageStats("jtp2");
console.log("Total requests:", usageStats?.totalRequests);
console.log(
  "Success rate:",
  usageStats?.successfulRequests / usageStats?.totalRequests,
);
console.log("Average processing time:", usageStats?.averageProcessingTime);
```

### Health Monitoring

```typescript
// Get health status
const healthStatus = service.getHealthStatus();
console.log("System healthy:", healthStatus.isHealthy);
console.log("Performance metrics:", healthStatus.performance);

// Get health status for specific model
const modelHealth = manager.getModelManager().getHealthStatus("jtp2");
console.log("Model healthy:", modelHealth?.isHealthy);
console.log("Issues:", modelHealth?.issues);
```

### Circuit Breakers

```typescript
// Check circuit breaker state
const circuitState = manager.getModelManager().getCircuitBreakerState("jtp2");
console.log("Circuit state:", circuitState?.state);
console.log("Failure count:", circuitState?.failureCount);
```

### Request Queuing

```typescript
// Get queue status
const queueStatus = manager.getModelManager().getQueueStatus();
console.log("Total queued:", queueStatus.totalQueued);
console.log("Queued by model:", queueStatus.queuedByModel);
console.log("Average wait time:", queueStatus.averageWaitTime);
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
  preloadEnabled: false, // Enable model preloading
  preloadModels: [], // Models to preload
};
```

## Event System

The system provides comprehensive event handling:

```typescript
// Model events
manager.addEventListener((event) => {
  if (event.type === "model_loaded") {
    console.log("Model loaded:", event.data.modelName);
  } else if (event.type === "model_error") {
    console.log("Model error:", event.data.error);
  }
});

// Caption events
manager.addEventListener((event) => {
  if (event.type === "caption_started") {
    console.log("Caption generation started for:", event.data.task.imagePath);
  } else if (event.type === "caption_completed") {
    console.log("Caption completed:", event.data.result.caption);
  }
});

// Batch events
manager.addEventListener((event) => {
  if (event.type === "batch_progress") {
    console.log(`Batch progress: ${event.data.progress}%`);
  }
});
```

## Plugin System

The core system is designed to work with
generator plugins. Each generator package provides a plugin registration function:

```typescript
import { registerJTP2Plugin } from "reynard-annotating-jtp2";
import { registerJoyCaptionPlugin } from "reynard-annotating-joy";
import { registerFlorence2Plugin } from "reynard-annotating-florence2";
import { registerWDv3Plugin } from "reynard-annotating-wdv3";

// Register plugins
const jtp2Plugin = registerJTP2Plugin();
const joyPlugin = registerJoyCaptionPlugin();
const florence2Plugin = registerFlorence2Plugin();
const wdv3Plugin = registerWDv3Plugin();

// Register generators with the manager
await manager.registerGenerator(jtp2Plugin.getGenerator());
await manager.registerGenerator(joyPlugin.getGenerator());
await manager.registerGenerator(florence2Plugin.getGenerator());
await manager.registerGenerator(wdv3Plugin.getGenerator());
```

### Available Generator Plugins

- **JTP2 Plugin** (`reynard-annotating-jtp2`): Specialized for furry artwork tagging
- **JoyCaption Plugin** (`reynard-annotating-joy`): Multilingual LLM-based captioning
- **Florence2 Plugin** (`reynard-annotating-florence2`): General purpose image captioning
- **WDv3 Plugin** (`reynard-annotating-wdv3`): Danbooru-style tagging with multiple architectures

## API Reference

### EnhancedAnnotationManager

Main entry point for the annotation system.

#### Methods

- `start()`: Start the annotation manager
- `stop()`: Stop the annotation manager
- `getService()`: Get the annotation service
- `getAvailableGenerators()`: Get all available generators
- `isGeneratorAvailable(name)`: Check if a generator is available
- `preloadModel(name)`: Preload a specific model
- `unloadModel(name)`: Unload a specific model
- `getModelUsageStats(name)`: Get usage statistics for a model
- `getHealthStatus()`: Get system health status
- `getConfiguration()`: Get current configuration
- `updateConfiguration(config)`: Update configuration
- `addEventListener(listener)`: Add event listener
- `removeEventListener(listener)`: Remove event listener

### EnhancedAnnotationService

Service for caption generation operations.

#### Methods

- `generateCaption(task)`: Generate caption for single image
- `generateBatchCaptions(tasks, progressCallback)`: Generate captions for multiple images
- `getAvailableGenerators()`: Get available generators
- `getGenerator(name)`: Get specific generator
- `isGeneratorAvailable(name)`: Check generator availability
- `preloadModel(name)`: Preload model
- `unloadModel(name)`: Unload model
- `getModelUsageStats(name)`: Get model usage statistics
- `getHealthStatus()`: Get health status

## Types

### CaptionTask

```typescript
interface CaptionTask {
  imagePath: string;
  generatorName: string;
  config?: Record<string, any>;
  postProcess?: boolean;
  force?: boolean;
  priority?: number;
  metadata?: Record<string, any>;
}
```

### CaptionResult

```typescript
interface CaptionResult {
  imagePath: string;
  generatorName: string;
  success: boolean;
  caption?: string;
  error?: string;
  errorType?: ErrorType;
  retryable?: boolean;
  processingTime?: number;
  captionType?: CaptionType;
  metadata?: Record<string, any>;
  timestamp?: Date;
}
```

### ModelUsageStats

```typescript
interface ModelUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  lastUsed: Date;
  memoryUsage?: number;
  gpuUsage?: number;
}
```

## Package Structure

The annotating-core package is organized into three main directories:

```
annotating-core/
├── managers/                 # Core management components
│   ├── CircuitBreaker.ts    # Circuit breaker pattern implementation
│   ├── DownloadCoordinator.ts # Model download coordination
│   ├── EventManager.ts      # Event system management
│   ├── HealthMonitor.ts     # System health monitoring
│   ├── ModelLifecycleManager.ts # Model loading/unloading lifecycle
│   ├── ModelManager.ts      # Central model management
│   ├── ModelUsageTracker.ts # Usage statistics and tracking
│   └── RequestQueue.ts      # Request queuing and processing
├── services/                # Service layer components
│   ├── AnnotationManager.ts # Main annotation manager
│   ├── AnnotationService.ts # Core annotation service
│   ├── BatchProcessor.ts    # Batch processing capabilities
│   ├── CaptionGenerator.ts  # Base caption generator interface
│   ├── EventSystem.ts       # Event system implementation
│   ├── HealthMonitor.ts     # Health monitoring service
│   ├── ModelService.ts      # Model service layer
│   ├── StatisticsService.ts # Statistics collection and reporting
│   └── ...                  # Additional service components
└── types/                   # TypeScript type definitions
    └── index.ts            # All type exports
```

### Key Components

- **Managers**: Handle system-level concerns like model lifecycle, health monitoring, and request queuing
- **Services**: Provide business logic for annotation operations, batch processing, and statistics
- **Types**: Comprehensive TypeScript definitions for all interfaces and data structures

## License

MIT
