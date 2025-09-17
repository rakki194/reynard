/**
 * 🦊 Throttled Animation Engine
 * Performance-optimized animation engine with throttling
 */
import { createAnimationCore } from "../core/AnimationCore";
export function createThrottledAnimationEngine(config = {
    frameRate: 60,
    maxFPS: 120,
    enableVSync: true,
    enablePerformanceMonitoring: true,
    throttleInterval: 16, // ~60fps
}) {
    const engine = createAnimationCore(config);
    let lastThrottledTime = 0;
    const throttledStart = (callbacks) => {
        const throttledCallbacks = {
            ...callbacks,
            onUpdate: (deltaTime, frameCount) => {
                const now = performance.now();
                if (now - lastThrottledTime >= config.throttleInterval) {
                    callbacks.onUpdate?.(deltaTime, frameCount);
                    lastThrottledTime = now;
                }
            },
        };
        engine.start(throttledCallbacks);
    };
    return {
        ...engine,
        start: throttledStart,
    };
}
