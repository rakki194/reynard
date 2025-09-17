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
export class RectangleOps {
}
// Basic operations
Object.defineProperty(RectangleOps, "create", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.create
});
Object.defineProperty(RectangleOps, "fromPoints", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.fromPoints
});
Object.defineProperty(RectangleOps, "area", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.area
});
Object.defineProperty(RectangleOps, "perimeter", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.perimeter
});
Object.defineProperty(RectangleOps, "center", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.center
});
Object.defineProperty(RectangleOps, "topLeft", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.topLeft
});
Object.defineProperty(RectangleOps, "topRight", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.topRight
});
Object.defineProperty(RectangleOps, "bottomLeft", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.bottomLeft
});
Object.defineProperty(RectangleOps, "bottomRight", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.bottomRight
});
Object.defineProperty(RectangleOps, "containsPoint", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.containsPoint
});
Object.defineProperty(RectangleOps, "containsRectangle", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleBasic.containsRectangle
});
// Advanced operations
Object.defineProperty(RectangleOps, "intersects", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleAdvanced.intersects
});
Object.defineProperty(RectangleOps, "intersection", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleAdvanced.intersection
});
Object.defineProperty(RectangleOps, "union", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleAdvanced.union
});
Object.defineProperty(RectangleOps, "expand", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleAdvanced.expand
});
Object.defineProperty(RectangleOps, "shrink", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleAdvanced.shrink
});
Object.defineProperty(RectangleOps, "translate", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleAdvanced.translate
});
Object.defineProperty(RectangleOps, "scale", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: RectangleAdvanced.scale
});
