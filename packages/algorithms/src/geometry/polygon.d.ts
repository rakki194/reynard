/**
 * Polygon geometry operations and utilities
 */
import type { Point } from "./point";
export interface Polygon {
    points: Point[];
}
export declare class PolygonOps {
    static create(points: Point[]): Polygon;
    static area(polygon: Polygon): number;
    static containsPoint(polygon: Polygon, point: Point): boolean;
}
