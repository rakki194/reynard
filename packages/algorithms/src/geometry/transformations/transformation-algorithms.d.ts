/**
 * Transformation Algorithms
 *
 * Specialized algorithms for geometric transformations, including
 * translation, scaling, rotation, and matrix operations.
 *
 * @module algorithms/transformation-algorithms
 */
import { Point } from "../shapes/point-algorithms";
import { Rectangle } from "../shapes/shapes";
export interface Transform {
    translateX: number;
    translateY: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
}
/**
 * Transform operations
 */
export declare class TransformOps {
    static identity(): Transform;
    static translate(x: number, y: number): Transform;
    static scale(x: number, y?: number): Transform;
    static rotate(angle: number): Transform;
    static combine(a: Transform, b: Transform): Transform;
    static applyToPoint(transform: Transform, point: Point): Point;
    static applyToRectangle(transform: Transform, rect: Rectangle): Rectangle;
    static inverse(transform: Transform): Transform;
}
