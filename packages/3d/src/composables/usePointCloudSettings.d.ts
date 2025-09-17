import type { PointCloudSettings } from "../types";
export declare function usePointCloudSettings(settings?: () => PointCloudSettings): {
    maxPoints: import("solid-js").Accessor<number>;
    pointSize: import("solid-js").Accessor<number>;
    enableInstancing: import("solid-js").Accessor<boolean>;
    enableLOD: import("solid-js").Accessor<boolean>;
    enableCulling: import("solid-js").Accessor<boolean>;
    lodDistance: import("solid-js").Accessor<number>;
    lodLevels: import("solid-js").Accessor<number>;
    enableHighlighting: import("solid-js").Accessor<boolean>;
    highlightColor: import("solid-js").Accessor<number[]>;
    highlightSize: import("solid-js").Accessor<number>;
};
