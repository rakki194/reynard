/**
 * Point geometry operations and utilities
 */
export class PointOps {
    static create(x, y) {
        return { x, y };
    }
    static add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    static subtract(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    static distance(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static midpoint(a, b) {
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
}
