# reynard-annotating

A comprehensive annotation and caption generation system for Reynard applications that handles image captioning, tagging, and annotation workflows.

## Features

- **Caption Generation**: Support for multiple caption generation models (JTP2, JoyCaption, WDv3, Florence2)
- **Tag Generation**: Specialized taggers for different types of content
- **Batch Processing**: Efficient batch processing with progress tracking
- **Model Management**: Automatic model loading, unloading, and lifecycle management
- **Post-Processing**: Configurable post-processing rules for caption cleanup
- **Event System**: Comprehensive event system for annotation lifecycle events
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install reynard-annotating
```

## Quick Start

```typescript
import { AnnotationManager, CaptionType, CaptionTask } from 'reynard-annotating';

// Create annotation manager with backend integration
const annotationManager = new AnnotationManager();

// Start the manager
await annotationManager.start();

// Get available generators (now async)
const generators = await annotationManager.getAvailableGenerators();
console.log('Available generators:', generators);

// Generate a caption
const task: CaptionTask = {
  imagePath: '/path/to/image.jpg',
  generatorName: 'jtp2',
  config: { threshold: 0.2 },
  postProcess: true
};

const service = annotationManager.getService();
const result = await service.generateCaption(task);

console.log('Generated caption:', result.caption);
console.log('Caption type:', result.captionType);
console.log('Processing time:', result.processingTime);

// Generate captions in batch
const tasks: CaptionTask[] = [
  { imagePath: '/path/to/image1.jpg', generatorName: 'jtp2' },
  { imagePath: '/path/to/image2.jpg', generatorName: 'joycaption' }
];

const results = await service.generateBatchCaptions(tasks, (progress) => {
  console.log(`Progress: ${progress.progress}% (${progress.completed}/${progress.total})`);
});

// Stop the manager
await annotationManager.stop();
```

## API Reference

### AnnotationManager

The main orchestrator for the annotation system.

#### Constructor

```typescript
new AnnotationManager()
```

#### Methods

- `start(): Promise<void>` - Start the annotation manager
- `stop(): Promise<void>` - Stop the annotation manager
- `getService(): AnnotationService` - Get the annotation service
- `registerGenerator(generator: BaseCaptionGenerator): void` - Register a caption generator
- `unregisterGenerator(name: string): void` - Unregister a caption generator
- `getAvailableGenerators(): CaptionGenerator[]` - Get all available generators
- `getGenerator(name: string): CaptionGenerator | undefined` - Get a specific generator
- `isGeneratorAvailable(name: string): boolean` - Check if a generator is available
- `preloadModel(name: string): Promise<void>` - Preload a model
- `unloadModel(name: string): Promise<void>` - Unload a model
- `updateGeneratorConfig(name: string, config: CaptionGeneratorConfig): void` - Update generator configuration
- `getGeneratorConfig(name: string): CaptionGeneratorConfig | undefined` - Get generator configuration

### AnnotationService

The main service for caption generation.

#### Methods

- `generateCaption(task: CaptionTask): Promise<CaptionResult>` - Generate a single caption
- `generateBatchCaptions(tasks: CaptionTask[], progressCallback?: (progress: AnnotationProgress) => void): Promise<CaptionResult[]>` - Generate captions in batch
- `getAvailableGenerators(): CaptionGenerator[]` - Get available generators
- `getGenerator(name: string): CaptionGenerator | undefined` - Get a specific generator
- `isGeneratorAvailable(name: string): boolean` - Check if a generator is available
- `isModelLoaded(name: string): boolean` - Check if a model is loaded
- `updateGeneratorConfig(name: string, config: CaptionGeneratorConfig): void` - Update generator configuration
- `getGeneratorConfig(name: string): CaptionGeneratorConfig | undefined` - Get generator configuration
- `preloadModel(name: string): Promise<void>` - Preload a model
- `unloadModel(name: string): Promise<void>` - Unload a model

### BaseCaptionGenerator

Abstract base class that all caption generators must extend.

#### Constructor

```typescript
constructor(
  name: string,
  description: string,
  version: string,
  captionType: CaptionType,
  configSchema: Record<string, any> = {},
  features: string[] = []
)
```

#### Abstract Methods

- `generate(imagePath: string, config?: CaptionGeneratorConfig): Promise<string>` - Generate caption for an image
- `isAvailable(): Promise<boolean>` - Check if the generator is available
- `load(config?: CaptionGeneratorConfig): Promise<void>` - Load the generator
- `unload(): Promise<void>` - Unload the generator

#### Properties

- `name: string` - Generator name
- `description: string` - Generator description
- `version: string` - Generator version
- `captionType: CaptionType` - Type of caption this generator produces
- `isAvailable: boolean` - Whether the generator is available
- `isLoaded: boolean` - Whether the generator is loaded
- `configSchema: Record<string, any>` - Configuration schema
- `features: string[]` - List of features this generator supports

### Types

#### CaptionType

```typescript
enum CaptionType {
  CAPTION = 'caption',
  TAGS = 'tags',
  E621 = 'e621',
  TOML = 'toml'
}
```

#### CaptionTask

```typescript
interface CaptionTask {
  imagePath: string;
  generatorName: string;
  config?: Record<string, any>;
  postProcess?: boolean;
  force?: boolean;
}
```

#### CaptionResult

```typescript
interface CaptionResult {
  imagePath: string;
  generatorName: string;
  success: boolean;
  caption: string;
  processingTime: number;
  captionType: CaptionType;
  error?: string;
  metadata?: Record<string, any>;
}
```

## Advanced Usage

### Custom Caption Generator

```typescript
import { BaseCaptionGenerator, CaptionType, CaptionGeneratorConfig } from 'reynard-annotating';

class MyCustomGenerator extends BaseCaptionGenerator {
  constructor() {
    super(
      'my-custom-generator',
      'My custom caption generator',
      '1.0.0',
      CaptionType.CAPTION,
      {
        type: 'object',
        properties: {
          customParam: { type: 'string', default: 'default-value' }
        }
      },
      ['custom_feature']
    );
  }

  async generate(imagePath: string, config?: CaptionGeneratorConfig): Promise<string> {
    // Implement your caption generation logic
    return 'Generated caption from my custom generator';
  }

  async isAvailable(): Promise<boolean> {
    // Check if your generator is available
    return true;
  }

  async load(config?: CaptionGeneratorConfig): Promise<void> {
    // Load your model
    console.log('Loading custom generator...');
  }

  async unload(): Promise<void> {
    // Unload your model
    console.log('Unloading custom generator...');
  }
}

// Register the custom generator
const annotationManager = new AnnotationManager();
const customGenerator = new MyCustomGenerator();
annotationManager.registerGenerator(customGenerator);
```

### Event Handling

```typescript
annotationManager.addEventListener((event) => {
  console.log('Annotation event:', event);
  
  switch (event.type) {
    case 'generation_start':
      console.log(`Starting generation with ${event.generatorName}`);
      break;
    case 'generation_complete':
      console.log(`Generation completed for ${event.generatorName}`);
      break;
    case 'generation_error':
      console.error(`Generation failed: ${event.data.error}`);
      break;
  }
});
```

### Batch Processing with Progress

```typescript
const tasks: CaptionTask[] = [
  { imagePath: '/path/to/image1.jpg', generatorName: 'jtp2' },
  { imagePath: '/path/to/image2.jpg', generatorName: 'joycaption' },
  { imagePath: '/path/to/image3.jpg', generatorName: 'jtp2' }
];

const results = await service.generateBatchCaptions(tasks, (progress) => {
  console.log(`Progress: ${progress.progress}%`);
  console.log(`Completed: ${progress.completed}/${progress.total}`);
  console.log(`Failed: ${progress.failed}`);
  console.log(`Current: ${progress.current}`);
  
  if (progress.estimatedTimeRemaining) {
    console.log(`ETA: ${Math.round(progress.estimatedTimeRemaining / 1000)}s`);
  }
});

// Process results
for (const result of results) {
  if (result.success) {
    console.log(`Generated caption for ${result.imagePath}: ${result.caption}`);
  } else {
    console.error(`Failed to generate caption for ${result.imagePath}: ${result.error}`);
  }
}
```

### Configuration Management

```typescript
// Update generator configuration
annotationManager.updateGeneratorConfig('jtp2', {
  threshold: 0.3,
  forceCpu: false
});

// Get generator configuration
const config = annotationManager.getGeneratorConfig('jtp2');
console.log('JTP2 config:', config);

// Preload a model for faster generation
await annotationManager.preloadModel('joycaption');

// Unload a model to free memory
await annotationManager.unloadModel('jtp2');
```

## License

MIT
