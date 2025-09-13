# reynard-gallery-ai

_AI-enhanced gallery components for the Reynard framework - transforms your gallery into
an intelligent media management powerhouse!_ 🦊

## ✨ Features

- **🤖 Caption Generation**: Generate captions for images using multiple AI models (JTP2, WDv3, JoyCaption, Florence2)
- **📦 Batch Processing**: Process multiple images simultaneously with real-time progress tracking
- **🎯 Smart Context Menus**: AI-powered context menu actions for gallery items
- **🖼️ Enhanced Image Viewer**: AI-integrated image viewer with caption editing and generation controls
- **⚙️ Configurable AI Settings**: Flexible configuration for different AI models and workflows
- **🔍 AI-Powered Search**: Smart search and organization features
- **📊 Progress Tracking**: Real-time progress indicators and batch operation monitoring
- **🎨 Beautiful UI**: Modern, accessible interface with comprehensive styling

## 📦 Installation

```bash
npm install reynard-gallery-ai
```

## 🚀 Quick Start

### Basic Setup

```tsx
import { AIGalleryProvider, AIGalleryGrid } from "reynard-gallery-ai";
import type { AIGalleryConfig } from "reynard-gallery-ai";

const aiConfig: Partial<AIGalleryConfig> = {
  defaultGenerator: "jtp2",
  autoGenerateOnUpload: false,
  batchSettings: {
    maxConcurrent: 3,
    retryFailed: true,
    maxRetries: 2,
    progressInterval: 1000,
  },
  captionSettings: {
    postProcessing: true,
    forceRegeneration: false,
    generatorConfigs: {
      jtp2: { threshold: 0.2 },
      wdv3: { threshold: 0.3 },
      joy: { maxLength: 200 },
      florence2: { task: "caption" },
    },
  },
  uiPreferences: {
    showAIIndicators: true,
    showProgress: true,
    autoExpandCaptionEditor: false,
    showBatchControls: true,
  },
};

function MyAIGallery() {
  return (
    <AIGalleryProvider
      initialConfig={aiConfig}
      persistState={true}
      storageKey="my-ai-gallery"
    >
      <AIGalleryGrid
        items={galleryData.items}
        viewConfig={{ viewMode: "grid", itemSize: "medium" }}
        selectionState={{ selectedIds: new Set() }}
        loading={false}
        aiProps={{
          showAIIndicators: true,
          showCaptionPreviews: true,
          showBatchControls: true,
          availableGenerators: ["jtp2", "wdv3", "joy", "florence2"],
        }}
        onItemClick={(item) => console.log("Item clicked:", item.name)}
        onContextMenu={(item, x, y) => console.log("Context menu:", item.name)}
      />
    </AIGalleryProvider>
  );
}
```

### Using AI Features

````tsx
import { useGalleryAI } from "reynard-gallery-ai";

function MyComponent() {
  const ai = useGalleryAI();

  // Generate caption for a single item
  const handleGenerateCaption = async (item: FileItem) => {
    try {
      const result = await ai.generateCaption(item, "jtp2");
      console.log("Generated caption:", result.caption);
    } catch (error) {
      console.error("Caption generation failed:", error);
    }
  };

  // Batch process multiple items
  const handleBatchProcess = async (items: FileItem[]) => {
    try {
      const results = await ai.batchAnnotate(items, "joy");
      console.log("Batch processing completed:", results.length, "items");
    } catch (error) {
      console.error("Batch processing failed:", error);
    }
  };

  return (
    <div>
      <button onClick={() => handleGenerateCaption(selectedItem)}>
        Generate Caption
      </button>
      <button onClick={() => handleBatchProcess(selectedItems)}>
        Batch Process
      </button>
    </div>
  );
}

## 🎯 Components

### AIGalleryProvider

The main provider component that wraps your gallery and provides AI functionality to all child components.

```tsx
<AIGalleryProvider
  initialConfig={aiConfig}
  callbacks={aiCallbacks}
  persistState={true}
  storageKey="my-ai-gallery"
>
  {/* Your gallery components */}
</AIGalleryProvider>
````

### AIGalleryGrid

Enhanced gallery grid with AI-powered features including generation indicators, batch selection controls, and AI context menu integration.

```tsx
<AIGalleryGrid
  items={galleryData.items}
  viewConfig={{ viewMode: "grid", itemSize: "medium" }}
  selectionState={{ selectedIds: new Set() }}
  loading={false}
  aiProps={{
    showAIIndicators: true,
    showCaptionPreviews: true,
    showBatchControls: true,
    availableGenerators: ["jtp2", "wdv3", "joy", "florence2"],
  }}
  onItemClick={(item) => console.log("Item clicked:", item.name)}
  onContextMenu={(item, x, y) => console.log("Context menu:", item.name)}
/>
```

### AIImageViewer

AI-enhanced image viewer with caption generation and editing capabilities.

```tsx
<AIImageViewer
  imageInfo={selectedItem}
  captions={{}}
  aiProps={{
    enableCaptionEditing: true,
    availableGenerators: ["jtp2", "wdv3", "joy", "florence2"],
    showGenerationControls: true,
    autoGenerateOnOpen: false,
    defaultGenerator: "jtp2",
  }}
  onClose={() => setShowImageViewer(false)}
  onCaptionSave={async (captionData) => {
    // Save caption to backend
    return Promise.resolve();
  }}
  onCaptionDelete={async (captionType) => {
    // Delete caption from backend
    return Promise.resolve();
  }}
  onCaptionGenerate={async (generator) => {
    console.log("Generating caption with:", generator);
  }}
/>
```

### BatchProcessingDialog

Dialog for managing batch annotation operations with progress tracking.

```tsx
<BatchProcessingDialog
  visible={showBatchDialog}
  items={selectedItems}
  availableGenerators={["jtp2", "wdv3", "joy", "florence2"]}
  onClose={() => setShowBatchDialog(false)}
  onComplete={(results) => {
    console.log("Batch processing completed:", results);
  }}
  onError={(error) => {
    console.error("Batch processing failed:", error);
  }}
/>
```

## 🎮 AI Context Menu Actions

The AI context menu provides intelligent actions based on the selected items:

### Single Item Actions

- **Generate Caption**: Generate captions using different AI models
- **Edit Caption**: Edit existing captions
- **Regenerate Caption**: Force regeneration of captions
- **Delete Caption**: Remove captions
- **Smart Organize**: AI-powered organization suggestions
- **AI Search**: Find similar images

### Batch Actions

- **Batch Annotate**: Process multiple images simultaneously
- **Batch Organize**: Smart organization for multiple items

## 🤖 Available AI Models

### JTP2 (Joint Tagger Project PILOT2)

- **Purpose**: Furry artwork tagging
- **Category**: Lightweight
- **Specialization**: High accuracy for furry content
- **Output**: Tags

### WDv3 (Waifu Diffusion v3)

- **Purpose**: Anime/manga tagging
- **Category**: Lightweight
- **Specialization**: Danbooru-style tags
- **Output**: Tags

### JoyCaption

- **Purpose**: Detailed image captioning
- **Category**: Heavy
- **Specialization**: Multilingual, detailed descriptions
- **Output**: Captions

### Florence2

- **Purpose**: General purpose captioning
- **Category**: Heavy
- **Specialization**: Multiple tasks, versatile
- **Output**: Captions

## ⚙️ Configuration

### AIGalleryConfig

```typescript
interface AIGalleryConfig {
  defaultGenerator: string;
  autoGenerateOnUpload: boolean;
  batchSettings: {
    maxConcurrent: number;
    retryFailed: boolean;
    maxRetries: number;
    progressInterval: number;
  };
  captionSettings: {
    defaultCaptionType: CaptionType;
    postProcessing: boolean;
    forceRegeneration: boolean;
    generatorConfigs: Record<string, ModelConfig>;
  };
  uiPreferences: {
    showAIIndicators: boolean;
    showProgress: boolean;
    autoExpandCaptionEditor: boolean;
    showBatchControls: boolean;
  };
}
```

### Generator Configuration

Each AI model can be configured with specific parameters:

```typescript
const generatorConfigs = {
  jtp2: { threshold: 0.2 },
  wdv3: { threshold: 0.3 },
  joy: { maxLength: 200 },
  florence2: { task: "caption" },
};
```

## 📊 Progress Tracking

The AI gallery system provides comprehensive progress tracking:

### Batch Processing Progress

- Real-time progress updates
- Current item being processed
- Success/failure counts
- Error reporting

### Generation Status

- Individual caption generation status
- Processing time tracking
- Error handling and retry logic

## 🎨 Styling

The package includes comprehensive CSS styling that integrates with Reynard's design system:

```css
/* Import the styles */
@import "reynard-gallery-ai/styles/ai-gallery.css";
```

### CSS Custom Properties

The styles use CSS custom properties for theming:

```css
:root {
  --color-primary: #your-primary-color;
  --color-surface: #your-surface-color;
  --color-text-primary: #your-text-color;
  /* ... other theme variables */
}
```

## 🔧 Advanced Usage

### Custom AI Actions

You can create custom AI context menu actions:

```typescript
const customActions: AIContextMenuAction[] = [
  {
    id: "custom-action",
    label: "Custom AI Action",
    icon: "🎯",
    aiActionType: AIContextMenuActionType.GENERATE_CAPTION,
    aiConfig: {
      generator: "custom-generator",
      customConfig: {
        /* your config */
      },
    },
  },
];
```

### Integration with Backend

The AI gallery integrates with the Reynard annotation system:

```typescript
// The composable automatically connects to the annotation service
const ai = useGalleryAI();

// Check service status
const isHealthy = ai.getAnnotationService()?.isHealthy;

// Get available generators
const generators = ai.getAvailableGenerators();
```

## 🧪 Testing

The package includes comprehensive testing utilities:

```typescript
import { render, screen } from "@solidjs/testing-library";
import { AIGalleryProvider, AIGalleryGrid } from "reynard-gallery-ai";

test("renders AI gallery grid", () => {
  render(() => (
    <AIGalleryProvider>
      <AIGalleryGrid items={[]} />
    </AIGalleryProvider>
  ));

  expect(screen.getByText("No items found")).toBeInTheDocument();
});
```

## 📚 Examples

See the `examples/` directory for comprehensive usage examples:

- `ai-gallery-example.tsx` - Complete AI gallery implementation
- Integration examples with different backends
- Custom AI action implementations

## 🤝 Contributing

Contributions are welcome! Please see the main Reynard repository for contribution guidelines.

## 📄 License

MIT License - see the main Reynard repository for details.

## 🔗 Related Packages

- `reynard-gallery` - Core gallery components
- `reynard-annotating` - Annotation and caption generation system
- `reynard-caption` - Caption editing UI components
- `reynard-ai-shared` - Shared AI utilities and types
- `reynard-core` - Core Reynard utilities
- `reynard-components` - Base UI components
