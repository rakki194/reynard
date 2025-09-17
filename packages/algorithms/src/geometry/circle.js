/**
 * Circle geometry operations and utilities
 */
import { PointOps } from "./point";
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
        return PointOps.distance(circle.center, point) <= circle.radius;
    }
}
