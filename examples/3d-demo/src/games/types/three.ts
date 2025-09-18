import type {
  Mesh,
  Scene,
  Camera,
  WebGLRenderer,
  Raycaster,
  Vector2,
  BufferGeometry,
  Material,
  AmbientLight,
  DirectionalLight,
  GridHelper,
  BoxGeometry,
  MeshStandardMaterial,
  Color,
  Fog,
} from "three";

export interface ThreeMesh extends Mesh {
  position: { set: (x: number, y: number, z: number) => void };
  rotation: { x: number; y: number };
  castShadow: boolean;
  receiveShadow: boolean;
}

export interface ThreeScene extends Scene {
  add: (object: any) => void;
  remove: (object: any) => void;
  fog: Fog | null;
  background: Color | null;
}

export interface ThreeCamera extends Camera {
  position: { set: (x: number, y: number, z: number) => void };
}

export interface ThreeRenderer extends WebGLRenderer {
  domElement: HTMLCanvasElement;
}

export interface ThreeRaycaster extends Raycaster {
  setFromCamera: (mouse: Vector2, camera: ThreeCamera) => void;
  intersectObjects: (objects: any[]) => Array<{ object: any }>;
}

export interface ThreeGeometry extends BufferGeometry {
  // Base geometry interface
}

export interface ThreeMaterial extends Material {
  // Base material interface
}

export interface ThreeAmbientLight extends AmbientLight {
  color: { setHex: (hex: number) => void };
  intensity: number;
}

export interface ThreeDirectionalLight extends DirectionalLight {
  position: { set: (x: number, y: number, z: number) => void };
  castShadow: boolean;
  color: { setHex: (hex: number) => void };
  intensity: number;
}

export interface ThreeGridHelper extends GridHelper {
  position: { y: number };
}

export interface ThreeVector2 extends Vector2 {
  x: number;
  y: number;
}

export interface ThreeJS {
  BoxGeometry: new (width: number, height: number, depth: number) => BoxGeometry;
  MeshStandardMaterial: new (options: {
    color: number;
    metalness?: number;
    roughness?: number;
    transparent?: boolean;
    opacity?: number;
    emissive?: number;
    emissiveIntensity?: number;
  }) => MeshStandardMaterial;
  Mesh: new (geometry: BoxGeometry, material: MeshStandardMaterial) => ThreeMesh;
  AmbientLight: new (color: number, intensity: number) => ThreeAmbientLight;
  DirectionalLight: new (color: number, intensity: number) => ThreeDirectionalLight;
  GridHelper: new (size: number, divisions: number) => ThreeGridHelper;
  Raycaster: new () => ThreeRaycaster;
  Vector2: new () => ThreeVector2;
  Color: new (color: number) => Color;
  Fog: new (color: number, near: number, far: number) => Fog;
}
