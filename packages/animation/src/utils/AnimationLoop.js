/**
 * 🦊 Animation Loop Utilities
 * Unified animation loop system from 3D package
 */
import { applyEasing } from "../easing/easing";
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
/**
 * Create a simple animation loop with custom timing
 */
export function createSimpleAnimationLoop(duration, easing, onUpdate, onComplete) {
    return new Promise((resolve) => {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = applyEasing(progress, easing);
            onUpdate(easedProgress);
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            else {
                onComplete?.();
                resolve();
            }
        };
        requestAnimationFrame(animate);
    });
}
/**
 * Create a repeating animation loop
 */
export function createRepeatingAnimationLoop(duration, easing, onUpdate, onCycleComplete, maxCycles) {
    let cycleCount = 0;
    let isRunning = true;
    const runCycle = () => {
        if (!isRunning)
            return;
        createSimpleAnimationLoop(duration, easing, onUpdate, () => {
            cycleCount++;
            onCycleComplete?.();
            if (maxCycles && cycleCount >= maxCycles) {
                isRunning = false;
                return;
            }
            if (isRunning) {
                runCycle();
            }
        });
    };
    runCycle();
    // Return stop function
    return () => {
        isRunning = false;
    };
}
/**
 * Create a ping-pong animation loop (forward then reverse)
 */
export function createPingPongAnimationLoop(duration, easing, onUpdate, onComplete) {
    return new Promise((resolve) => {
        let isForward = true;
        let cycleCount = 0;
        const runCycle = () => {
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                let easedProgress;
                if (isForward) {
                    easedProgress = applyEasing(progress, easing);
                }
                else {
                    // Reverse the easing for backward motion
                    easedProgress = applyEasing(1 - progress, easing);
                }
                onUpdate(easedProgress);
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
                else {
                    if (isForward) {
                        isForward = false;
                        runCycle();
                    }
                    else {
                        onComplete?.();
                        resolve();
                    }
                }
            };
            requestAnimationFrame(animate);
        };
        runCycle();
    });
}
