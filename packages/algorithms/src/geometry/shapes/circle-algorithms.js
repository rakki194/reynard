/**
 * Circle Algorithms
 *
 * Specialized algorithms for circle operations, intersection testing,
 * and geometric calculations involving circular shapes.
 *
 * @module algorithms/circle-algorithms
 */
import { PointOps } from "./point-algorithms";
/**
 * Circle operations
 */
export class CircleOps {
    static create(center, radius) {
        return { center, radius };
    }
    static area(circle) {
        return Math.PI * circle.radius * circle.radius;
    }
    static circumference(circle) {
        return 2 * Math.PI * circle.radius;
    }
    static containsPoint(circle, point) {
        return (PointOps.distanceSquared(circle.center, point) <=
            circle.radius * circle.radius);
    }
    static intersects(a, b) {
        const distance = PointOps.distance(a.center, b.center);
        return distance <= a.radius + b.radius;
    }
    static expand(circle, amount) {
        return { center: circle.center, radius: circle.radius + amount };
    }
    static shrink(circle, amount) {
        return {
            center: circle.center,
            radius: Math.max(0, circle.radius - amount),
        };
    }
    static translate(circle, offset) {
        return {
            center: PointOps.add(circle.center, offset),
            radius: circle.radius,
        };
    }
}
