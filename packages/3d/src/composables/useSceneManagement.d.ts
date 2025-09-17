export interface SceneManagementConfig {
    scene: any;
    camera: any;
    renderer: any;
    points: any[];
    config: any;
    onPointSelect?: (pointId: string) => void;
}
export declare function useSceneManagement(config: SceneManagementConfig): {
    isInitialized: import("solid-js").Accessor<boolean>;
    pointCloudRenderer: import("solid-js").Accessor<any>;
    pointCloudEvents: import("solid-js").Accessor<any>;
    thumbnailSprites: import("solid-js").Accessor<any[]>;
    textSprites: import("solid-js").Accessor<any[]>;
    setThumbnailSprites: import("solid-js").Setter<any[]>;
    setTextSprites: import("solid-js").Setter<any[]>;
    clearScene: () => void;
};
