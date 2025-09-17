/**
 * Transformation Algorithms
 *
 * Specialized algorithms for geometric transformations, including
 * translation, scaling, rotation, and matrix operations.
 *
 * @module algorithms/transformation-algorithms
 */
import { RectangleOps } from "../shapes/rectangle-algorithms";
/**
 * Transform operations
 */
export class TransformOps {
    static identity() {
        return { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, rotation: 0 };
    }
    static translate(x, y) {
        return { translateX: x, translateY: y, scaleX: 1, scaleY: 1, rotation: 0 };
    }
    static scale(x, y = x) {
        return { translateX: 0, translateY: 0, scaleX: x, scaleY: y, rotation: 0 };
    }
    static rotate(angle) {
        return {
            translateX: 0,
            translateY: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: angle,
        };
    }
    static combine(a, b) {
        const cos = Math.cos(a.rotation);
        const sin = Math.sin(a.rotation);
        return {
            translateX: a.translateX +
                b.translateX * a.scaleX * cos -
                b.translateY * a.scaleY * sin,
            translateY: a.translateY +
                b.translateX * a.scaleX * sin +
                b.translateY * a.scaleY * cos,
            scaleX: a.scaleX * b.scaleX,
            scaleY: a.scaleY * b.scaleY,
            rotation: a.rotation + b.rotation,
        };
    }
    static applyToPoint(transform, point) {
        const cos = Math.cos(transform.rotation);
        const sin = Math.sin(transform.rotation);
        return {
            x: point.x * transform.scaleX * cos -
                point.y * transform.scaleY * sin +
                transform.translateX,
            y: point.x * transform.scaleX * sin +
                point.y * transform.scaleY * cos +
                transform.translateY,
        };
    }
    static applyToRectangle(transform, rect) {
        const corners = [
            RectangleOps.topLeft(rect),
            RectangleOps.topRight(rect),
            RectangleOps.bottomLeft(rect),
            RectangleOps.bottomRight(rect),
        ];
        const transformedCorners = corners.map((corner) => this.applyToPoint(transform, corner));
        let minX = transformedCorners[0].x, maxX = transformedCorners[0].x;
        let minY = transformedCorners[0].y, maxY = transformedCorners[0].y;
        for (const corner of transformedCorners) {
            minX = Math.min(minX, corner.x);
            maxX = Math.max(maxX, corner.x);
            minY = Math.min(minY, corner.y);
            maxY = Math.max(maxY, corner.y);
        }
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    static inverse(transform) {
        const cos = Math.cos(-transform.rotation);
        const sin = Math.sin(-transform.rotation);
        return {
            translateX: -(transform.translateX * cos - transform.translateY * sin) /
                transform.scaleX,
            translateY: -(transform.translateX * sin + transform.translateY * cos) /
                transform.scaleY,
            scaleX: 1 / transform.scaleX,
            scaleY: 1 / transform.scaleY,
            rotation: -transform.rotation,
        };
    }
}
