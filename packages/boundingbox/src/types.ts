/**
 * Core types for annotation editing in Reynard
 *
 * This module defines the foundational types that can be shared between
 * bounding box editing and future polygon/segmentation editing.
 */

/**
 * Base annotation interface that all annotation types extend
 */
export interface BaseAnnotation {
  id: string;
  label: string;
  color?: string;
  attributes?: Record<string, any>;
}

/**
 * Bounding box annotation
 */
export interface BoundingBox extends BaseAnnotation {
  x: number; // top-left x (absolute pixel)
  y: number; // top-left y (absolute pixel)
  width: number; // width in pixels
  height: number; // height in pixels
}

/**
 * Polygon annotation for segmentation masks
 */
export interface PolygonAnnotation extends BaseAnnotation {
  points: { x: number; y: number }[]; // Array of vertices defining the polygon
}

/**
 * Union type for all annotation types
 */
export type Annotation = BoundingBox | PolygonAnnotation;

/**
 * Image information required for coordinate transformations
 */
export interface ImageInfo {
  width: number;
  height: number;
  src?: string;
  alt?: string;
}

/**
 * Coordinate system types
 */
export interface DisplayCoordinates {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ImageCoordinates {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/**
 * Transform constraints for editing operations
 */
export interface TransformConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
}

/**
 * Handle types for interactive editing
 */
export type ResizeHandlePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "right"
  | "bottom"
  | "left";

export interface ResizeHandle {
  id: string;
  position: ResizeHandlePosition;
  cursor: string;
  constraints: TransformConstraints;
}

/**
 * Editing state for interactive operations
 */
export interface EditingState {
  isEditing: boolean;
  activeAnnotationId: string | null;
  operation: "create" | "resize" | "move" | "rotate" | null;
  startCoordinates: DisplayCoordinates | null;
  currentCoordinates: DisplayCoordinates | null;
}

/**
 * Event handlers for annotation operations
 */
export interface AnnotationEventHandlers {
  onAnnotationCreate?: (annotation: Annotation) => void;
  onAnnotationUpdate?: (id: string, annotation: Annotation) => void;
  onAnnotationDelete?: (id: string) => void;
  onAnnotationSelect?: (id: string | null) => void;
  onEditingStart?: (id: string, operation: string) => void;
  onEditingEnd?: (id: string, operation: string) => void;
  onEditingCancel?: (id: string) => void;
  onClearAll?: () => void;
}

/**
 * Configuration options for annotation editors
 */
export interface EditorConfig {
  enableCreation?: boolean;
  enableEditing?: boolean;
  enableDeletion?: boolean;
  enableSelection?: boolean;
  enableSnapping?: boolean;
  enableConstraints?: boolean;
  showLabels?: boolean;
  showHandles?: boolean;
  handleSize?: number;
  handleColor?: string;
  handleBorderColor?: string;
  labelClasses?: string[];
  defaultLabelClass?: string;
  // Additional properties needed by the components
  defaultLabel?: string;
  availableLabels?: string[];
  scale?: number;
  selectionColor?: string;
  selectionBorderColor?: string;
  selectionLineWidth?: number;
  boxStrokeColor?: string;
  boxStrokeWidth?: number;
  labelFontSize?: number;
  labelColor?: string;
}

/**
 * Canvas configuration for Fabric.js integration
 */
export interface CanvasConfig {
  width?: number;
  height?: number;
  backgroundColor?: string;
  selection?: boolean;
  preserveObjectStacking?: boolean;
}

/**
 * Export formats for annotations
 */
export enum AnnotationExportFormat {
  COCO = "COCO",
  VOC = "VOC",
  YOLO = "YOLO",
  LabelMe = "LabelMe",
  Custom = "Custom",
}

/**
 * Export configuration
 */
export interface ExportConfig {
  format: AnnotationExportFormat;
  includeMetadata?: boolean;
  includeAttributes?: boolean;
  customFormat?: (annotations: Annotation[]) => any;
}
