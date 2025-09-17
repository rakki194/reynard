/**
 * Rectangle Advanced Operations
 *
 * Advanced rectangle operations including intersection testing,
 * transformations, and complex geometric calculations.
 *
 * @module algorithms/rectangle-advanced
 */
import { Point } from "./point-algorithms";
import { Rectangle } from "./shapes";
/**
 * Advanced rectangle operations
 */
export declare class RectangleAdvanced {
    static intersects(a: Rectangle, b: Rectangle): boolean;
    static intersection(a: Rectangle, b: Rectangle): Rectangle | null;
    static union(a: Rectangle, b: Rectangle): Rectangle;
    static expand(rect: Rectangle, amount: number): Rectangle;
    static shrink(rect: Rectangle, amount: number): Rectangle;
    static translate(rect: Rectangle, offset: import("../vectors/vector-algorithms").Vector): Rectangle;
    static scale(rect: Rectangle, factor: number, center?: Point): Rectangle;
}
