import type { ThreeJSVisualizationProps } from "../types";
export declare function useThreeJSVisualization(props: ThreeJSVisualizationProps): {
    isLoading: import("solid-js").Accessor<boolean>;
    error: import("solid-js").Accessor<string>;
    scene: import("solid-js").Accessor<any>;
    camera: import("solid-js").Accessor<any>;
    renderer: import("solid-js").Accessor<any>;
    controls: import("solid-js").Accessor<any>;
    clock: import("solid-js").Accessor<any>;
    initializeScene: (container: HTMLDivElement) => Promise<void>;
    handleResize: (container: HTMLDivElement) => () => void;
};
