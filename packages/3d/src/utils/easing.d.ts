export declare const Easing: {
    linear: (t: number) => number;
    easeInQuad: (t: number) => number;
    easeOutQuad: (t: number) => number;
    easeInOutQuad: (t: number) => number;
    easeInCubic: (t: number) => number;
    easeOutCubic: (t: number) => number;
    easeInOutCubic: (t: number) => number;
    easeInElastic: (t: number) => number;
    easeOutElastic: (t: number) => number;
    easeInOutElastic: (t: number) => number;
};
export type EasingType = keyof typeof Easing;
/**
 * Apply easing function to a value
 */
export declare function applyEasing(t: number, easing: EasingType): number;
/**
 * Interpolate between two values with easing
 */
export declare function interpolate(start: number, end: number, t: number, easing?: EasingType): number;
/**
 * Interpolate between two 3D vectors with easing
 */
export declare function interpolateVector3(start: [number, number, number], end: [number, number, number], t: number, easing?: EasingType): [number, number, number];
/**
 * Interpolate between two colors with easing
 */
export declare function interpolateColor(start: [number, number, number], end: [number, number, number], t: number, easing?: EasingType): [number, number, number];
