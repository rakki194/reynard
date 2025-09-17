/**
 * Animation Configuration
 *
 * Configuration utilities for staggered animations.
 */
/**
 * Create default animation configuration
 */
export function createDefaultAnimationConfig() {
    return {
        baseDelay: 0,
        staggerStep: 100,
        maxDelay: 1000,
        direction: "forward",
        duration: 300,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        transform: {
            entrance: "translateY(20px) scale(0.95)",
            exit: "translateY(-20px) scale(0.95)",
            scale: 1,
            translateX: 0,
            translateY: 0,
        },
    };
}
