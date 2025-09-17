import { applyEasing } from "./easing";
/**
 * Create animation loop for point transitions
 */
export function createAnimationLoop(animationState, duration, easing, onUpdate, onComplete) {
    return new Promise((resolve) => {
        const animate = (currentTime) => {
            const elapsed = currentTime - animationState.startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = applyEasing(progress, easing);
            animationState.progress = easedProgress;
            onUpdate(easedProgress);
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
/**
 * Create cluster animation loop
 */
export function createClusterAnimationLoop(startTime, duration, easing, onUpdate, onComplete) {
    return new Promise((resolve) => {
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = applyEasing(progress, easing);
            onUpdate(easedProgress);
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
