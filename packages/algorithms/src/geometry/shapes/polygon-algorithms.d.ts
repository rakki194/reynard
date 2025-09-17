/**
 * Polygon Algorithms
 *
 * Specialized algorithms for polygon operations, intersection testing,
 * and geometric calculations involving polygonal shapes.
 *
 * @module algorithms/polygon-algorithms
 */
import { Point } from "./point-algorithms";
import { Polygon } from "./shapes";
/**
 * Polygon operations
 */
export declare class PolygonOps {
    static create(points: Point[]): Polygon;
    static area(polygon: Polygon): number;
    static perimeter(polygon: Polygon): number;
    static centroid(polygon: Polygon): Point;
    static containsPoint(polygon: Polygon, point: Point): boolean;
    static boundingBox(polygon: Polygon): import("./shapes").Rectangle;
    static translate(polygon: Polygon, offset: import("../vectors/vector-algorithms").Vector): Polygon;
    static scale(polygon: Polygon, factor: number, center?: Point): Polygon;
}
