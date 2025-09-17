export interface ControlsConfig {
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    enablePan: boolean;
    enableRotate: boolean;
    minDistance: number;
    maxDistance: number;
    maxPolarAngle: number;
    autoRotate: boolean;
    enableCameraAnimations: boolean;
}
export declare function useThreeJSControls(config: ControlsConfig): {
    controls: import("solid-js").Accessor<any>;
    createControls: (camera: any, renderer: any, onControlsChange?: () => void, onCameraAnimationStart?: () => void, onCameraAnimationEnd?: () => void) => Promise<import("three/examples/jsm/controls/OrbitControls.js").OrbitControls>;
};
