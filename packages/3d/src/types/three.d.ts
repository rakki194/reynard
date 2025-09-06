// Type declarations for Three.js dynamic imports
declare module 'three' {
  export * from 'three';
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  export class OrbitControls {
    constructor(camera: any, domElement: HTMLElement);
    addEventListener(type: string, listener: (event: any) => void): void;
    removeEventListener(type: string, listener: (event: any) => void): void;
    dispose(): void;
    update(): void;
    set enabled(value: boolean);
    get enabled(): boolean;
    set enableDamping(value: boolean);
    set dampingFactor(value: number);
    set enableZoom(value: boolean);
    set enablePan(value: boolean);
    set enableRotate(value: boolean);
    set minDistance(value: number);
    set maxDistance(value: number);
    set maxPolarAngle(value: number);
    set autoRotate(value: boolean);
    set autoRotateSpeed(value: number);
    set zoomSpeed(value: number);
    set rotateSpeed(value: number);
    set panSpeed(value: number);
    set target(value: any);
    get target(): any;
  }
}
