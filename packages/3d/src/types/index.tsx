// Core 3D types and interfaces for Reynard 3D package

// Basic event types for cross-platform compatibility
export interface BaseEvent3D {
  type: string;
  target?: unknown;
  preventDefault?(): void;
  stopPropagation?(): void;
}

// Global type declarations for browser APIs
declare global {
  interface EventTarget {
    addEventListener(type: string, listener: any, options?: boolean | any): void;
    removeEventListener(type: string, listener: any, options?: boolean | any): void;
    dispatchEvent(event: Event): boolean;
  }
}

export interface MouseEvent3D extends BaseEvent3D {
  clientX: number;
  clientY: number;
  button: number;
  altKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}

export interface TouchPoint {
  clientX: number;
  clientY: number;
  identifier: number;
}

export interface TouchEvent3D extends BaseEvent3D {
  touches: TouchPoint[];
  targetTouches: TouchPoint[];
  changedTouches: TouchPoint[];
  altKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

export interface CameraSettings {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  position?: Vector3;
  target?: Vector3;
}

export interface LightSettings {
  type: 'ambient' | 'directional' | 'point' | 'spot';
  color?: Color;
  intensity?: number;
  position?: Vector3;
  direction?: Vector3;
  castShadow?: boolean;
}

export interface RendererSettings {
  antialias?: boolean;
  alpha?: boolean;
  preserveDrawingBuffer?: boolean;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  shadowMap?: {
    enabled?: boolean;
    type?: 'basic' | 'pcf' | 'pcfsoft' | 'vsm';
  };
  toneMapping?: {
    type?: 'linear' | 'reinhard' | 'cineon' | 'aces' | 'acesfilmic';
    exposure?: number;
  };
  outputColorSpace?: 'srgb' | 'srgb-linear' | 'display-p3';
}

export interface ControlsSettings {
  enableDamping?: boolean;
  dampingFactor?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
  maxPolarAngle?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  zoomSpeed?: number;
  rotateSpeed?: number;
  panSpeed?: number;
}

// Point cloud specific types
export interface Point3D {
  id: string;
  position: [number, number, number];
  color?: [number, number, number];
  size?: number;
  metadata?: Record<string, unknown>;
  importance?: number;
  confidence?: number;
  clusterId?: string;
  similarity?: number;
  imageUrl?: string;
  imageThumbnail?: string;
  textContent?: string;
  contentType?: 'image' | 'text' | 'mixed';
  thumbnailDataUrl?: string;
}

export interface PointCloudSettings {
  maxPoints?: number;
  pointSize?: number;
  enableInstancing?: boolean;
  enableLOD?: boolean;
  enableCulling?: boolean;
  lodDistance?: number;
  lodLevels?: number;
  colorMapping?: 'similarity' | 'cluster' | 'importance' | 'confidence' | 'custom';
  sizeMapping?: 'importance' | 'confidence' | 'uniform';
  enableHighlighting?: boolean;
  highlightColor?: [number, number, number];
  highlightSize?: number;
}

// Animation types
export interface AnimationSettings {
  enableAnimations?: boolean;
  animationDuration?: number;
  animationEasing?: EasingType;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

export type EasingType =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic';

export interface PointAnimation {
  id: string;
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  startColor: [number, number, number];
  endColor: [number, number, number];
  startSize: number;
  endSize: number;
  delay: number;
}

export interface CameraAnimation {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  startTarget: [number, number, number];
  endTarget: [number, number, number];
  duration: number;
  easing: EasingType;
}

export interface ClusterAnimation {
  clusterId: string;
  points: PointAnimation[];
  expansionRadius: number;
  duration: number;
  easing: EasingType;
  progress?: number;
}

// Geometry types
export interface Geometry3D {
  type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'torus' | 'custom';
  parameters?: Record<string, number | string | boolean>;
  vertices?: number[];
  indices?: number[];
  normals?: number[];
  uvs?: number[];
}

export interface Material3D {
  type: 'basic' | 'standard' | 'physical' | 'phong' | 'lambert';
  color?: Color;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  transparent?: boolean;
  wireframe?: boolean;
  map?: string; // texture URL
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
}

export interface Mesh3D {
  id: string;
  geometry: Geometry3D;
  material: Material3D;
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  castShadow?: boolean;
  receiveShadow?: boolean;
  visible?: boolean;
}

// Scene management types
export interface Scene3D {
  id: string;
  name: string;
  backgroundColor?: Color;
  fog?: {
    type: 'linear' | 'exponential';
    color: Color;
    near?: number;
    far?: number;
    density?: number;
  };
  meshes: Mesh3D[];
  lights: LightSettings[];
}

// Performance monitoring types
export interface PerformanceStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  memoryUsage: number;
  gpuMemoryUsage?: number;
}

export interface RenderStats {
  totalPoints: number;
  visiblePoints: number;
  renderedPoints: number;
  fps: number;
  memoryUsage: number;
  lodLevel: number;
  frustumCulled: number;
  occlusionCulled: number;
}

// Event types
export interface PointCloudEvent {
  type: 'click' | 'hover' | 'select' | 'deselect';
  point: Point3D;
  event: MouseEvent3D | TouchEvent3D;
  selectedPoints?: Point3D[];
}

export interface SceneEvent {
  type: 'ready' | 'resize' | 'dispose';
  scene?: unknown;
  camera?: unknown;
  renderer?: unknown;
  controls?: unknown;
}

// Search integration types (from yipyap)
export interface SearchIntegrationSettings {
  enableSearchIntegration?: boolean;
  searchQueryEmbedding?: number[];
  searchResults?: Array<{
    id?: number | string;
    score: number;
    embedding_vector?: number[];
    [key: string]: unknown;
  }>;
  reductionMethod?: string;
  transformedData?: number[][];
  originalIndices?: number[];
  highlightQueryPoint?: boolean;
  showSimilarityPaths?: boolean;
  showSimilarityRadius?: boolean;
  radiusThreshold?: number;
  maxPathLength?: number;
  queryPointColor?: [number, number, number];
  pathColor?: [number, number, number];
  radiusColor?: [number, number, number];
}

// Component props interfaces
export interface ThreeJSVisualizationProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  showGrid?: boolean;
  showAxes?: boolean;
  autoRotate?: boolean;
  enableDamping?: boolean;
  dampingFactor?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
  maxPolarAngle?: number;
  className?: string;
  onSceneReady?: (scene: unknown, camera: unknown, renderer: unknown, controls: unknown) => void;
  onRender?: (scene: unknown, camera: unknown, renderer: unknown, controls: unknown) => void;
  onControlsChange?: (event: unknown) => void;
  enableCameraAnimations?: boolean;
  onCameraAnimationStart?: () => void;
  onCameraAnimationEnd?: () => void;
}

export interface PointCloudVisualizationProps extends ThreeJSVisualizationProps {
  points: Point3D[];
  settings?: PointCloudSettings;
  animationSettings?: AnimationSettings;
  searchIntegration?: SearchIntegrationSettings;
  onPointClick?: (point: Point3D, event: MouseEvent3D | TouchEvent3D) => void;
  onPointHover?: (point: Point3D | null, event: MouseEvent3D | TouchEvent3D) => void;
  onSelectionChange?: (selectedPoints: Point3D[]) => void;
  onSearchIntegrationReady?: (data: unknown) => void;
}

// Export rendering types
export * from './rendering';
