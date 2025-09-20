// Three.js specific type interfaces
// Extracted from rendering.ts for modularity

import type { Vector3Like, ColorLike, Vector2Like } from "./core";

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
  intersectObjects: (objects: unknown[]) => IntersectionLike[];
}

export interface IntersectionLike {
  index?: number;
  point: Vector3Like;
  object: PointsLike;
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
