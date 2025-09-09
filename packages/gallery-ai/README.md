# reynard-gallery-ai

AI-enhanced gallery components for the Reynard framework. Integrates caption generation, batch annotation, and smart features with the core gallery system.

## Features

- **Caption Generation**: Generate captions for images using multiple AI models
- **Batch Processing**: Process multiple images simultaneously with progress tracking
- **Smart Context Menus**: AI-powered context menu actions for gallery items
- **Enhanced Image Viewer**: AI-integrated image viewer with caption editing
- **Configurable AI Settings**: Flexible configuration for different AI models and workflows

## Installation

```bash
npm install reynard-gallery-ai
```

## Quick Start

### Basic Setup

```tsx
import { AIGalleryProvider, useGalleryAI } from "reynard-gallery-ai";
import { Gallery } from "reynard-gallery";

function MyAIGallery() {
  return (
    <AIGalleryProvider
      initialConfig={{
        defaultGenerator: "jtp2",
        autoGenerateOnUpload: true,
        aiEnabled: true,
      }}
    >
      <Gallery
        data={galleryData}
        showAIFeatures={true}
        onItemOpen={(item) => {
          // Handle item opening with AI features
        }}
      />
    </AIGalleryProvider>
  );
}
```

### Using AI Features

```tsx
import { useGalleryAI } from "reynard-gallery-ai";

function MyComponent() {
  const ai = useGalleryAI();

  const handleGenerateCaption = async (item) => {
    try {
      const result = await ai.generateCaption(item, "jtp2");
      console.log("Generated caption:", result.caption);
    } catch (error) {
      console.error("Caption generation failed:", error);
    }
  };

  const handleBatchAnnotate = async (items) => {
    try {
      const results = await ai.batchAnnotate(items, "joycaption");
      console.log("Batch processing complete:", results);
    } catch (error) {
      console.error("Batch processing failed:", error);
    }
  };

  return (
    <div>
      <button onClick={() => handleGenerateCaption(selectedItem)}>
        Generate Caption
      </button>
      <button onClick={() => handleBatchAnnotate(selectedItems)}>
        Batch Annotate
      </button>
    </div>
  );
}
```

## API Reference

### AIGalleryProvider

Context provider for AI-enhanced gallery functionality.

#### Props

```typescript
interface AIGalleryProviderProps {
  children: any;
  initialConfig?: Partial<AIGalleryConfig>;
  callbacks?: AIGalleryCallbacks;
  persistState?: boolean;
  storageKey?: string;
}
```

### useGalleryAI

Main composable for AI gallery functionality.

#### Options

```typescript
interface UseGalleryAIOptions {
  initialConfig?: Partial<AIGalleryConfig>;
  autoInitialize?: boolean;
  callbacks?: AIGalleryCallbacks;
  persistState?: boolean;
  storageKey?: string;
}
```

#### Return Value

```typescript
interface UseGalleryAIReturn {
  aiState: () => AIGalleryState;
  generateCaption: (
    item: FileItem,
    generator: string,
  ) => Promise<CaptionResult>;
  batchAnnotate: (
    items: FileItem[],
    generator: string,
  ) => Promise<CaptionResult[]>;
  updateAIConfig: (config: Partial<AIGalleryConfig>) => void;
  getAvailableGenerators: () => string[];
  isGeneratorAvailable: (generator: string) => boolean;
  getAnnotationManager: () => AnnotationManager;
  clearAIState: () => void;
  setAIEnabled: (enabled: boolean) => void;
}
```

## Configuration

### AI Gallery Config

```typescript
interface AIGalleryConfig {
  defaultGenerator: string;
  autoGenerateOnUpload: boolean;
  batchSettings: BatchProcessingSettings;
  captionSettings: CaptionGenerationSettings;
  uiPreferences: AIGalleryUIPreferences;
}
```

### Batch Processing Settings

```typescript
interface BatchProcessingSettings {
  maxConcurrent: number;
  retryFailed: boolean;
  maxRetries: number;
  progressInterval: number;
}
```

### Caption Generation Settings

```typescript
interface CaptionGenerationSettings {
  defaultCaptionType: CaptionType;
  postProcessing: boolean;
  forceRegeneration: boolean;
  generatorConfigs: Record<string, ModelConfig>;
}
```

## Callbacks

### AIGalleryCallbacks

```typescript
interface AIGalleryCallbacks {
  onCaptionGenerationStart?: (item: FileItem, generator: string) => void;
  onCaptionGenerationComplete?: (item: FileItem, result: CaptionResult) => void;
  onCaptionGenerationError?: (item: FileItem, error: string) => void;
  onBatchProcessingStart?: (items: FileItem[], generator: string) => void;
  onBatchProcessingProgress?: (progress: AnnotationProgress) => void;
  onBatchProcessingComplete?: (results: CaptionResult[]) => void;
  onBatchProcessingError?: (error: string) => void;
  onAIConfigChange?: (config: AIGalleryConfig) => void;
}
```

## Dependencies

- `reynard-gallery` - Core gallery components
- `reynard-annotating` - Annotation and caption generation system
- `reynard-caption` - Caption editing UI components
- `reynard-ai-shared` - Shared AI utilities and types
- `reynard-core` - Core Reynard utilities
- `reynard-components` - Base UI components

## License

MIT
