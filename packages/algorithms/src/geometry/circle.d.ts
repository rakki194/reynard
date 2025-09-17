/**
 * Circle geometry operations and utilities
 */
import type { Point } from "./point";
export interface Circle {
    center: Point;
    radius: number;
}
export declare class CircleOps {
    static create(center: Point, radius: number): Circle;
    static area(circle: Circle): number;
    static circumference(circle: Circle): number;
    static containsPoint(circle: Circle, point: Point): boolean;
}
