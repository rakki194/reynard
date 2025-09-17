/**
 * Circle Algorithms
 *
 * Specialized algorithms for circle operations, intersection testing,
 * and geometric calculations involving circular shapes.
 *
 * @module algorithms/circle-algorithms
 */
import { Point } from "./point-algorithms";
import { Circle } from "./shapes";
/**
 * Circle operations
 */
export declare class CircleOps {
    static create(center: Point, radius: number): Circle;
    static area(circle: Circle): number;
    static circumference(circle: Circle): number;
    static containsPoint(circle: Circle, point: Point): boolean;
    static intersects(a: Circle, b: Circle): boolean;
    static expand(circle: Circle, amount: number): Circle;
    static shrink(circle: Circle, amount: number): Circle;
    static translate(circle: Circle, offset: import("../vectors/vector-algorithms").Vector): Circle;
}
