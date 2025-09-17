/**
 * 🦊 Unified Easing System
 * Consolidated easing functions from across the Reynard codebase
 */
import type { EasingType } from "../types";
/**
 * Comprehensive easing functions collection
 * Combines easing from 3D package, colors package, and additional functions
 */
export declare const Easing: {
    readonly linear: (t: number) => number;
    readonly easeInQuad: (t: number) => number;
    readonly easeOutQuad: (t: number) => number;
    readonly easeInOutQuad: (t: number) => number;
    readonly easeInCubic: (t: number) => number;
    readonly easeOutCubic: (t: number) => number;
    readonly easeInOutCubic: (t: number) => number;
    readonly easeInElastic: (t: number) => number;
    readonly easeOutElastic: (t: number) => number;
    readonly easeInOutElastic: (t: number) => number;
    readonly easeInBounce: (t: number) => number;
    readonly easeOutBounce: (t: number) => number;
    readonly easeInOutBounce: (t: number) => number;
};
/**
 * Apply easing function to a value
 */
export declare function applyEasing(t: number, easing: EasingType): number;
/**
 * Interpolate between two values with easing
 */
export declare function interpolate(start: number, end: number, t: number, easing?: EasingType): number;
/**
 * Interpolate between two 2D vectors with easing
 */
export declare function interpolateVector2(start: [number, number], end: [number, number], t: number, easing?: EasingType): [number, number];
/**
 * Interpolate between two 3D vectors with easing
 */
export declare function interpolateVector3(start: [number, number, number], end: [number, number, number], t: number, easing?: EasingType): [number, number, number];
/**
 * Interpolate between two colors with easing
 */
export declare function interpolateColor(start: [number, number, number], end: [number, number, number], t: number, easing?: EasingType): [number, number, number];
/**
 * Create a custom easing function from a mathematical expression
 */
export declare function createCustomEasing(expression: (t: number) => number): (t: number) => number;
/**
 * Reverse an easing function
 */
export declare function reverseEasing(easing: (t: number) => number): (t: number) => number;
/**
 * Combine two easing functions
 */
export declare function combineEasing(first: (t: number) => number, second: (t: number) => number): (t: number) => number;
/**
 * Get easing function by name
 */
export declare function getEasingFunction(easing: EasingType): (t: number) => number;
/**
 * Validate easing type
 */
export declare function isValidEasingType(easing: string): easing is EasingType;
