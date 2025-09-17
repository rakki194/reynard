import type { ClusterAnimation, EasingType, EmbeddingPoint } from "../types";
export declare function useClusterAnimations(): {
    clusterAnimations: import("solid-js").Accessor<ClusterAnimation[]>;
    isAnimationsDisabled: import("solid-js").Accessor<boolean>;
    createClusterAnimation: (clusterId: string, points: EmbeddingPoint[], center: [number, number, number], expansionRadius?: number, duration?: number, easing?: EasingType) => Promise<void>;
    getInterpolatedClusterPoints: (points: EmbeddingPoint[]) => EmbeddingPoint[];
    stopAnimations: () => never[];
};
