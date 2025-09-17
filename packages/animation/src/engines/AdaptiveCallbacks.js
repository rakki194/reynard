/**
 * 🦊 Adaptive Callbacks
 * Creates adaptive callbacks for the animation engine
 */
export function createAdaptiveCallbacks(callbacks, qualityManager, engine) {
    return {
        ...callbacks,
        onFrameEnd: (frameTime, frameCount) => {
            try {
                const stats = engine.getPerformanceStats();
                qualityManager.adaptQuality(stats.currentFPS);
                callbacks.onFrameEnd?.(frameTime, frameCount);
            }
            catch (error) {
                console.error("🦊 AdaptiveCallbacks: Error in onFrameEnd callback", error);
            }
        },
    };
}
