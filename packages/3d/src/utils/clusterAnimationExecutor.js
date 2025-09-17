// Cluster animation execution utility
// Handles the animation loop and progress tracking
import { applyEasing } from "./easing";
/**
 * Execute cluster animation with progress tracking
 */
export function executeClusterAnimation(options) {
    const { duration, easing, onProgress, onComplete } = options;
    return new Promise((resolve) => {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = applyEasing(progress, easing);
            onProgress(easedProgress);
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            else {
                onComplete();
                resolve();
            }
        };
        requestAnimationFrame(animate);
    });
}
