/**
 * Rectangle Basic Operations
 *
 * Basic rectangle operations including creation, measurements,
 * and simple geometric calculations.
 *
 * @module algorithms/rectangle-basic
 */
/**
 * Basic rectangle operations
 */
export class RectangleBasic {
    static create(x, y, width, height) {
        return { x, y, width, height };
    }
    static fromPoints(topLeft, bottomRight) {
        return {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y,
        };
    }
    static area(rect) {
        return rect.width * rect.height;
    }
    static perimeter(rect) {
        return 2 * (rect.width + rect.height);
    }
    static center(rect) {
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }
    static topLeft(rect) {
        return { x: rect.x, y: rect.y };
    }
    static topRight(rect) {
        return { x: rect.x + rect.width, y: rect.y };
    }
    static bottomLeft(rect) {
        return { x: rect.x, y: rect.y + rect.height };
    }
    static bottomRight(rect) {
        return { x: rect.x + rect.width, y: rect.y + rect.height };
    }
    static containsPoint(rect, point) {
        return (point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height);
    }
    static containsRectangle(outer, inner) {
        return (inner.x >= outer.x &&
            inner.y >= outer.y &&
            inner.x + inner.width <= outer.x + outer.width &&
            inner.y + inner.height <= outer.y + outer.height);
    }
}
