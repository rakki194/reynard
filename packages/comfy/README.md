# Reynard ComfyUI Integration

🦊> _Cunning workflow automation for diffusion image generation_

A comprehensive ComfyUI integration package for the Reynard framework, providing workflow automation,
queue management, and image generation capabilities.

## Features

### 🎯 Core Functionality

- **Workflow Automation**: Queue and manage ComfyUI workflows
- **Text-to-Image Generation**: Simple form-based image generation
- **Real-time Status Streaming**: Live progress updates via Server-Sent Events
- **Health Monitoring**: Service status and connection monitoring
- **Image Ingestion**: Store generated images with metadata
- **Validation System**: Model and parameter validation with suggestions

### 🔧 Advanced Features

- **Queue Management**: Full queue control (pause, resume, clear, reorder)
- **Preset System**: Save and manage workflow presets
- **Template Management**: Workflow templates with versioning
- **Error Handling**: Comprehensive error handling and graceful fallbacks
- **Type Safety**: Complete TypeScript integration

## Installation

```bash
# Install the package
pnpm add reynard-comfy

# Or in a workspace
pnpm add reynard-comfy --workspace
```

## Quick Start

### Basic Usage

```tsx
import { ComfyText2ImgForm, ComfyHealthStatus } from "reynard-comfy";

function MyApp() {
  return (
    <div>
      <ComfyHealthStatus showDetails={true} />
      <ComfyText2ImgForm
        onGenerate={(promptId) => console.log("Started:", promptId)}
        onComplete={(result) => console.log("Completed:", result)}
        onError={(error) => console.error("Failed:", error)}
      />
    </div>
  );
}
```

### Using the Composable

```tsx
import { useComfy } from "reynard-comfy";

function MyComponent() {
  const comfy = useComfy();

  const generateImage = async () => {
    try {
      const result = await comfy.textToImage({
        caption: "a beautiful landscape",
        width: 1024,
        height: 1024,
        steps: 24,
        cfg: 5.5,
      });
      console.log("Generated:", result.promptId);
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  return (
    <div>
      <button onClick={generateImage} disabled={comfy.isLoading()}>
        Generate Image
      </button>
      {comfy.error() && <div class="error">{comfy.error()}</div>}
    </div>
  );
}
```

### Using the Service Directly

```tsx
import { ComfyService } from "reynard-comfy";

const service = new ComfyService();

// Queue a custom workflow
const result = await service.queueWorkflow({
  "1": {
    class_type: "CheckpointLoaderSimple",
    inputs: { ckpt_name: "model.safetensors" },
  },
  // ... more nodes
});

// Stream status updates
const cleanup = service.streamStatus(result.promptId, (event) => {
  console.log("Status update:", event);
  if (event.type === "status" && event.data?.status === "completed") {
    cleanup(); // Stop streaming
  }
});
```

## API Reference

### Components

#### `ComfyText2ImgForm`

A complete form component for text-to-image generation.

```tsx
interface ComfyText2ImgFormProps {
  onGenerate?: (promptId: string) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  initialValues?: Partial<ComfyText2ImgParams>;
  disabled?: boolean;
  class?: string;
}
```

#### `ComfyHealthStatus`

Displays the current health status of the ComfyUI service.

```tsx
interface ComfyHealthStatusProps {
  showDetails?: boolean;
  refreshInterval?: number;
  class?: string;
}
```

### Composables

#### `useComfy()`

Main composable for ComfyUI integration.

```tsx
const comfy = useComfy();

// State
comfy.health(); // Current health status
comfy.isLoading(); // Loading state
comfy.error(); // Error message

// Methods
comfy.textToImage(params); // Generate image from text
comfy.queueWorkflow(workflow); // Queue custom workflow
comfy.getStatus(promptId); // Get prompt status
comfy.streamStatus(promptId, cb); // Stream status updates
comfy.validateCheckpoint(name); // Validate checkpoint
comfy.getQueueStatus(); // Get queue status
comfy.clearQueueItem(promptId); // Clear queue item
```

### Services

#### `ComfyService`

Main service class for ComfyUI integration.

```tsx
const service = new ComfyService();

// Core methods
await service.queueWorkflow(workflow, clientId?);
await service.getStatus(promptId);
await service.getHistory(promptId);
await service.getObjectInfo(refresh?);
await service.getImage(filename, subfolder?, type?);
await service.textToImage(params);

// Streaming
const cleanup = service.streamStatus(promptId, onEvent);

// Validation
await service.validateCheckpoint(checkpoint);
await service.validateLora(lora);
await service.validateSampler(sampler);
await service.validateScheduler(scheduler);

// Queue management
await service.getQueueStatus();
await service.getQueueItems();
await service.clearQueueItem(promptId);
await service.pauseQueue();
await service.resumeQueue();
```

## Configuration

The ComfyUI service requires configuration in your backend:

```python
# backend/main.py
comfy_config = {
    "comfy_enabled": True,
    "comfy_api_url": "http://127.0.0.1:8188",
    "comfy_timeout": 60,
    "comfy_image_dir": "generated/comfy",
}
```

## Backend API Endpoints

The package integrates with the following backend endpoints:

- `GET /api/comfy/health` - Service health check
- `POST /api/comfy/queue` - Queue workflow
- `GET /api/comfy/status/{prompt_id}` - Get status
- `GET /api/comfy/history/{prompt_id}` - Get history
- `GET /api/comfy/object-info` - Get object info
- `GET /api/comfy/view` - View image
- `POST /api/comfy/text2img` - Text-to-image
- `POST /api/comfy/ingest` - Ingest image
- `GET /api/comfy/stream/{prompt_id}` - Stream status
- `GET /api/comfy/validate/checkpoint/{checkpoint}` - Validate checkpoint
- `GET /api/comfy/validate/lora/{lora}` - Validate LoRA
- `GET /api/comfy/validate/sampler/{sampler}` - Validate sampler
- `GET /api/comfy/validate/scheduler/{scheduler}` - Validate scheduler

## Error Handling

The package provides comprehensive error handling:

```tsx
const comfy = useComfy();

// Check for errors
if (comfy.error()) {
  console.error("ComfyUI error:", comfy.error());
}

// Handle errors in callbacks
<ComfyText2ImgForm
  onError={(error) => {
    // Handle generation error
    showNotification(`Generation failed: ${error}`, "error");
  }}
/>;
```

## TypeScript Support

The package provides complete TypeScript support with comprehensive type definitions:

```tsx
import type {
  ComfyText2ImgParams,
  ComfyJob,
  ComfyJobResult,
  ComfyImage,
  ComfyValidationResult,
  ComfyQueueStatus,
  ComfyQueueItem,
  ComfyHealthStatus,
  ComfyStreamEvent,
} from "reynard-comfy";
```

## Examples

See the `examples/comfy-demo` directory for a complete working example demonstrating:

- Service health monitoring
- Text-to-image generation
- Error handling
- Real-time status updates

## Contributing

Contributions are welcome! Please see the main Reynard repository for contribution guidelines.

## License

MIT License - see the main Reynard repository for details.
