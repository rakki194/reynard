/**
 * Rectangle geometry operations and utilities
 */
import type { Point } from "./point";
export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare class RectangleOps {
    static create(x: number, y: number, width: number, height: number): Rectangle;
    static area(rect: Rectangle): number;
    static center(rect: Rectangle): Point;
    static containsPoint(rect: Rectangle, point: Point): boolean;
    static intersection(rect1: Rectangle, rect2: Rectangle): Rectangle | null;
}
