// Core embedding data structures
export interface EmbeddingPoint {
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
  originalEmbedding?: number[];
  reducedEmbedding?: number[];
}

// Rendering configuration interface
export interface EmbeddingRenderingConfig {
  // Point cloud settings
  pointSize: number;
  colorMapping: 'similarity' | 'cluster' | 'importance' | 'confidence' | 'custom';
  sizeMapping: 'importance' | 'confidence' | 'uniform';

  // Performance settings
  enableInstancing: boolean;
  enableLOD: boolean;
  enableCulling: boolean;
  lodDistance: number;
  lodLevels: number;
  maxPoints: number;

  // Visual effects
  enableThumbnails: boolean;
  enableTextSprites: boolean;
  thumbnailSize: number;
  textSpriteSize: number;
  enableHighlighting: boolean;
  highlightColor: [number, number, number];
  highlightSize: number;

  // Animation settings
  enableAnimations: boolean;
  animationDuration: number;
  animationEasing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic';

  // Search integration
  enableSearchHighlighting: boolean;
  searchResultColor: [number, number, number];
  searchResultSize: number;
  enableSimilarityPaths: boolean;
  similarityPathColor: [number, number, number];
  similarityPathWidth: number;

  // Clustering
  enableClustering: boolean;
  clusterColors: [number, number, number][];
  clusterOpacity: number;
  clusterOutlineColor: [number, number, number];
  clusterOutlineWidth: number;
}

// Material manager interface
// Generic material interface for THREE.js materials
export interface MaterialLike {
  type: string;
  transparent?: boolean;
  opacity?: number;
  color?: ColorLike;
  map?: unknown;
  needsUpdate?: boolean;
  dispose?: () => void;
  userData?: Record<string, unknown>;
  size?: number;
  [key: string]: unknown; // Allow additional properties
}

export interface MaterialManager {
  createPointMaterial(config: EmbeddingRenderingConfig): MaterialLike;
  createThumbnailMaterial(config: EmbeddingRenderingConfig): MaterialLike;
  createTextMaterial(config: EmbeddingRenderingConfig): MaterialLike;
  updateMaterial(material: MaterialLike, config: EmbeddingRenderingConfig): void;
  disposeMaterial(material: MaterialLike): void;
  disposeAllMaterials(): void;
}

// Generic geometry interface for THREE.js geometries
export interface GeometryLike {
  type: string;
  attributes?: Record<string, unknown>;
  dispose?: () => void;
  computeBoundingBox?: () => void;
  computeBoundingSphere?: () => void;
  userData?: Record<string, unknown>;
}

// Three.js specific geometry types
export interface BufferGeometryLike extends GeometryLike {
  setAttribute: (name: string, attribute: unknown) => void;
  getAttribute: (name: string) => unknown;
  deleteAttribute: (name: string) => void;
  index?: unknown;
}

export interface InstancedBufferGeometryLike extends BufferGeometryLike {
  instanceCount: number;
}

// Three.js library interface
export interface ThreeJSInterface {
  BufferGeometry: new () => BufferGeometryLike;
  InstancedBufferGeometry: new () => InstancedBufferGeometryLike;
  Float32BufferAttribute: new (array: Float32Array, itemSize: number) => unknown;
  InstancedBufferAttribute: new (array: Float32Array, itemSize: number) => unknown;
  PointsMaterial: new (options?: Record<string, unknown>) => MaterialLike;
  SpriteMaterial: new (options?: Record<string, unknown>) => MaterialLike;
  Raycaster: new () => RaycasterLike;
  Vector2: new () => Vector2Like;
  Vector3: new () => Vector3Like;
  Points: new (geometry: GeometryLike, material: MaterialLike) => PointsLike;
  Sprite: new (material: MaterialLike) => SpriteLike;
  TextureLoader: new () => { load: (url: string) => unknown };
  CanvasTexture: new (canvas: HTMLCanvasElement) => unknown;
}

// Type for Three.js module import
export interface ThreeJSModule {
  Raycaster: new () => RaycasterLike;
  Vector2: new () => Vector2Like;
  Vector3: new () => Vector3Like;
  Points: new (geometry: GeometryLike, material: MaterialLike) => PointsLike;
  Sprite: new (material: MaterialLike) => SpriteLike;
  SpriteMaterial: new (options?: Record<string, unknown>) => MaterialLike;
  TextureLoader: new () => { load: (url: string) => unknown };
  CanvasTexture: new (canvas: HTMLCanvasElement) => unknown;
}

export interface GeometryManager {
  createPointGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): GeometryLike;
  createThumbnailGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): GeometryLike;
  createTextGeometry(points: EmbeddingPoint[], config: EmbeddingRenderingConfig): GeometryLike;
  updateGeometry(geometry: GeometryLike, points: EmbeddingPoint[], config: EmbeddingRenderingConfig): void;
  disposeGeometry(geometry: GeometryLike): void;
  disposeAllGeometries(): void;
}

// THREE.js type definitions for better type safety
export interface Vector3Like {
  x: number;
  y: number;
  z: number;
  set: (x: number, y: number, z: number) => Vector3Like;
  setScalar: (scalar: number) => Vector3Like;
}

export interface ColorLike {
  r: number;
  g: number;
  b: number;
}

// Cluster data interface
export interface ClusterData {
  id: string;
  points: Vector3Like[];
  centroid: Vector3Like;
  color: ColorLike;
  label: string;
  statistics: {
    size: number;
    density: number;
    variance: number;
    averageSimilarity: number;
  };
}

// Vector visualization props
export interface VectorVisualizationProps {
  vectors: number[][];
  labels?: string[];
  title?: string;
  width?: number;
  height?: number;
  colormap?: 'viridis' | 'plasma' | 'inferno' | 'magma' | 'cividis';
  showLegend?: boolean;
  showValues?: boolean;
  className?: string;
  interactive?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableBrush?: boolean;
  enableTooltips?: boolean;
  onVectorSelect?: (index: number, vector: number[]) => void;
  onRegionSelect?: (indices: number[]) => void;
  pointOpacity?: number;
  animationSpeed?: number;
  transitionDuration?: number;
  enableAnimations?: boolean;
  animationEasing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic';
}

// Cluster visualization props
export interface ClusterVisualizationProps {
  clusters: ClusterData[];
  scene: SceneLike;
  camera: CameraLike;
  renderer: RendererLike;
  onClusterSelect?: (clusterId: string) => void;
  selectedClusterId?: string;
}

// Generic THREE.js object interfaces
export interface SceneLike {
  children: unknown[];
  add: (object: unknown) => void;
  remove: (object: unknown) => void;
  dispose?: () => void;
}

export interface CameraLike {
  position: Vector3Like;
  lookAt: (x: number, y: number, z: number) => void;
  updateProjectionMatrix?: () => void;
}

export interface RendererLike {
  render: (scene: SceneLike, camera: CameraLike) => void;
  setSize: (width: number, height: number) => void;
  dispose?: () => void;
  domElement?: HTMLElement;
}

// Three.js specific object types
export interface PointsLike {
  geometry: GeometryLike;
  material: MaterialLike;
  position: Vector3Like;
  userData: Record<string, unknown>;
  onClick?: (event: MouseEvent) => void;
}

export interface SpriteLike {
  material: MaterialLike;
  position: Vector3Like;
  scale: Vector3Like;
  userData: Record<string, unknown>;
  onHover?: () => void;
  onLeave?: () => void;
}

// Extended interfaces for Three.js objects with position/scale methods
export interface ThreeJSSpriteLike {
  position: {
    set: (x: number, y: number, z: number) => void;
    y: number;
  };
  scale: {
    setScalar: (scalar: number) => void;
  };
  userData: Record<string, unknown>;
  onHover?: () => void;
  onLeave?: () => void;
}

export interface RaycasterLike {
  setFromCamera: (mouse: Vector2Like, camera: CameraLike) => void;
  intersectObject: (object: PointsLike) => IntersectionLike[];
}

export interface Vector2Like {
  x: number;
  y: number;
}

export interface IntersectionLike {
  index?: number;
  point: Vector3Like;
  object: PointsLike;
}

// Base point cloud renderer props
export interface BasePointCloudRendererProps {
  points: EmbeddingPoint[];
  config: EmbeddingRenderingConfig;
  scene: SceneLike;
  camera: CameraLike;
  renderer: RendererLike;
  onPointSelect?: (pointId: string) => void;
  selectedPointIds?: string[];
  onConfigChange?: (config: EmbeddingRenderingConfig) => void;
}

// Rendering utilities
export const RENDERING_UTILS = {
  applyColorMapping: (_points: EmbeddingPoint[], _colorMapping: string) => {
    // Implementation will be in the actual utility file
  },
  applySizeMapping: (_points: EmbeddingPoint[], _sizeMapping: string, _baseSize: number) => {
    // Implementation will be in the actual utility file
  },
  filterPoints: (_points: EmbeddingPoint[], _config: EmbeddingRenderingConfig) => {
    // Implementation will be in the actual utility file
    return [] as EmbeddingPoint[];
  }
};
