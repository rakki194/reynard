/**
 * Polygon geometry operations and utilities
 */
export class PolygonOps {
    static create(points) {
        return { points: [...points] };
    }
    static area(polygon) {
        if (polygon.points.length < 3)
            return 0;
        let area = 0;
        for (let i = 0; i < polygon.points.length; i++) {
            const j = (i + 1) % polygon.points.length;
            area += polygon.points[i].x * polygon.points[j].y;
            area -= polygon.points[j].x * polygon.points[i].y;
        }
        return Math.abs(area) / 2;
    }
    static containsPoint(polygon, point) {
        if (polygon.points.length < 3)
            return false;
        let inside = false;
        for (let i = 0, j = polygon.points.length - 1; i < polygon.points.length; j = i++) {
            if (polygon.points[i].y > point.y !== polygon.points[j].y > point.y &&
                point.x <
                    ((polygon.points[j].x - polygon.points[i].x) *
                        (point.y - polygon.points[i].y)) /
                        (polygon.points[j].y - polygon.points[i].y) +
                        polygon.points[i].x) {
                inside = !inside;
            }
        }
        return inside;
    }
}
