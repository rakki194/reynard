/**
 * Point Algorithms
 *
 * Specialized algorithms for point operations, including mathematical
 * operations, distance calculations, and geometric transformations.
 *
 * @module algorithms/point-algorithms
 */
/**
 * Point operations
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
    static multiply(a, scalar) {
        return { x: a.x * scalar, y: a.y * scalar };
    }
    static divide(a, scalar) {
        if (scalar === 0) {
            throw new Error("Division by zero");
        }
        return { x: a.x / scalar, y: a.y / scalar };
    }
    static distance(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static distanceSquared(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return dx * dx + dy * dy;
    }
    static midpoint(a, b) {
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
    static lerp(a, b, t) {
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    static equals(a, b) {
        return Math.abs(a.x - b.x) < 1e-10 && Math.abs(a.y - b.y) < 1e-10;
    }
    static clone(point) {
        return { x: point.x, y: point.y };
    }
}
