/**
 * Rectangle Basic Operations
 *
 * Basic rectangle operations including creation, measurements,
 * and simple geometric calculations.
 *
 * @module algorithms/rectangle-basic
 */
import { Point } from "./point-algorithms";
import { Rectangle } from "./shapes";
/**
 * Basic rectangle operations
 */
export declare class RectangleBasic {
    static create(x: number, y: number, width: number, height: number): Rectangle;
    static fromPoints(topLeft: Point, bottomRight: Point): Rectangle;
    static area(rect: Rectangle): number;
    static perimeter(rect: Rectangle): number;
    static center(rect: Rectangle): Point;
    static topLeft(rect: Rectangle): Point;
    static topRight(rect: Rectangle): Point;
    static bottomLeft(rect: Rectangle): Point;
    static bottomRight(rect: Rectangle): Point;
    static containsPoint(rect: Rectangle, point: Point): boolean;
    static containsRectangle(outer: Rectangle, inner: Rectangle): boolean;
}
