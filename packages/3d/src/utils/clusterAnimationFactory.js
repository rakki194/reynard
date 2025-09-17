// Cluster animation factory utility
// Creates and manages cluster animation instances
import { createClusterPointAnimations } from "./clusterInterpolation";
/**
 * Create a cluster animation instance
 */
export function createClusterAnimationInstance(options) {
    const { clusterId, points, center, expansionRadius = 2, duration = 800, easing = "easeOutElastic", } = options;
    const animations = createClusterPointAnimations(points, center, expansionRadius);
    return {
        clusterId,
        points: animations,
        expansionRadius,
        duration,
        easing,
    };
}
