/**
 * Vector Algorithms
 *
 * Specialized algorithms for vector operations, including mathematical
 * operations, transformations, and geometric calculations.
 *
 * @module algorithms/vector-algorithms
 */
/**
 * Vector operations
 */
export class VectorOps {
    static create(x, y) {
        return { x, y };
    }
    static fromPoints(start, end) {
        return { x: end.x - start.x, y: end.y - start.y };
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
    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    static cross(a, b) {
        return a.x * b.y - a.y * b.x;
    }
    static magnitude(vector) {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    }
    static magnitudeSquared(vector) {
        return vector.x * vector.x + vector.y * vector.y;
    }
    static normalize(vector) {
        const mag = this.magnitude(vector);
        if (mag === 0)
            return { x: 0, y: 0 };
        return { x: vector.x / mag, y: vector.y / mag };
    }
    static rotate(vector, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: vector.x * cos - vector.y * sin,
            y: vector.x * sin + vector.y * cos,
        };
    }
    static angle(vector) {
        return Math.atan2(vector.y, vector.x);
    }
    static angleBetween(a, b) {
        const dot = this.dot(a, b);
        const magA = this.magnitude(a);
        const magB = this.magnitude(b);
        return Math.acos(dot / (magA * magB));
    }
}
