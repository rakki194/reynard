export interface SceneConfig {
    width: number;
    height: number;
    backgroundColor: string;
}
export declare function useThreeJSScene(config: SceneConfig): {
    scene: import("solid-js").Accessor<any>;
    camera: import("solid-js").Accessor<any>;
    renderer: import("solid-js").Accessor<any>;
    createScene: (container: HTMLDivElement) => Promise<{
        scene: any;
        camera: any;
        renderer: any;
    }>;
};
