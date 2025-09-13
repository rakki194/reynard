# reynard-ai-shared

> **The Foundation of Reynard's AI/ML Ecosystem** 🦊

Shared utilities, base classes, and types for all AI/ML packages in the Reynard framework. This package provides the essential building blocks for building consistent, interoperable AI/ML services.

## ✨ Features

### 🎯 **Base Classes**

- **BaseAIService**: Abstract base class for all AI/ML services with lifecycle management, health monitoring, and error handling
- **BaseModel**: Abstract base class for all AI/ML models with loading, unloading, and configuration management
- **ServiceRegistry**: Central registry for managing AI/ML services with dependency resolution
- **ModelRegistry**: Central registry for managing AI/ML models with loading coordination

### 🛠️ **Utility Classes**

- **ValidationUtils**: Comprehensive validation utilities for data and configuration
- **PerformanceMonitor**: Performance monitoring and metrics collection
- **ErrorUtils**: Error handling, retry logic, and logging utilities
- **DataUtils**: Data processing, transformation, and formatting utilities
- **ProgressTracker**: Progress tracking for long-running operations

### 📊 **Type System**

- **Service Types**: ServiceStatus, ServiceHealth, ServiceHealthInfo, ServiceConfig
- **Model Types**: ModelStatus, ModelType, ModelInfo, ModelConfig
- **AI/ML Types**: CaptionTask, CaptionResult, EmbeddingResult, SearchResult
- **Error Types**: AIError, ModelError, ServiceError with context and codes
- **Utility Types**: AsyncResult, ProgressCallback, ValidationResult

## 📦 Installation

```bash
npm install reynard-ai-shared
```

## 🚀 Quick Start

### Basic Service Implementation

```typescript
import {
  BaseAIService,
  ServiceConfig,
  ServiceHealthInfo,
} from "reynard-ai-shared";

class MyAIService extends BaseAIService {
  constructor() {
    const config: ServiceConfig = {
      name: "my-ai-service",
      dependencies: ["database-service"],
      startupPriority: 50,
      autoStart: true,
    };
    super(config);
  }

  async initialize(): Promise<void> {
    // Initialize your service
    console.log("Initializing MyAI Service...");
  }

  async healthCheck(): Promise<ServiceHealthInfo> {
    // Perform health check
    return {
      status: this.status,
      health: this.health,
      lastCheck: new Date(),
      uptime: this.startupTime ? Date.now() - this.startupTime.getTime() : 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0,
      metadata: {},
    };
  }

  async shutdown(): Promise<void> {
    // Clean up resources
    console.log("Shutting down MyAI Service...");
  }
}

// Register and use the service
import { getServiceRegistry } from "reynard-ai-shared";

const registry = getServiceRegistry();
const service = new MyAIService();
registry.register(service);
await service.start();
```

### Basic Model Implementation

```typescript
import {
  BaseModel,
  ModelType,
  ModelInfo,
  ModelConfig,
} from "reynard-ai-shared";

class MyAIModel extends BaseModel {
  constructor() {
    super(
      "my-ai-model",
      "My AI Model",
      ModelType.CAPTION,
      "1.0.0",
      "A sample AI model for caption generation",
      {
        threshold: { type: "number", min: 0, max: 1, default: 0.5 },
        maxLength: { type: "number", min: 1, max: 512, default: 256 },
      },
    );
  }

  async load(config?: ModelConfig): Promise<void> {
    // Load your model
    console.log("Loading MyAI Model...");
    this._size = 1024 * 1024 * 100; // 100MB
    this._memoryUsage = 1024 * 1024 * 50; // 50MB
  }

  async unload(): Promise<void> {
    // Unload your model
    console.log("Unloading MyAI Model...");
    this._memoryUsage = 0;
  }

  async isAvailable(): Promise<boolean> {
    // Check if model is available
    return true;
  }

  async getModelInfo(): Promise<ModelInfo> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      version: this.version,
      description: this.description,
      status: this.status,
      size: this.size,
      memoryUsage: this.memoryUsage,
      gpuAcceleration: this.gpuAcceleration,
      supportedFormats: this.supportedFormats,
      configSchema: this.configSchema,
      metadata: this.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// Register and use the model
import { getModelRegistry } from "reynard-ai-shared";

const registry = getModelRegistry();
const model = new MyAIModel();
registry.register(model);
await model.loadModel({ threshold: 0.7 });
```

### Using Utilities

```typescript
import {
  ValidationUtils,
  PerformanceMonitor,
  ErrorUtils,
  DataUtils,
  ProgressTracker,
} from "reynard-ai-shared";

// Validation
const result = ValidationUtils.validateValue("test@example.com", {
  type: "string",
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  required: true,
});

// Performance monitoring
const timer = PerformanceMonitor.startTimer("my-operation");
// ... do work ...
const metrics = timer();

// Error handling with retry
const result = await ErrorUtils.retry(
  async () => {
    // Risky operation
    return await fetchData();
  },
  3, // max retries
  1000, // base delay
);

// Data processing
const cleanTags = DataUtils.cleanTags(["tag1", "TAG2", "tag1", "tag3"]);
const formattedSize = DataUtils.formatFileSize(1024 * 1024 * 5); // "5.00 MB"

// Progress tracking
const tracker = new ProgressTracker(100, (progress, message) => {
  console.log(`Progress: ${progress.toFixed(1)}% - ${message}`);
});

for (let i = 0; i < 100; i++) {
  // Do work
  tracker.increment(1, `Processing item ${i}`);
}
```

## 🏗️ Architecture

### Service Lifecycle

1. **Registration**: Services are registered with the ServiceRegistry
2. **Initialization**: Services are initialized in dependency order
3. **Health Monitoring**: Automatic health checks every 30 seconds
4. **Shutdown**: Graceful shutdown with cleanup

### Model Lifecycle

1. **Registration**: Models are registered with the ModelRegistry
2. **Loading**: Models are loaded on-demand or preloaded
3. **Usage**: Models are used for inference operations
4. **Unloading**: Models are unloaded to free memory

### Error Handling

- **Standardized Errors**: AIError, ModelError, ServiceError with context
- **Retry Logic**: Exponential backoff with configurable retries
- **Error Logging**: Structured error logging with context
- **Graceful Degradation**: Services continue operating despite errors

## 🔧 Configuration

### Service Configuration

```typescript
interface ServiceConfig {
  name: string;
  dependencies?: string[];
  requiredPackages?: string[];
  startupPriority?: number;
  healthCheckInterval?: number;
  autoStart?: boolean;
  config?: Record<string, any>;
}
```

### Model Configuration

```typescript
interface ModelConfig {
  threshold?: number;
  maxLength?: number;
  temperature?: number;
  batchSize?: number;
  gpuAcceleration?: boolean;
  postProcessing?: PostProcessingRules;
  [key: string]: any;
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 API Reference

### BaseAIService

- `start()`: Start the service
- `stop()`: Stop the service
- `restart()`: Restart the service
- `healthCheck()`: Perform health check
- `getServiceInfo()`: Get comprehensive service information
- `updateConfig(config)`: Update service configuration

### BaseModel

- `loadModel(config?)`: Load the model
- `unloadModel()`: Unload the model
- `reloadModel(config?)`: Reload the model
- `isAvailable()`: Check if model is available
- `getModelInfo()`: Get model information
- `updateConfig(config)`: Update model configuration

### ValidationUtils

- `validateValue(value, schema)`: Validate a single value
- `validateMultiple(values, schema)`: Validate multiple values
- `validateEmail(email)`: Validate email format
- `validateUrl(url)`: Validate URL format
- `validateFilePath(path)`: Validate file path

### PerformanceMonitor

- `startTimer(operation)`: Start timing an operation
- `trackOperation(operation, fn, metadata)`: Track an operation
- `getMemoryUsage()`: Get memory usage information
- `getMetrics(operation?)`: Get performance metrics
- `getAveragePerformance(operation)`: Get average performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## Reynard Framework

This package is part of the Reynard framework - a cunning SolidJS framework with modular architecture. Learn more at [(TBD)](https://(TBD)).
