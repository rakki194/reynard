/**
 * 🦊 Unified Easing System
 * Consolidated easing functions from across the Reynard codebase
 */
/**
 * Comprehensive easing functions collection
 * Combines easing from 3D package, colors package, and additional functions
 */
export const Easing = {
    // Linear
    linear: (t) => t,
    // Quadratic
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    // Cubic
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => --t * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    // Elastic (from 3D package)
    easeInElastic: (t) => t === 0
        ? 0
        : t === 1
            ? 1
            : -Math.pow(2, 10 * t - 10) *
                Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),
    easeOutElastic: (t) => t === 0
        ? 0
        : t === 1
            ? 1
            : Math.pow(2, -10 * t) *
                Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) +
                1,
    easeInOutElastic: (t) => {
        if (t === 0)
            return 0;
        if (t === 1)
            return 1;
        if (t < 0.5) {
            return (-(Math.pow(2, 20 * t - 10) *
                Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2);
        }
        return ((Math.pow(2, -20 * t + 10) *
            Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) /
            2 +
            1);
    },
    // Bounce (from colors package, enhanced)
    easeInBounce: (t) => 1 - Easing.easeOutBounce(1 - t),
    easeOutBounce: (t) => {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        }
        else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        }
        else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        }
        else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    },
    easeInOutBounce: (t) => t < 0.5
        ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
        : (1 + Easing.easeOutBounce(2 * t - 1)) / 2,
};
/**
 * Apply easing function to a value
 */
export function applyEasing(t, easing) {
    return Easing[easing](t);
}
/**
 * Interpolate between two values with easing
 */
export function interpolate(start, end, t, easing = "linear") {
    const easedT = applyEasing(t, easing);
    return start + (end - start) * easedT;
}
/**
 * Interpolate between two 2D vectors with easing
 */
export function interpolateVector2(start, end, t, easing = "linear") {
    const easedT = applyEasing(t, easing);
    return [
        start[0] + (end[0] - start[0]) * easedT,
        start[1] + (end[1] - start[1]) * easedT,
    ];
}
/**
 * Interpolate between two 3D vectors with easing
 */
export function interpolateVector3(start, end, t, easing = "linear") {
    const easedT = applyEasing(t, easing);
    return [
        start[0] + (end[0] - start[0]) * easedT,
        start[1] + (end[1] - start[1]) * easedT,
        start[2] + (end[2] - start[2]) * easedT,
    ];
}
/**
 * Interpolate between two colors with easing
 */
export function interpolateColor(start, end, t, easing = "linear") {
    const easedT = applyEasing(t, easing);
    return [
        Math.round(start[0] + (end[0] - start[0]) * easedT),
        Math.round(start[1] + (end[1] - start[1]) * easedT),
        Math.round(start[2] + (end[2] - start[2]) * easedT),
    ];
}
/**
 * Create a custom easing function from a mathematical expression
 */
export function createCustomEasing(expression) {
    return (t) => {
        // Clamp t to [0, 1]
        const clampedT = Math.max(0, Math.min(1, t));
        return expression(clampedT);
    };
}
/**
 * Reverse an easing function
 */
export function reverseEasing(easing) {
    return (t) => easing(1 - t);
}
/**
 * Combine two easing functions
 */
export function combineEasing(first, second) {
    return (t) => second(first(t));
}
/**
 * Get easing function by name
 */
export function getEasingFunction(easing) {
    return Easing[easing];
}
/**
 * Validate easing type
 */
export function isValidEasingType(easing) {
    return easing in Easing;
}
