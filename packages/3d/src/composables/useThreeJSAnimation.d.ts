export declare function useThreeJSAnimation(): {
    clock: import("solid-js").Accessor<any>;
    animationId: import("solid-js").Accessor<number | null>;
    createClock: () => Promise<any>;
    startAnimationLoop: (scene: any, camera: any, renderer: any, controls: any, onRender?: (scene: any, camera: any, renderer: any, controls: any) => void) => void;
    handleResize: (container: HTMLDivElement, camera: any, renderer: any, controls: any) => () => void;
};
