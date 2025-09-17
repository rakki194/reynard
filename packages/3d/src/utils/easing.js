// Easing functions for smooth 3D animations
// Adapted from yipyap's animation system
//
// @deprecated Use reynard-animation package instead
// This file is kept for backward compatibility
export const Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => --t * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
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
 * Interpolate between two 3D vectors with easing
 */
export function interpolateVector3(start, end, t, easing = "linear") {
    return [
        interpolate(start[0], end[0], t, easing),
        interpolate(start[1], end[1], t, easing),
        interpolate(start[2], end[2], t, easing),
    ];
}
/**
 * Interpolate between two colors with easing
 */
export function interpolateColor(start, end, t, easing = "linear") {
    return [
        interpolate(start[0], end[0], t, easing),
        interpolate(start[1], end[1], t, easing),
        interpolate(start[2], end[2], t, easing),
    ];
}
