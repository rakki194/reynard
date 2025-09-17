/**
 * Point geometry operations and utilities
 */
export interface Point {
    x: number;
    y: number;
}
export declare class PointOps {
    static create(x: number, y: number): Point;
    static add(a: Point, b: Point): Point;
    static subtract(a: Point, b: Point): Point;
    static distance(a: Point, b: Point): number;
    static midpoint(a: Point, b: Point): Point;
}
