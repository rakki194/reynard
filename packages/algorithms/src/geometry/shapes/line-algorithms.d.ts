/**
 * Line Algorithms
 *
 * Specialized algorithms for line operations, intersection testing,
 * and geometric calculations involving line segments.
 *
 * @module algorithms/line-algorithms
 */
import { Point } from "./point-algorithms";
import { Line } from "./shapes";
/**
 * Line operations
 */
export declare class LineOps {
    static create(start: Point, end: Point): Line;
    static getLength(line: Line): number;
    static getLengthSquared(line: Line): number;
    static midpoint(line: Line): Point;
    static direction(line: Line): import("../vectors/vector-algorithms").Vector;
    static normal(line: Line): import("../vectors/vector-algorithms").Vector;
    static pointAt(line: Line, t: number): Point;
    static distanceToPoint(line: Line, point: Point): number;
    static intersects(a: Line, b: Line): Point | null;
}
