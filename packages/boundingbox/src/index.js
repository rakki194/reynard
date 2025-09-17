/**
 * reynard-boundingbox
 *
 * Reusable bounding box and annotation editing components for Reynard.
 *
 * This package provides a comprehensive set of tools for creating, editing,
 * and managing bounding box annotations in web applications. It's designed
 * to be reusable across different projects and extensible for future
 * annotation types like polygon segmentation.
 *
 * ## Features
 *
 * - **Bounding Box Editing**: Create, resize, move, and delete bounding boxes
 * - **Interactive Canvas**: Fabric.js integration for smooth editing experience
 * - **Coordinate Transformation**: Automatic conversion between image and display coordinates
 * - **Validation**: Built-in validation for annotation data integrity
 * - **Extensible Architecture**: Designed to support future annotation types
 * - **TypeScript Support**: Full type safety and IntelliSense support
 * - **Accessibility**: WCAG compliant with keyboard navigation support
 *
 * ## Usage
 *
 * ```tsx
 * import { BoundingBoxEditor } from 'reynard-boundingbox';
 *
 * function MyApp() {
 *   const imageInfo = { width: 1920, height: 1080, src: '/image.jpg' };
 *
 *   return (
 *     <BoundingBoxEditor
 *       imageInfo={imageInfo}
 *       config={{
 *         enableCreation: true,
 *         enableEditing: true,
 *         enableDeletion: true,
 *         labelClasses: ['person', 'vehicle', 'animal']
 *       }}
 *       eventHandlers={{
 *         onAnnotationCreate: (box) => console.log('Created:', box),
 *         onAnnotationUpdate: (id, box) => console.log('Updated:', id, box),
 *         onAnnotationDelete: (id) => console.log('Deleted:', id)
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * ## Architecture
 *
 * The package is organized into several layers:
 *
 * - **Types**: Core type definitions shared across all components
 * - **Utils**: Utility functions for coordinate transformation and validation
 * - **Composables**: Reactive state management and business logic
 * - **Components**: UI components for annotation editing
 *
 * This architecture allows for easy extension to support polygon annotations
 * and other annotation types in the future.
 */
// Utility functions
export { calculateImageDisplayArea, imageToDisplayCoords, displayToImageCoords, boundingBoxToDisplayCoords, boundingBoxToImageCoords, clampToImageBounds, clampBoundingBoxToImage, } from "./utils/coordinateTransform";
export { validateBoundingBox, validatePolygonAnnotation, validateTransformConstraints, checkBoundingBoxConstraints, calculateBoundingBoxArea, calculatePolygonArea, boundingBoxesOverlap, calculateBoundingBoxIoU, } from "./utils/validation";
// Composables
export { useBoundingBoxes, } from "./composables/useBoundingBoxes";
export { useBoxResize, } from "./composables/useBoxResize";
export { useBoxMove, } from "./composables/useBoxMove";
// Components
export { BoundingBoxEditor, } from "./components/BoundingBoxEditor";
