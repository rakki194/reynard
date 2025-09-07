/**
 * ImageViewer Types
 * Type definitions for the ImageViewer component system
 */

export interface ImageViewerProps {
  /** Source URL of the image */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Initial zoom level (1.0 = 100%) */
  initialZoom?: number;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
  /** Whether to enable panning */
  enablePan?: boolean;
  /** Whether to enable zooming */
  enableZoom?: boolean;
  /** Whether to show zoom controls */
  showZoomControls?: boolean;
  /** Whether to show navigation controls */
  showNavigationControls?: boolean;
  /** Callback when zoom changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback when pan changes */
  onPanChange?: (x: number, y: number) => void;
  /** Custom class name */
  class?: string;
}

export interface ImageViewerState {
  zoom: number;
  panX: number;
  panY: number;
  isDragging: boolean;
  lastMousePos: { x: number; y: number };
}

export interface ImageViewerConfig {
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
  enablePan: boolean;
  enableZoom: boolean;
  showZoomControls: boolean;
  showNavigationControls: boolean;
}

export interface ZoomControlsProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export interface NavigationControlsProps {
  onReset: () => void;
  onFitToView: () => void;
}

export interface InstructionsProps {
  enableZoom: boolean;
  enablePan: boolean;
}
