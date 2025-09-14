# reynard-boundingbox

> Reusable bounding box and annotation editing components for Reynard

A comprehensive set of tools for creating, editing, and
managing bounding box annotations in web applications. Built with SolidJS and
designed to be extensible for future annotation types like polygon segmentation.

## ✨ Features

- **🎯 Bounding Box Editing**: Create, resize, move, and delete bounding boxes with intuitive interactions
- **🎨 Interactive Canvas**: Fabric.js integration for smooth, responsive editing experience
- **🔄 Coordinate Transformation**: Automatic conversion between image and display coordinates
- **✅ Validation**: Built-in validation for annotation data integrity and constraints
- **🏗️ Extensible Architecture**: Designed to support future annotation types (polygons, segmentation masks)
- **📘 TypeScript Support**: Full type safety and IntelliSense support
- **♿ Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **📱 Responsive Design**: Mobile-first design that works across all device sizes
- **🎨 Theme Support**: Built-in support for light/dark themes and high contrast mode

## 🚀 Quick Start

### Installation

```bash
npm install reynard-boundingbox solid-js fabric
```

### Basic Usage

```tsx
import { BoundingBoxEditor } from "reynard-boundingbox";
import type { BoundingBox, ImageInfo } from "reynard-boundingbox";

function MyApp() {
  const imageInfo: ImageInfo = {
    width: 1920,
    height: 1080,
    src: "/path/to/image.jpg",
  };

  const handleAnnotationCreate = (box: BoundingBox) => {
    console.log("Created bounding box:", box);
  };

  const handleAnnotationUpdate = (id: string, box: BoundingBox) => {
    console.log("Updated bounding box:", id, box);
  };

  const handleAnnotationDelete = (id: string) => {
    console.log("Deleted bounding box:", id);
  };

  return (
    <BoundingBoxEditor
      imageInfo={imageInfo}
      config={{
        enableCreation: true,
        enableEditing: true,
        enableDeletion: true,
        labelClasses: ["person", "vehicle", "animal", "object"],
        defaultLabelClass: "object",
      }}
      eventHandlers={{
        onAnnotationCreate: handleAnnotationCreate,
        onAnnotationUpdate: handleAnnotationUpdate,
        onAnnotationDelete: handleAnnotationDelete,
      }}
      containerWidth={800}
      containerHeight={600}
    />
  );
}
```

## 📚 API Reference

### Components

#### `BoundingBoxEditor`

The main component for bounding box editing.

> _Props:_

| Prop              | Type                      | Default | Description                                          |
| ----------------- | ------------------------- | ------- | ---------------------------------------------------- |
| `imageInfo`       | `ImageInfo`               | -       | **Required.** Image information including dimensions |
| `config`          | `EditorConfig`            | `{}`    | Configuration options for the editor                 |
| `eventHandlers`   | `AnnotationEventHandlers` | `{}`    | Event handlers for annotation operations             |
| `initialBoxes`    | `BoundingBox[]`           | `[]`    | Initial bounding boxes to display                    |
| `containerWidth`  | `number`                  | `800`   | Width of the editor container                        |
| `containerHeight` | `number`                  | `600`   | Height of the editor container                       |
| `className`       | `string`                  | `''`    | Additional CSS class names                           |

### Types

#### `BoundingBox`

```tsx
interface BoundingBox {
  id: string; // Unique identifier
  label: string; // Class/category name
  x: number; // Top-left x coordinate (pixels)
  y: number; // Top-left y coordinate (pixels)
  width: number; // Width in pixels
  height: number; // Height in pixels
  color?: string; // Optional color for UI
  attributes?: Record<string, any>; // Extensible metadata
}
```

#### `ImageInfo`

```tsx
interface ImageInfo {
  width: number; // Image width in pixels
  height: number; // Image height in pixels
  src?: string; // Optional image source URL
  alt?: string; // Optional alt text
}
```

#### `EditorConfig`

```tsx
interface EditorConfig {
  enableCreation?: boolean; // Enable creating new boxes
  enableEditing?: boolean; // Enable editing existing boxes
  enableDeletion?: boolean; // Enable deleting boxes
  enableSelection?: boolean; // Enable box selection
  enableSnapping?: boolean; // Enable snap-to-grid
  enableConstraints?: boolean; // Enable size constraints
  showLabels?: boolean; // Show box labels
  showHandles?: boolean; // Show resize handles
  handleSize?: number; // Size of resize handles
  handleColor?: string; // Color of resize handles
  handleBorderColor?: string; // Border color of handles
  labelClasses?: string[]; // Available label classes
  defaultLabelClass?: string; // Default label class
}
```

### Composables

#### `useBoundingBoxes`

Manages a collection of bounding boxes with reactive state.

```tsx
import { useBoundingBoxes } from "reynard-boundingbox";

const {
  boxes, // Signal<BoundingBox[]>
  addBox, // (box: BoundingBox) => boolean
  updateBox, // (id: string, updates: Partial<BoundingBox>) => boolean
  deleteBox, // (id: string) => boolean
  selectBox, // (id: string | null) => void
  selectedBoxId, // Signal<string | null>
  clearBoxes, // () => void
  getBox, // (id: string) => BoundingBox | undefined
  hasBox, // (id: string) => boolean
  boxCount, // Signal<number>
  selectedBox, // Signal<BoundingBox | undefined>
  validationErrors, // Signal<Record<string, string[]>>
} = useBoundingBoxes({
  initialBoxes: [],
  imageInfo: { width: 1920, height: 1080 },
  enableValidation: true,
});
```

#### `useBoxResize`

Provides resize functionality for bounding boxes.

```tsx
import { useBoxResize } from "reynard-boundingbox";

const {
  resizeState, // Signal<ResizeState>
  handles, // Signal<ResizeHandle[]>
  startResize, // (boxId, handle, dimensions) => void
  updateResize, // (dimensions) => void
  endResize, // () => void
  cancelResize, // () => void
  isResizing, // () => boolean
  getActiveHandle, // () => ResizeHandle | null
} = useBoxResize({
  minWidth: 10,
  minHeight: 10,
  enableProportionalResizing: true,
  onResizeStart: (boxId, handle) => console.log("Resize started"),
  onResizeMove: (boxId, dimensions) => console.log("Resize move"),
  onResizeEnd: (boxId, dimensions) => console.log("Resize ended"),
});
```

#### `useBoxMove`

Provides move functionality for bounding boxes.

```tsx
import { useBoxMove } from "reynard-boundingbox";

const {
  moveState, // Signal<MoveState | null>
  isMoving, // Signal<boolean>
  movingBoxId, // Signal<string | null>
  startBoxMove, // (boxId, box, startX, startY) => void
  updateBoxMove, // (currentX, currentY) => void
  endBoxMove, // () => void
  cancelBoxMove, // () => void
} = useBoxMove({
  imageInfo: { width: 1920, height: 1080 },
  isEnabled: true,
  enableSnapping: true,
  enableAlignment: true,
  onBoxMoved: (boxId, newBox) => console.log("Box moved"),
  onBoxMoveEnd: (boxId) => console.log("Move ended"),
});
```

### Utilities

#### Coordinate Transformation

```tsx
import {
  imageToDisplayCoords,
  displayToImageCoords,
  boundingBoxToDisplayCoords,
  boundingBoxToImageCoords,
} from "reynard-boundingbox";

// Convert between coordinate systems
const displayCoords = imageToDisplayCoords(
  { x: 100, y: 100, width: 200, height: 150 },
  imageInfo,
  containerWidth,
  containerHeight,
);

const imageCoords = displayToImageCoords(
  displayCoords,
  imageInfo,
  containerWidth,
  containerHeight,
);
```

#### Validation

```tsx
import {
  validateBoundingBox,
  checkBoundingBoxConstraints,
  boundingBoxesOverlap,
} from "reynard-boundingbox";

// Validate bounding box
const validation = validateBoundingBox(box, imageInfo);
if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
}

// Check constraints
const constraints = checkBoundingBoxConstraints(box, {
  minWidth: 10,
  minHeight: 10,
  maxWidth: 1000,
  maxHeight: 1000,
});

// Check overlap
const overlap = boundingBoxesOverlap(box1, box2);
```

## 🏗️ Architecture

The package is organized into several layers for maximum reusability and extensibility:

### Core Types (`types.ts`)

- Defines foundational interfaces that can be shared between bounding boxes and future polygon annotations
- Includes `BaseAnnotation`, `BoundingBox`, `PolygonAnnotation`, and utility types

### Utilities (`utils/`)

- **Coordinate Transformation**: Convert between image and display coordinate systems
- **Validation**: Ensure data integrity and constraint compliance

### Composables (`composables/`)

- **State Management**: Reactive state for bounding box collections
- **Resize Logic**: Handle resize operations with constraints and proportional scaling
- **Move Logic**: Handle drag-to-move with snapping and alignment

### Components (`components/`)

- **UI Components**: React components for the editing interface
- **Styling**: CSS modules with theme support and accessibility features

## 🔮 Future Extensions

This architecture is designed to support future annotation types:

### Polygon Segmentation (`reynard-segmentation`)

- Extend `BaseAnnotation` for polygon points
- Reuse coordinate transformation utilities
- Add polygon-specific validation
- Create polygon editing components

### Additional Annotation Types

- **Keypoints**: Point-based annotations
- **Polylines**: Line-based annotations
- **3D Bounding Boxes**: Extend to 3D coordinate systems

## 🎨 Theming

The package includes built-in support for themes:

```css
/* Light theme (default) */
.bounding-box-editor {
  --bbox-bg: #ffffff;
  --bbox-border: #e1e5e9;
  --bbox-text: #374151;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  .bounding-box-editor {
    --bbox-bg: #1f2937;
    --bbox-border: #374151;
    --bbox-text: #f9fafb;
  }
}

/* High contrast */
@media (prefers-contrast: high) {
  .bounding-box-editor {
    --bbox-border-width: 2px;
  }
}
```

## ♿ Accessibility

The package is built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support for all operations
- **Screen Reader Support**: ARIA labels and descriptions
- **High Contrast Mode**: Support for high contrast display preferences
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus handling during operations

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:run -- --coverage

# Run tests in watch mode
npm run test
```

## 📦 Bundle Size

The package is optimized for minimal bundle size:

- **Core**: ~15KB gzipped
- **With Fabric.js**: ~45KB gzipped
- **Tree-shakeable**: Only import what you use

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../../LICENSE.md) for details.

## 🙏 Acknowledgments

- Built with [SolidJS](https://www.solidjs.com/) for reactive UI
- Uses [Fabric.js](http://fabricjs.com/) for canvas interactions
- Inspired by modern annotation tools and accessibility best practices
