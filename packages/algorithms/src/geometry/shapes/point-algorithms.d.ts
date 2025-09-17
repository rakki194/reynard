/**
 * Point Algorithms
 *
 * Specialized algorithms for point operations, including mathematical
 * operations, distance calculations, and geometric transformations.
 *
 * @module algorithms/point-algorithms
 */
export interface Point {
    x: number;
    y: number;
}
/**
 * Point operations
 */
export declare class PointOps {
    static create(x: number, y: number): Point;
    static add(a: Point, b: Point): Point;
    static subtract(a: Point, b: Point): Point;
    static multiply(a: Point, scalar: number): Point;
    static divide(a: Point, scalar: number): Point;
    static distance(a: Point, b: Point): number;
    static distanceSquared(a: Point, b: Point): number;
    static midpoint(a: Point, b: Point): Point;
    static lerp(a: Point, b: Point, t: number): Point;
    static equals(a: Point, b: Point): boolean;
    static clone(point: Point): Point;
}
