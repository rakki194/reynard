/**
 * Vector Algorithms
 *
 * Specialized algorithms for vector operations, including mathematical
 * operations, transformations, and geometric calculations.
 *
 * @module algorithms/vector-algorithms
 */
import { Point } from "../shapes/point-algorithms";
export interface Vector {
    x: number;
    y: number;
}
/**
 * Vector operations
 */
export declare class VectorOps {
    static create(x: number, y: number): Vector;
    static fromPoints(start: Point, end: Point): Vector;
    static add(a: Vector, b: Vector): Vector;
    static subtract(a: Vector, b: Vector): Vector;
    static multiply(a: Vector, scalar: number): Vector;
    static divide(a: Vector, scalar: number): Vector;
    static dot(a: Vector, b: Vector): number;
    static cross(a: Vector, b: Vector): number;
    static magnitude(vector: Vector): number;
    static magnitudeSquared(vector: Vector): number;
    static normalize(vector: Vector): Vector;
    static rotate(vector: Vector, angle: number): Vector;
    static angle(vector: Vector): number;
    static angleBetween(a: Vector, b: Vector): number;
}
