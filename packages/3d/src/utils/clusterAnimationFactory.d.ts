import type { ClusterAnimation, EmbeddingPoint, EasingType } from "../types";
export interface CreateClusterAnimationOptions {
    clusterId: string;
    points: EmbeddingPoint[];
    center: [number, number, number];
    expansionRadius?: number;
    duration?: number;
    easing?: EasingType;
}
/**
 * Create a cluster animation instance
 */
export declare function createClusterAnimationInstance(options: CreateClusterAnimationOptions): ClusterAnimation;
