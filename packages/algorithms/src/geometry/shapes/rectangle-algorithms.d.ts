/**
 * Rectangle Algorithms
 *
 * Specialized algorithms for rectangle operations, intersection testing,
 * and geometric calculations involving rectangular shapes.
 *
 * @module algorithms/rectangle-algorithms
 */
import { RectangleBasic } from "./rectangle-basic";
import { RectangleAdvanced } from "./rectangle-advanced";
/**
 * Combined rectangle operations
 */
export declare class RectangleOps {
    static create: typeof RectangleBasic.create;
    static fromPoints: typeof RectangleBasic.fromPoints;
    static area: typeof RectangleBasic.area;
    static perimeter: typeof RectangleBasic.perimeter;
    static center: typeof RectangleBasic.center;
    static topLeft: typeof RectangleBasic.topLeft;
    static topRight: typeof RectangleBasic.topRight;
    static bottomLeft: typeof RectangleBasic.bottomLeft;
    static bottomRight: typeof RectangleBasic.bottomRight;
    static containsPoint: typeof RectangleBasic.containsPoint;
    static containsRectangle: typeof RectangleBasic.containsRectangle;
    static intersects: typeof RectangleAdvanced.intersects;
    static intersection: typeof RectangleAdvanced.intersection;
    static union: typeof RectangleAdvanced.union;
    static expand: typeof RectangleAdvanced.expand;
    static shrink: typeof RectangleAdvanced.shrink;
    static translate: typeof RectangleAdvanced.translate;
    static scale: typeof RectangleAdvanced.scale;
}
