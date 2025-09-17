import type { Point3D } from "../types";
export interface Cluster {
    id: string;
    points: Point3D[];
    center: [number, number, number];
    radius: number;
    density: number;
    color?: [number, number, number];
}
export interface ClusterDetectionOptions {
    algorithm: "kmeans" | "dbscan" | "hierarchical" | "gaussian-mixture";
    minPoints?: number;
    maxDistance?: number;
    maxClusters?: number;
    iterations?: number;
    tolerance?: number;
}
/**
 * K-means clustering algorithm
 */
export declare function kmeansClustering(points: Point3D[], k: number, maxIterations?: number, tolerance?: number): Cluster[];
/**
 * DBSCAN clustering algorithm
 */
export declare function dbscanClustering(points: Point3D[], minPoints?: number, maxDistance?: number): Cluster[];
/**
 * Hierarchical clustering algorithm
 */
export declare function hierarchicalClustering(points: Point3D[], maxClusters?: number): Cluster[];
/**
 * Main cluster detection function
 */
export declare function detectClusters(points: Point3D[], options: ClusterDetectionOptions): Cluster[];
/**
 * Calculate cluster statistics
 */
export declare function calculateClusterStats(clusters: Cluster[]): {
    totalClusters: number;
    totalPoints: number;
    averageClusterSize: number;
    averageDensity: number;
    averageRadius: number;
};
