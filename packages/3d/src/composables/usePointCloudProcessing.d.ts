import type { Point3D, PointCloudSettings } from "../types";
export declare function usePointCloudProcessing(points: () => Point3D[], settings: () => PointCloudSettings, maxPoints: () => number, pointSize: () => number, processPointsWithSearchIntegration: (points: Point3D[]) => Point3D[]): {
    processedPoints: import("solid-js").Accessor<Point3D[]>;
};
