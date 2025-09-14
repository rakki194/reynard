# Reynard Segmentation API Documentation

> **Complete API Reference for the Reynard Segmentation System** 🦊
>
> Comprehensive documentation for all classes, interfaces, and functions in the Reynard segmentation package.

## 📚 **Table of Contents**

- [Core Types](#core-types)
- [Services](#services)
- [Components](#components)
- [Composables](#composables)
- [Utilities](#utilities)
- [Examples](#examples)

## 🎯 **Core Types**

### SegmentationData

Represents a complete segmentation annotation with polygon data, metadata, and timestamps.

```typescript
interface SegmentationData {
  /** Unique identifier for the segmentation */
  id: string;
  /** Polygon points defining the segmentation boundary */
  polygon: Polygon;
  /** Associated caption/label data */
  caption?: CaptionData;
  /** Metadata for the segmentation */
  metadata?: SegmentationMetadata;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modification timestamp */
  updatedAt: Date;
}
```

**Example:**

```typescript
const segmentation: SegmentationData = {
  id: "seg_123",
  polygon: {
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ]
  },
  caption: {
    type: "caption",
    content: "A square object"
  },
  metadata: {
    source: SegmentationSource.MANUAL,
    confidence: 0.95,
    category: "object"
  },
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### SegmentationTask

Represents a task for generating or processing segmentations.

```typescript
interface SegmentationTask {
  /** Task type identifier */
  type: "segmentation";
  /** Image path or URL to segment */
  imagePath: string;
  /** Optional existing segmentation to refine */
  existingSegmentation?: SegmentationData;
  /** Segmentation-specific options */
  options?: SegmentationOptions;
}
```

**Example:**

```typescript
const task: SegmentationTask = {
  type: "segmentation",
  imagePath: "/path/to/image.jpg",
  options: {
    minArea: 100,
    maxArea: 1000000,
    validateGeometry: true,
    simplifyPolygons: true,
    simplificationTolerance: 2.0
  }
};
```

### SegmentationResult

Represents the result of a segmentation operation.

```typescript
interface SegmentationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Result type identifier */
  type: "segmentation";
  /** Generated segmentation data */
  segmentation: SegmentationData;
  /** Processing metadata */
  processingInfo?: SegmentationProcessingInfo;
  /** Result timestamp */
  timestamp: Date;
}
```

### SegmentationEditorConfig

Configuration options for the segmentation editor.

```typescript
interface SegmentationEditorConfig {
  /** Whether editing is enabled */
  enabled: boolean;
  /** Whether to show grid */
  showGrid: boolean;
  /** Grid size in pixels */
  gridSize: number;
  /** Whether to snap to grid */
  snapToGrid: boolean;
  /** Whether to show polygon vertices */
  showVertices: boolean;
  /** Vertex size in pixels */
  vertexSize: number;
  /** Whether to show polygon edges */
  showEdges: boolean;
  /** Edge thickness in pixels */
  edgeThickness: number;
  /** Whether to show polygon fill */
  showFill: boolean;
  /** Fill opacity (0-1) */
  fillOpacity: number;
  /** Whether to show bounding box */
  showBoundingBox: boolean;
  /** Whether to allow vertex editing */
  allowVertexEdit: boolean;
  /** Whether to allow edge editing */
  allowEdgeEdit: boolean;
  /** Whether to allow polygon creation */
  allowPolygonCreation: boolean;
  /** Whether to allow polygon deletion */
  allowPolygonDeletion: boolean;
  /** Maximum number of polygons */
  maxPolygons: number;
  /** Minimum polygon area */
  minPolygonArea: number;
  /** Maximum polygon area */
  maxPolygonArea: number;
}
```

## 🔧 **Services**

### SegmentationService

Core service for polygon segmentation operations that integrates with the Reynard AI-shared and annotating-core systems.

```typescript
class SegmentationService extends BaseAIService implements ISegmentationService {
  constructor(config: SegmentationServiceConfig);
  
  // Core operations
  async generateSegmentation(task: SegmentationTask): Promise<SegmentationResult>;
  async generateBatchSegmentations(
    tasks: SegmentationTask[],
    progressCallback?: (progress: number) => void
  ): Promise<SegmentationResult[]>;
  async refineSegmentation(
    segmentation: SegmentationData,
    options?: SegmentationOptions
  ): Promise<SegmentationResult>;
  
  // Validation and utilities
  validateSegmentation(segmentation: SegmentationData): boolean;
  exportSegmentation(
    segmentation: SegmentationData,
    format: string
  ): Record<string, unknown>;
  importSegmentation(data: Record<string, unknown>): SegmentationData;
}
```

**Example:**

```typescript
import { SegmentationService } from "reynard-segmentation";

const service = new SegmentationService({
  name: "my-segmentation-service",
  minArea: 100,
  maxArea: 1000000,
  validateGeometry: true,
  simplifyPolygons: true,
  simplificationTolerance: 2.0,
  timeout: 30000,
  retries: 3
});

await service.initialize();

const result = await service.generateSegmentation({
  type: "segmentation",
  imagePath: "/path/to/image.jpg",
  options: {
    minArea: 100,
    validateGeometry: true
  }
});

console.log("Generated segmentation:", result.segmentation);
```

### SegmentationManager

Central manager for segmentation services that coordinates multiple services and provides unified access.

```typescript
class SegmentationManager implements ISegmentationManager {
  constructor(
    serviceRegistry?: ServiceRegistry,
    annotationServiceRegistry?: AnnotationServiceRegistry
  );
  
  // Lifecycle
  async initialize(): Promise<void>;
  async cleanup(): Promise<void>;
  
  // Service management
  async registerSegmentationService(
    name: string,
    config: SegmentationServiceConfig
  ): Promise<SegmentationService>;
  async unregisterSegmentationService(name: string): Promise<void>;
  
  // Operations
  async generateSegmentation(task: SegmentationTask): Promise<SegmentationResult>;
  async generateBatchSegmentations(
    tasks: SegmentationTask[],
    progressCallback?: (progress: number) => void
  ): Promise<SegmentationResult[]>;
  async refineSegmentation(
    segmentation: SegmentationData,
    options?: SegmentationOptions
  ): Promise<SegmentationResult>;
  
  // Utilities
  validateSegmentation(segmentation: SegmentationData): boolean;
  exportSegmentation(
    segmentation: SegmentationData,
    format: SegmentationExportFormat
  ): SegmentationExportData;
  importSegmentation(data: SegmentationExportData): SegmentationData;
  
  // Statistics
  async getStatistics(): Promise<SegmentationStatistics>;
  getAvailableServices(): Promise<string[]>;
  getService(name: string): ISegmentationService | undefined;
  isServiceAvailable(name: string): boolean;
}
```

**Example:**

```typescript
import { SegmentationManager, initializeSegmentationManager } from "reynard-segmentation";

// Initialize the global manager
const manager = await initializeSegmentationManager();

// Register a custom service
await manager.registerSegmentationService("custom-ai", {
  name: "custom-ai",
  minArea: 100,
  maxArea: 1000000,
  validateGeometry: true
});

// Generate segmentation
const result = await manager.generateSegmentation({
  type: "segmentation",
  imagePath: "/path/to/image.jpg"
});

// Get statistics
const stats = await manager.getStatistics();
console.log("Total segmentations:", stats.totalSegmentations);
console.log("Average processing time:", stats.averageProcessingTime);
```

## 🎨 **Components**

### SegmentationEditor

Main editor component that provides a complete segmentation editing interface.

```typescript
interface SegmentationEditorProps {
  /** Image source for segmentation */
  imageSrc: string;
  /** Initial segmentations */
  segmentations?: SegmentationData[];
  /** Editor configuration */
  config?: Partial<SegmentationEditorConfig>;
  /** Editor state */
  state?: SegmentationEditorState;
  /** Event handlers */
  events?: SegmentationEditorEvents;
  /** Whether the editor is enabled */
  enabled?: boolean;
  /** Additional CSS class */
  class?: string;
}

const SegmentationEditor: Component<SegmentationEditorProps>;
```

**Example:**

```tsx
import { SegmentationEditor } from "reynard-segmentation";

function MySegmentationApp() {
  const [segmentations, setSegmentations] = useState<SegmentationData[]>([]);

  return (
    <SegmentationEditor
      imageSrc="/path/to/image.jpg"
      segmentations={segmentations}
      config={{
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
        maxPolygonArea: 1000000
      }}
      events={{
        onSegmentationCreate: (segmentation) => {
          setSegmentations(prev => [...prev, segmentation]);
        },
        onSegmentationUpdate: (segmentation) => {
          setSegmentations(prev => 
            prev.map(s => s.id === segmentation.id ? segmentation : s)
          );
        },
        onSegmentationDelete: (segmentationId) => {
          setSegmentations(prev => prev.filter(s => s.id !== segmentationId));
        },
        onSegmentationSelect: (segmentationId) => {
          console.log("Selected segmentation:", segmentationId);
        },
        onStateChange: (state) => {
          console.log("Editor state changed:", state);
        }
      }}
    />
  );
}
```

### SegmentationCanvas

Interactive canvas component for displaying and editing polygon segmentations.

```typescript
interface SegmentationCanvasProps {
  /** Image source */
  imageSrc: string;
  /** Segmentations to display */
  segmentations: SegmentationData[];
  /** Editor configuration */
  config: SegmentationEditorConfig;
  /** Editor state */
  state: SegmentationEditorState;
  /** Mouse move handler */
  onMouseMove?: (position: Point) => void;
  /** Zoom change handler */
  onZoomChange?: (zoom: number) => void;
  /** Pan change handler */
  onPanChange?: (offset: Point) => void;
  /** Segmentation selection handler */
  onSegmentationSelect?: (segmentationId: string) => void;
  /** Segmentation creation handler */
  onSegmentationCreate?: (polygon: Polygon) => void;
  /** Segmentation update handler */
  onSegmentationUpdate?: (segmentationId: string, polygon: Polygon) => void;
  /** Additional CSS class */
  class?: string;
}

const SegmentationCanvas: Component<SegmentationCanvasProps>;
```

### SegmentationToolbar

Toolbar component with zoom, pan, and editing controls.

```typescript
interface SegmentationToolbarProps {
  /** Editor configuration */
  config: SegmentationEditorConfig;
  /** Editor state */
  state: SegmentationEditorState;
  /** Toggle editor handler */
  onToggleEditor?: () => void;
  /** Zoom change handler */
  onZoomChange?: (zoom: number) => void;
  /** Pan change handler */
  onPanChange?: (offset: { x: number; y: number }) => void;
  /** Additional CSS class */
  class?: string;
}

const SegmentationToolbar: Component<SegmentationToolbarProps>;
```

### SegmentationPanel

Panel component for managing segmentations with list view and controls.

```typescript
interface SegmentationPanelProps {
  /** Segmentations to display */
  segmentations: SegmentationData[];
  /** Selected segmentation ID */
  selectedSegmentation?: string;
  /** Segmentation selection handler */
  onSegmentationSelect?: (segmentationId: string) => void;
  /** Segmentation creation handler */
  onSegmentationCreate?: () => void;
  /** Segmentation deletion handler */
  onSegmentationDelete?: (segmentationId: string) => void;
  /** Additional CSS class */
  class?: string;
}

const SegmentationPanel: Component<SegmentationPanelProps>;
```

## 🎣 **Composables**

### useSegmentationEditor

Core composable for managing segmentation editor state and operations.

```typescript
interface UseSegmentationEditorOptions {
  config: SegmentationEditorConfig;
  state: SegmentationEditorState;
  onStateChange?: (state: SegmentationEditorState) => void;
  onSegmentationCreate?: (segmentation: SegmentationData) => void;
  onSegmentationUpdate?: (segmentation: SegmentationData) => void;
  onSegmentationDelete?: (segmentationId: string) => void;
}

interface UseSegmentationEditorReturn {
  // State management
  state: () => SegmentationEditorState;
  updateState: (updates: Partial<SegmentationEditorState>) => void;
  
  // Segmentation operations
  createSegmentation: (segmentation: SegmentationData) => void;
  updateSegmentation: (segmentation: SegmentationData) => void;
  deleteSegmentation: (segmentationId: string) => void;
  selectSegmentation: (segmentationId: string | undefined) => void;
  
  // Editor operations
  startCreating: () => void;
  stopCreating: () => void;
  startEditing: (segmentationId: string) => void;
  stopEditing: () => void;
  
  // Validation
  validateSegmentation: (segmentation: SegmentationData) => boolean;
  validatePolygon: (polygon: Polygon) => boolean;
  
  // Cleanup
  cleanup: () => void;
}

function useSegmentationEditor(
  options: UseSegmentationEditorOptions
): UseSegmentationEditorReturn;
```

**Example:**

```typescript
import { useSegmentationEditor } from "reynard-segmentation";

function MyComponent() {
  const editor = useSegmentationEditor({
    config: {
      enabled: true,
      showGrid: true,
      allowPolygonCreation: true,
      // ... other config options
    },
    state: {
      selectedSegmentation: undefined,
      isCreating: false,
      isEditing: false,
      zoom: 1,
      panOffset: { x: 0, y: 0 }
    },
    onSegmentationCreate: (segmentation) => {
      console.log("Created segmentation:", segmentation);
    },
    onSegmentationUpdate: (segmentation) => {
      console.log("Updated segmentation:", segmentation);
    }
  });

  // Use editor methods
  const handleCreatePolygon = () => {
    editor.startCreating();
  };

  const handleEditPolygon = (id: string) => {
    editor.startEditing(id);
  };

  return (
    <div>
      <button onClick={handleCreatePolygon}>Create Polygon</button>
      <button onClick={() => editor.stopCreating()}>Stop Creating</button>
    </div>
  );
}
```

### usePolygonEditor

Composable for managing polygon editing operations including vertex manipulation and geometric transformations.

```typescript
interface UsePolygonEditorOptions {
  config: SegmentationEditorConfig;
  onPolygonChange?: (polygon: Polygon, segmentationId?: string) => void;
}

interface UsePolygonEditorReturn {
  // Polygon operations
  addVertex: (polygon: Polygon, point: Point, index?: number) => Polygon;
  removeVertex: (polygon: Polygon, index: number) => Polygon;
  moveVertex: (polygon: Polygon, index: number, point: Point) => Polygon;
  insertVertex: (polygon: Polygon, edgeIndex: number, point: Point) => Polygon;
  
  // Geometric operations
  simplifyPolygon: (polygon: Polygon, tolerance?: number) => Polygon;
  smoothPolygon: (polygon: Polygon, iterations?: number) => Polygon;
  scalePolygon: (polygon: Polygon, scale: number, center?: Point) => Polygon;
  rotatePolygon: (polygon: Polygon, angle: number, center?: Point) => Polygon;
  translatePolygon: (polygon: Polygon, offset: Point) => Polygon;
  
  // Validation and utilities
  validatePolygon: (polygon: Polygon) => boolean;
  getPolygonCenter: (polygon: Polygon) => Point;
  getPolygonBounds: (polygon: Polygon) => { min: Point; max: Point };
  isPointInPolygon: (polygon: Polygon, point: Point) => boolean;
  getClosestVertex: (polygon: Polygon, point: Point) => { index: number; distance: number };
  getClosestEdge: (polygon: Polygon, point: Point) => { index: number; distance: number; point: Point };
  
  // Cleanup
  cleanup: () => void;
}

function usePolygonEditor(
  options: UsePolygonEditorOptions
): UsePolygonEditorReturn;
```

**Example:**

```typescript
import { usePolygonEditor } from "reynard-segmentation";

function MyPolygonEditor() {
  const polygonEditor = usePolygonEditor({
    config: {
      enabled: true,
      minPolygonArea: 100,
      maxPolygonArea: 1000000
    },
    onPolygonChange: (polygon, segmentationId) => {
      console.log("Polygon changed:", polygon);
      if (segmentationId) {
        console.log("For segmentation:", segmentationId);
      }
    }
  });

  const handleAddVertex = (polygon: Polygon, point: Point) => {
    const newPolygon = polygonEditor.addVertex(polygon, point);
    console.log("Added vertex:", newPolygon);
  };

  const handleSimplifyPolygon = (polygon: Polygon) => {
    const simplified = polygonEditor.simplifyPolygon(polygon, 2.0);
    console.log("Simplified polygon:", simplified);
  };

  const handleScalePolygon = (polygon: Polygon, scale: number) => {
    const scaled = polygonEditor.scalePolygon(polygon, scale);
    console.log("Scaled polygon:", scaled);
  };

  return (
    <div>
      {/* Your polygon editing UI */}
    </div>
  );
}
```

### useCanvasInteraction

Composable for handling mouse and touch interactions on the segmentation canvas.

```typescript
interface UseCanvasInteractionOptions {
  canvas: () => HTMLCanvasElement | undefined;
  config: SegmentationEditorConfig;
  state: SegmentationEditorState;
  onMouseMove?: (position: Point) => void;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (offset: Point) => void;
  onPolygonComplete?: (polygon: Point[]) => void;
  onPolygonUpdate?: (polygon: Point[], segmentationId?: string) => void;
}

interface UseCanvasInteractionReturn {
  handleMouseMove: (event: MouseEvent) => void;
  handleWheel: (event: WheelEvent) => void;
  handleMouseDown: (event: MouseEvent) => void;
  handleMouseUp: (event: MouseEvent) => void;
  handleDoubleClick: (event: MouseEvent) => void;
  handleTouchStart: (event: TouchEvent) => void;
  handleTouchMove: (event: TouchEvent) => void;
  handleTouchEnd: (event: TouchEvent) => void;
}

function useCanvasInteraction(
  options: UseCanvasInteractionOptions
): UseCanvasInteractionReturn;
```

## 🛠️ **Utilities**

### Global Functions

#### getSegmentationManager

Get the global segmentation manager instance.

```typescript
function getSegmentationManager(): SegmentationManager;
```

#### initializeSegmentationManager

Initialize the global segmentation manager.

```typescript
async function initializeSegmentationManager(): Promise<SegmentationManager>;
```

**Example:**

```typescript
import { getSegmentationManager, initializeSegmentationManager } from "reynard-segmentation";

// Initialize the global manager
const manager = await initializeSegmentationManager();

// Or get the existing instance
const existingManager = getSegmentationManager();
```

## 📖 **Examples**

### Basic Usage

```tsx
import { SegmentationEditor } from "reynard-segmentation";
import type { SegmentationData } from "reynard-segmentation";

function BasicSegmentationApp() {
  const [segmentations, setSegmentations] = useState<SegmentationData[]>([]);

  return (
    <SegmentationEditor
      imageSrc="/path/to/image.jpg"
      segmentations={segmentations}
      config={{
        enabled: true,
        showGrid: true,
        allowPolygonCreation: true
      }}
      events={{
        onSegmentationCreate: (segmentation) => {
          setSegmentations(prev => [...prev, segmentation]);
        }
      }}
    />
  );
}
```

### Advanced Usage with AI Integration

```tsx
import { 
  SegmentationEditor, 
  SegmentationManager, 
  initializeSegmentationManager 
} from "reynard-segmentation";

function AdvancedSegmentationApp() {
  const [segmentations, setSegmentations] = useState<SegmentationData[]>([]);
  const [manager, setManager] = useState<SegmentationManager | null>(null);

  useEffect(() => {
    initializeSegmentationManager().then(setManager);
  }, []);

  const generateAISegmentation = async () => {
    if (!manager) return;

    const result = await manager.generateSegmentation({
      type: "segmentation",
      imagePath: "/path/to/image.jpg",
      options: {
        minArea: 100,
        validateGeometry: true
      }
    });

    if (result.success) {
      setSegmentations(prev => [...prev, result.segmentation]);
    }
  };

  return (
    <div>
      <button onClick={generateAISegmentation}>
        Generate AI Segmentation
      </button>
      
      <SegmentationEditor
        imageSrc="/path/to/image.jpg"
        segmentations={segmentations}
        config={{
          enabled: true,
          showGrid: true,
          allowPolygonCreation: true,
          allowVertexEdit: true,
          allowEdgeEdit: true
        }}
        events={{
          onSegmentationCreate: (segmentation) => {
            setSegmentations(prev => [...prev, segmentation]);
          },
          onSegmentationUpdate: (segmentation) => {
            setSegmentations(prev => 
              prev.map(s => s.id === segmentation.id ? segmentation : s)
            );
          }
        }}
      />
    </div>
  );
}
```

### Export/Import Example

```tsx
import { SegmentationManager } from "reynard-segmentation";

function ExportImportExample() {
  const [manager] = useState(() => new SegmentationManager());

  const exportSegmentations = (segmentations: SegmentationData[]) => {
    const exportData = segmentations.map(seg => 
      manager.exportSegmentation(seg, "coco")
    );

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "segmentations.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSegmentations = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target?.result as string);
      const imported = data.map((item: any) => 
        manager.importSegmentation(item)
      );
      console.log("Imported segmentations:", imported);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <button onClick={() => exportSegmentations([])}>
        Export Segmentations
      </button>
      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importSegmentations(file);
        }}
      />
    </div>
  );
}
```

## 🎯 **Performance Guidelines**

### Best Practices

1. **Use batch processing** for multiple segmentations:

```typescript
const results = await manager.generateBatchSegmentations(tasks, (progress) => {
  console.log(`Progress: ${Math.round(progress * 100)}%`);
});
```

2. **Enable performance monitoring**:

```typescript
const stats = await manager.getStatistics();
console.log("Performance stats:", stats);
```

3. **Optimize polygon operations**:

```typescript
const result = await manager.refineSegmentation(segmentation, {
  simplify: true,
  simplificationTolerance: 2.0,
  validateGeometry: true
});
```

4. **Use appropriate configuration**:

```typescript
const config = {
  minPolygonArea: 100, // Filter out tiny polygons
  maxPolygonArea: 1000000, // Limit maximum size
  validateGeometry: true, // Ensure valid polygons
  simplifyPolygons: true // Reduce complexity
};
```

### Performance Targets

- **Segmentation Generation**: < 16ms per segmentation
- **Polygon Validation**: < 1ms per polygon
- **Export Operations**: < 5ms per export
- **Vertex Operations**: < 0.1ms per operation
- **Geometric Transformations**: < 0.5ms per transformation

---

*"In the realm of code, legends are not born—they are forged through the wise use of existing tools and the strategic extension of proven patterns."* 🦊

**May your API usage be efficient, your performance be optimal, and your segmentation be magnificent!** 🍀
