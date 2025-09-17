/**
 * Rectangle geometry operations and utilities
 */
export class RectangleOps {
    static create(x, y, width, height) {
        return { x, y, width, height };
    }
    static area(rect) {
        return rect.width * rect.height;
    }
    static center(rect) {
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }
    static containsPoint(rect, point) {
        return (point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height);
    }
    static intersection(rect1, rect2) {
        const left = Math.max(rect1.x, rect2.x);
        const top = Math.max(rect1.y, rect2.y);
        const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
        const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
        if (left < right && top < bottom) {
            return { x: left, y: top, width: right - left, height: bottom - top };
        }
        return null;
    }
}
