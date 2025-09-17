# reynard-segmentation

> Comprehensive polygon segmentation system for the Reynard annotation framework

A sophisticated polygon segmentation system that integrates seamlessly with the existing Reynard annotation ecosystem. Built with the cunning of a fox, the thoroughness of an otter, and the precision of a wolf, this package provides everything you need for advanced image segmentation workflows.

## ✨ Features

- **🦊 Strategic Integration** - Seamlessly integrates with existing Reynard packages
- **🎨 Advanced Editor** - Sophisticated polygon editing with floating panels
- **⚡ Performance Optimized** - Leverages reynard-algorithms for geometric operations
- **🔗 AI Integration** - Built on reynard-ai-shared and reynard-annotating-core
- **📱 Responsive Design** - Works across all device sizes
- **♿ Accessibility** - WCAG compliant with keyboard navigation
- **🎯 Precision Tools** - Vertex editing, edge manipulation, and geometric validation
- **📊 Export Support** - Multiple export formats (COCO, YOLO, Pascal VOC, Reynard)

## 🚀 Quick Start

### Installation

```bash
npm install reynard-segmentation
```

### Basic Usage

```tsx
import { SegmentationEditor } from "reynard-segmentation";
import type { SegmentationData } from "reynard-segmentation";

function MySegmentationApp() {
  const [segmentations, setSegmentations] = useState<SegmentationData[]>([]);

  return (
    <SegmentationEditor
      imageSrc="/path/to/image.jpg"
      segmentations={segmentations}
      config={{
        enabled: true,
        showGrid: true,
        showVertices: true,
        allowPolygonCreation: true,
      }}
      events={{
        onSegmentationCreate: segmentation => {
          setSegmentations(prev => [...prev, segmentation]);
        },
        onSegmentationUpdate: segmentation => {
          setSegmentations(prev => prev.map(s => (s.id === segmentation.id ? segmentation : s)));
        },
      }}
    />
  );
}
```

## 🏗️ Architecture

### Integration with Reynard Ecosystem

The segmentation package is designed to work harmoniously with existing Reynard packages:

```
🎯 REYNARD SEGMENTATION ECOSYSTEM
│
├── 🧠 AI FOUNDATION LAYER
│   ├── reynard-ai-shared/           # BaseAIService, ServiceRegistry
│   └── reynard-algorithms/          # PolygonOps, PointOps, geometric operations
│
├── 🏗️ ANNOTATION CORE LAYER
│   ├── reynard-annotating-core/     # BackendAnnotationService, task management
│   └── reynard-annotating/          # Unified interface, generator coordination
│
├── 🎨 UI INTEGRATION LAYER
│   ├── reynard-floating-panel/      # FloatingPanelOverlay, panel management
│   ├── reynard-caption/             # CaptionInput, tag management
│   └── reynard-boundingbox/         # Coordinate transforms, validation
│
└── 🆕 SEGMENTATION PACKAGE
    ├── SegmentationEditor           # Main editor component
    ├── SegmentationCanvas           # Interactive canvas
    ├── SegmentationPanel            # Management panel
    ├── SegmentationService          # AI service integration
    └── SegmentationManager          # Service coordination
```

### Core Components

- **SegmentationEditor**: Main editor component with floating panels
- **SegmentationCanvas**: Interactive canvas for polygon editing
- **SegmentationToolbar**: Zoom, pan, and view controls
- **SegmentationPanel**: Segmentation list and management
- **SegmentationService**: AI service integration
- **SegmentationManager**: Service coordination and lifecycle

## 🎮 Advanced Usage

### Custom Configuration

```tsx
import { SegmentationEditor } from "reynard-segmentation";

const customConfig = {
  enabled: true,
  showGrid: true,
  gridSize: 20,
  snapToGrid: true,
  showVertices: true,
  vertexSize: 8,
  showEdges: true,
  edgeThickness: 2,
  showFill: true,
  fillOpacity: 0.3,
  allowVertexEdit: true,
  allowEdgeEdit: true,
  allowPolygonCreation: true,
  allowPolygonDeletion: true,
  maxPolygons: 50,
  minPolygonArea: 100,
  maxPolygonArea: 1000000,
};

<SegmentationEditor
  imageSrc="/path/to/image.jpg"
  config={customConfig}
  // ... other props
/>;
```

### Service Integration

```tsx
import { SegmentationManager, initializeSegmentationManager } from "reynard-segmentation";

// Initialize the segmentation manager
const manager = await initializeSegmentationManager();

// Generate segmentation
const task = {
  type: "segmentation",
  imagePath: "/path/to/image.jpg",
  options: {
    minArea: 100,
    maxArea: 1000000,
    validateGeometry: true,
  },
};

const result = await manager.generateSegmentation(task);
console.log("Generated segmentation:", result.segmentation);
```

### Export and Import

```tsx
import { SegmentationExportFormat } from "reynard-segmentation";

// Export to different formats
const cocoData = manager.exportSegmentation(segmentation, SegmentationExportFormat.COCO);
const yoloData = manager.exportSegmentation(segmentation, SegmentationExportFormat.YOLO);
const reynardData = manager.exportSegmentation(segmentation, SegmentationExportFormat.REYNARD);

// Import segmentation data
const importedSegmentation = manager.importSegmentation(cocoData);
```

## 🎨 Theming and Styling

The segmentation editor uses CSS custom properties for theming:

```css
.segmentation-editor {
  --color-background: #ffffff;
  --color-background-secondary: #f8f9fa;
  --color-border: #e5e7eb;
  --color-primary: #3b82f6;
  --color-text: #374151;
  --border-radius: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## 📚 API Reference

### SegmentationEditor Props

| Prop            | Type                                | Default | Description                   |
| --------------- | ----------------------------------- | ------- | ----------------------------- |
| `imageSrc`      | `string`                            | -       | Image source for segmentation |
| `segmentations` | `SegmentationData[]`                | `[]`    | Initial segmentations         |
| `config`        | `Partial<SegmentationEditorConfig>` | `{}`    | Editor configuration          |
| `state`         | `SegmentationEditorState`           | `{}`    | Editor state                  |
| `events`        | `SegmentationEditorEvents`          | `{}`    | Event handlers                |
| `enabled`       | `boolean`                           | `true`  | Whether editor is enabled     |

### SegmentationEditorConfig

| Option                 | Type      | Default   | Description                       |
| ---------------------- | --------- | --------- | --------------------------------- |
| `enabled`              | `boolean` | `true`    | Whether editing is enabled        |
| `showGrid`             | `boolean` | `true`    | Whether to show grid              |
| `gridSize`             | `number`  | `20`      | Grid size in pixels               |
| `snapToGrid`           | `boolean` | `true`    | Whether to snap to grid           |
| `showVertices`         | `boolean` | `true`    | Whether to show polygon vertices  |
| `vertexSize`           | `number`  | `8`       | Vertex size in pixels             |
| `showEdges`            | `boolean` | `true`    | Whether to show polygon edges     |
| `edgeThickness`        | `number`  | `2`       | Edge thickness in pixels          |
| `showFill`             | `boolean` | `true`    | Whether to show polygon fill      |
| `fillOpacity`          | `number`  | `0.3`     | Fill opacity (0-1)                |
| `allowVertexEdit`      | `boolean` | `true`    | Whether to allow vertex editing   |
| `allowEdgeEdit`        | `boolean` | `true`    | Whether to allow edge editing     |
| `allowPolygonCreation` | `boolean` | `true`    | Whether to allow polygon creation |
| `allowPolygonDeletion` | `boolean` | `true`    | Whether to allow polygon deletion |
| `maxPolygons`          | `number`  | `50`      | Maximum number of polygons        |
| `minPolygonArea`       | `number`  | `100`     | Minimum polygon area              |
| `maxPolygonArea`       | `number`  | `1000000` | Maximum polygon area              |

## 🔧 Development

### Building

```bash
# Build the package
npm run build

# Build in watch mode
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Project Structure

```
packages/segmentation/
├── src/
│   ├── components/          # React components
│   │   ├── SegmentationEditor.tsx
│   │   ├── SegmentationCanvas.tsx
│   │   ├── SegmentationToolbar.tsx
│   │   └── SegmentationPanel.tsx
│   ├── composables/         # SolidJS composables
│   │   ├── useSegmentationEditor.ts
│   │   ├── usePolygonEditor.ts
│   │   └── useCanvasInteraction.ts
│   ├── services/            # Service layer
│   │   ├── SegmentationService.ts
│   │   └── SegmentationManager.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── index.ts             # Main export file
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## 📄 License

MIT License - see LICENSE file for details.

## 🦊 Why This Architecture is Magnificent

### ✅ Zero Confusion

- **No new core packages** - everything builds on what you have
- **Single segmentation package** - clear and focused
- **Existing patterns** - developers already know how to use it
- **Unified interface** - one place for all annotation types

### 🚀 Maximum Leverage

- **`reynard-ai-shared`** provides service management
- **`reynard-annotating-core`** provides task coordination
- **`reynard-algorithms`** provides polygon operations
- **`reynard-floating-panel`** provides editor layout
- **`reynard-caption`** provides label editing
- **`reynard-boundingbox`** provides coordinate transforms

### 🔗 Seamless Integration

- **Same backend integration** as existing annotation system
- **Same task management** as caption generation
- **Same UI patterns** as bounding box editing
- **Same performance monitoring** as AI services

---

_"In the realm of code, legends are not born—they are forged through the wise use of existing tools and the strategic extension of proven patterns."_ 🦊

**May your segmentations be precise, your polygons be valid, and your architecture be magnificent!** 🍀
