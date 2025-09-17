import type { Point3D } from "../types";
export declare function usePointCloudState(): {
    pointCloud: import("solid-js").Accessor<unknown>;
    visiblePoints: import("solid-js").Accessor<Point3D[]>;
    renderStats: import("solid-js").Accessor<{
        totalPoints: number;
        visiblePoints: number;
        renderedPoints: number;
        fps: number;
        memoryUsage: number;
    }>;
    setPointCloud: import("solid-js").Setter<unknown>;
    setVisiblePoints: import("solid-js").Setter<Point3D[]>;
    setRenderStats: import("solid-js").Setter<{
        totalPoints: number;
        visiblePoints: number;
        renderedPoints: number;
        fps: number;
        memoryUsage: number;
    }>;
};
