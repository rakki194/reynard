# reynard-model-management

A comprehensive model management system for Reynard applications that handles ML model registration, downloading,
loading, and lifecycle management.

## Architecture

```mermaid
graph TB
    subgraph "🤖 Reynard Model Management System"
        A[Model Manager] --> B[Model Registry]
        A --> C[Download Manager]
        A --> D[Model Loader]
        A --> E[Event System]
        A --> F[UI Components]

        subgraph "📋 Model Registry"
            B --> B1[Model Registration]
            B --> B2[Model Discovery]
            B --> B3[Model Metadata]
            B --> B4[Type Management]
            B1 --> B5[registerModel]
            B1 --> B6[unregisterModel]
            B2 --> B7[getModelInfo]
            B2 --> B8[getAllModelInfo]
            B2 --> B9[getModelsByType]
            B3 --> B10[Model Metadata]
            B3 --> B11[Version Tracking]
            B4 --> B12[ModelType Enum]
            B4 --> B13[Type Filtering]
        end

        subgraph "⬇️ Download Manager"
            C --> C1[Concurrent Downloads]
            C --> C2[Progress Tracking]
            C --> C3[Download Queue]
            C --> C4[Error Handling]
            C1 --> C5[Max Concurrent Limit]
            C1 --> C6[Download Timeout]
            C2 --> C7[Progress Callbacks]
            C2 --> C8[Bytes Downloaded]
            C2 --> C9[File Progress]
            C3 --> C10[Queue Management]
            C3 --> C11[Priority Handling]
            C4 --> C12[Retry Logic]
            C4 --> C13[Error Recovery]
        end

        subgraph "🔄 Model Loader"
            D --> D1[Model Loading]
            D --> D2[Lifecycle Management]
            D --> D3[Health Monitoring]
            D --> D4[Instance Management]
            D1 --> D5[loadModel]
            D1 --> D6[unloadModel]
            D2 --> D7[Model Initialization]
            D2 --> D8[Model Destruction]
            D3 --> D9[Health Checks]
            D3 --> D10[Status Monitoring]
            D4 --> D11[Instance Tracking]
            D4 --> D12[Memory Management]
        end

        subgraph "📡 Event System"
            E --> E1[Event Handlers]
            E --> E2[Event Types]
            E --> E3[Event Broadcasting]
            E --> E4[Event History]
            E1 --> E5[ModelEventHandler]
            E1 --> E6[Event Registration]
            E2 --> E7[download_start/complete]
            E2 --> E8[load_start/complete]
            E2 --> E9[health_check]
            E2 --> E10[error_occurred]
            E3 --> E11[Event Broadcasting]
            E3 --> E12[Event Filtering]
            E4 --> E13[Event Logging]
            E4 --> E14[Event Analytics]
        end

        subgraph "🎨 UI Components"
            F --> F1[Model Manager Dashboard]
            F --> F2[Health Overview]
            F --> F3[Models Grid]
            F --> F4[Progress Indicators]
            F1 --> F5[ModelManager Component]
            F1 --> F6[Real-time Updates]
            F2 --> F7[System Health Display]
            F2 --> F8[Performance Metrics]
            F3 --> F9[Model Grid Layout]
            F3 --> F10[Model Controls]
            F4 --> F11[Download Progress]
            F4 --> F12[Loading Indicators]
        end

        subgraph "🏗️ Base Model System"
            G[Base Model] --> G1[Abstract Base Class]
            G --> G2[Model Lifecycle]
            G --> G3[Model Interface]
            G --> G4[Model Configuration]
            G1 --> G5[BaseModel Class]
            G1 --> G6[Abstract Methods]
            G2 --> G7[download/load/unload]
            G2 --> G8[healthCheck/isAvailable]
            G3 --> G9[Model Instance]
            G3 --> G10[Model Status]
            G4 --> G11[Configuration Management]
            G4 --> G12[Metadata Storage]
        end

        subgraph "📊 Model Types"
            H[Model Types] --> H1[Caption Generator]
            H --> H2[Detection Model]
            H --> H3[Embedding Model]
            H --> H4[Diffusion LM]
            H --> H5[Classification Model]
            H1 --> H6[Image Captioning]
            H2 --> H7[Object Detection]
            H3 --> H8[Vector Embeddings]
            H4 --> H9[Text Generation]
            H5 --> H10[Image Classification]
        end

        subgraph "🔧 Model Operations"
            I[Operations] --> I1[Model Registration]
            I --> I2[Model Download]
            I --> I3[Model Loading]
            I --> I4[Model Unloading]
            I --> I5[Health Monitoring]
            I --> I6[Configuration Updates]
            I1 --> I7[Register Model Info]
            I2 --> I8[Download with Progress]
            I3 --> I9[Load with Config]
            I4 --> I10[Unload and Cleanup]
            I5 --> I11[Health Check Execution]
            I6 --> I12[Update Model Config]
        end

        subgraph "📈 Model Status & Health"
            J[Status System] --> J1[Model Status]
            J --> J2[Model Health]
            J --> J3[Status Transitions]
            J --> J4[Health Monitoring]
            J1 --> J5[NOT_DOWNLOADED]
            J1 --> J6[DOWNLOADING]
            J1 --> J7[DOWNLOADED]
            J1 --> J8[LOADING]
            J1 --> J9[LOADED]
            J1 --> J10[ERROR]
            J2 --> J11[HEALTHY]
            J2 --> J12[DEGRADED]
            J2 --> J13[UNHEALTHY]
            J2 --> J14[UNKNOWN]
            J3 --> J15[Status Flow]
            J4 --> J16[Health Checks]
        end
    end

    subgraph "🌐 External Integration"
        K[Backend API] --> K1[Model Endpoints]
        K --> K2[Health Endpoints]
        K --> K3[Configuration API]
        L[SolidJS] --> L1[Reactive State]
        L --> L2[Component Integration]
        L --> L3[useModelManager Hook]
    end

    A -->|Orchestrates| M[Model Lifecycle]
    B -->|Manages| N[Model Registry]
    C -->|Handles| O[Download Process]
    D -->|Manages| P[Model Loading]
    E -->|Broadcasts| Q[Model Events]
    F -->|Provides| R[User Interface]
```

## Model Lifecycle Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant Manager as Model Manager
    participant Registry as Model Registry
    participant Downloader as Download Manager
    participant Loader as Model Loader
    participant Model as Base Model
    participant UI as UI Components

    Note over App, UI: Model Registration
    App->>Manager: registerModel(modelInfo)
    Manager->>Registry: registerModel(modelInfo)
    Registry-->>Manager: Model Registered
    Manager-->>App: Registration Complete

    Note over App, UI: Model Download
    App->>Manager: downloadModel(modelId, progressCallback)
    Manager->>Registry: getModelInfo(modelId)
    Registry-->>Manager: Model Info
    Manager->>Downloader: downloadModel(modelId, callback)
    Downloader->>Downloader: Check Concurrent Limit
    Downloader->>Downloader: Initialize Progress Tracking
    Downloader->>Downloader: Start Download Process

    loop Download Progress
        Downloader->>App: Progress Update
        Downloader->>UI: Update Progress Bar
    end

    Downloader-->>Manager: Download Complete
    Manager-->>App: Download Success

    Note over App, UI: Model Loading
    App->>Manager: loadModel(modelId, config)
    Manager->>Registry: getModelInfo(modelId)
    Registry-->>Manager: Model Info
    Manager->>Loader: loadModel(modelId, config)
    Loader->>Loader: Check Concurrent Limit
    Loader->>Model: Create Model Instance
    Loader->>Model: initialize()
    Model->>Model: Check Availability
    Model->>Model: Load Model
    Model->>Model: Perform Health Check
    Model-->>Loader: Model Loaded
    Loader-->>Manager: Load Complete
    Manager-->>App: Model Instance

    Note over App, UI: Health Monitoring
    loop Health Monitoring
        Manager->>Model: healthCheck()
        Model-->>Manager: Health Status
        Manager->>UI: Update Health Display
    end

    Note over App, UI: Model Unloading
    App->>Manager: unloadModel(modelId)
    Manager->>Loader: unloadModel(modelId)
    Loader->>Model: destroy()
    Model->>Model: Unload Model
    Model->>Model: Cleanup Resources
    Model-->>Loader: Model Unloaded
    Loader-->>Manager: Unload Complete
    Manager-->>App: Unload Success
```

## Model Status & Health Flow

```mermaid
stateDiagram-v2
    [*] --> NOT_DOWNLOADED: Model Registration

    NOT_DOWNLOADED --> DOWNLOADING: downloadModel()
    DOWNLOADING --> DOWNLOADED: Download Complete
    DOWNLOADING --> ERROR: Download Failed

    DOWNLOADED --> LOADING: loadModel()
    LOADING --> LOADED: Load Complete
    LOADING --> ERROR: Load Failed

    LOADED --> LOADING: Reload Model
    LOADED --> NOT_DOWNLOADED: deleteModel()

    ERROR --> DOWNLOADING: Retry Download
    ERROR --> LOADING: Retry Load
    ERROR --> NOT_DOWNLOADED: Reset Model

    state DOWNLOADED {
        [*] --> Available
        Available --> Ready: Model Ready
    }

    state LOADED {
        [*] --> HEALTHY
        HEALTHY --> DEGRADED: Performance Issues
        DEGRADED --> HEALTHY: Recovery
        DEGRADED --> UNHEALTHY: Critical Issues
        UNHEALTHY --> DEGRADED: Partial Recovery
        UNHEALTHY --> ERROR: Complete Failure
    }

    state ERROR {
        [*] --> ErrorState
        ErrorState --> Retry: Retry Operation
        ErrorState --> Reset: Reset Model
    }
```

## Component Architecture

```mermaid
graph TB
    subgraph "🎨 UI Component Architecture"
        A[ModelManager] --> B[HealthOverview]
        A --> C[ModelsGrid]
        A --> D[ErrorDisplay]

        subgraph "📊 Health Overview"
            B --> B1[System Health Status]
            B --> B2[Performance Metrics]
            B --> B3[Resource Usage]
            B --> B4[Health Indicators]
            B1 --> B5[Overall Health Score]
            B2 --> B6[Memory Usage]
            B2 --> B7[CPU Usage]
            B3 --> B8[Model Count]
            B3 --> B9[Loaded Models]
            B4 --> B10[Health Icons]
            B4 --> B11[Status Colors]
        end

        subgraph "📋 Models Grid"
            C --> C1[Model Cards]
            C --> C2[Model Controls]
            C --> C3[Status Indicators]
            C --> C4[Progress Bars]
            C1 --> C5[Model Information]
            C1 --> C6[Model Metadata]
            C2 --> C7[Load/Unload Buttons]
            C2 --> C8[Download Button]
            C3 --> C9[Status Badges]
            C3 --> C10[Health Indicators]
            C4 --> C11[Download Progress]
            C4 --> C12[Loading Progress]
        end

        subgraph "⚠️ Error Display"
            D --> D1[Error Messages]
            D --> D2[Error Actions]
            D --> D3[Error History]
            D1 --> D4[Error Text]
            D1 --> D5[Error Icons]
            D2 --> D6[Dismiss Button]
            D2 --> D7[Retry Button]
            D3 --> D8[Error Log]
            D3 --> D9[Error Analytics]
        end

        subgraph "🔄 useModelManager Hook"
            E[useModelManager] --> E1[Reactive State]
            E --> E2[Model Operations]
            E --> E3[Error Handling]
            E --> E4[Backend Integration]
            E1 --> E5[models Signal]
            E1 --> E6[systemHealth Signal]
            E1 --> E7[error Signal]
            E2 --> E8[loadModel Function]
            E2 --> E9[unloadModel Function]
            E3 --> E10[clearError Function]
            E4 --> E11[API Calls]
            E4 --> E12[WebSocket Updates]
        end
    end

    subgraph "🎯 Model Card Components"
        F[Model Card] --> F1[Model Header]
        F --> F2[Model Body]
        F --> F3[Model Footer]
        F1 --> F4[Model Name]
        F1 --> F5[Model Type]
        F1 --> F6[Status Badge]
        F2 --> F7[Model Description]
        F2 --> F8[Model Metadata]
        F2 --> F9[Progress Indicators]
        F3 --> F10[Action Buttons]
        F3 --> F11[Health Status]
    end

    A -->|Uses| E
    B -->|Displays| F
    C -->|Renders| F
    E -->|Manages| A
```

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
import { ModelManager, ModelType, ModelStatus, ModelHealth } from "reynard-model-management";

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
await modelManager.downloadModel("my-caption-model", progress => {
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
modelManager.addEventListener(event => {
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
