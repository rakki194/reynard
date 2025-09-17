import type { ThreeJSVisualizationProps } from "../types";
export declare function useThreeJSInitialization(props: ThreeJSVisualizationProps): {
    isLoading: import("solid-js").Accessor<boolean>;
    error: import("solid-js").Accessor<string | null>;
    sceneComposable: {
        scene: import("solid-js").Accessor<any>;
        camera: import("solid-js").Accessor<any>;
        renderer: import("solid-js").Accessor<any>;
        createScene: (container: HTMLDivElement) => Promise<{
            scene: any;
            camera: any;
            renderer: any;
        }>;
    };
    controlsComposable: {
        controls: import("solid-js").Accessor<any>;
        createControls: (camera: any, renderer: any, onControlsChange?: () => void, onCameraAnimationStart?: () => void, onCameraAnimationEnd?: () => void) => Promise<import("three/examples/jsm/controls/OrbitControls.js").OrbitControls>;
    };
    animationComposable: {
        clock: import("solid-js").Accessor<any>;
        animationId: import("solid-js").Accessor<number | null>;
        createClock: () => Promise<any>;
        startAnimationLoop: (scene: any, camera: any, renderer: any, controls: any, onRender?: (scene: any, camera: any, renderer: any, controls: any) => void) => void;
        handleResize: (container: HTMLDivElement, camera: any, renderer: any, controls: any) => () => void;
    };
    initializeScene: (container: HTMLDivElement) => Promise<void>;
};
