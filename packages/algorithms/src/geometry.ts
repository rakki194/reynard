/**
 * Geometry Algorithm
 *
 * A comprehensive geometry toolkit for 2D geometric calculations,
 * transformations, and spatial operations used throughout the application.
 *
 * Features:
 * - Point and vector operations
 * - Line and polygon calculations
 * - Geometric transformations
 * - Intersection detection
 * - Distance calculations
 * - Area and perimeter computations
 * - Bounding box operations
 *
 * @module algorithms/geometry
 */

export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface Line {
  start: Point;
  end: Point;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  center: Point;
  radius: number;
}

export interface Polygon {
  points: Point[];
}

export interface Transform {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

/**
 * Point operations
 */
export class PointOps {
  static create(x: number, y: number): Point {
    return { x, y };
  }

  static add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  static subtract(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  static multiply(a: Point, scalar: number): Point {
    return { x: a.x * scalar, y: a.y * scalar };
  }

  static divide(a: Point, scalar: number): Point {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    return { x: a.x / scalar, y: a.y / scalar };
  }

  static distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static distanceSquared(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }

  static midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  static lerp(a: Point, b: Point, t: number): Point {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  static equals(a: Point, b: Point): boolean {
    return Math.abs(a.x - b.x) < 1e-10 && Math.abs(a.y - b.y) < 1e-10;
  }

  static clone(point: Point): Point {
    return { x: point.x, y: point.y };
  }
}

/**
 * Vector operations
 */
export class VectorOps {
  static create(x: number, y: number): Vector {
    return { x, y };
  }

  static fromPoints(start: Point, end: Point): Vector {
    return { x: end.x - start.x, y: end.y - start.y };
  }

  static add(a: Vector, b: Vector): Vector {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  static subtract(a: Vector, b: Vector): Vector {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  static multiply(a: Vector, scalar: number): Vector {
    return { x: a.x * scalar, y: a.y * scalar };
  }

  static divide(a: Vector, scalar: number): Vector {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    return { x: a.x / scalar, y: a.y / scalar };
  }

  static dot(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a: Vector, b: Vector): number {
    return a.x * b.y - a.y * b.x;
  }

  static magnitude(vector: Vector): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  }

  static magnitudeSquared(vector: Vector): number {
    return vector.x * vector.x + vector.y * vector.y;
  }

  static normalize(vector: Vector): Vector {
    const mag = this.magnitude(vector);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: vector.x / mag, y: vector.y / mag };
  }

  static rotate(vector: Vector, angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos,
    };
  }

  static angle(vector: Vector): number {
    return Math.atan2(vector.y, vector.x);
  }

  static angleBetween(a: Vector, b: Vector): number {
    const dot = this.dot(a, b);
    const magA = this.magnitude(a);
    const magB = this.magnitude(b);
    return Math.acos(dot / (magA * magB));
  }
}

/**
 * Line operations
 */
export class LineOps {
  static create(start: Point, end: Point): Line {
    return { start, end };
  }

  static getLength(line: Line): number {
    return PointOps.distance(line.start, line.end);
  }

  static getLengthSquared(line: Line): number {
    return PointOps.distanceSquared(line.start, line.end);
  }

  static midpoint(line: Line): Point {
    return PointOps.midpoint(line.start, line.end);
  }

  static direction(line: Line): Vector {
    return VectorOps.fromPoints(line.start, line.end);
  }

  static normal(line: Line): Vector {
    const dir = this.direction(line);
    return VectorOps.normalize({ x: -dir.y, y: dir.x });
  }

  static pointAt(line: Line, t: number): Point {
    return PointOps.lerp(line.start, line.end, t);
  }

  static distanceToPoint(line: Line, point: Point): number {
    const A = point.x - line.start.x;
    const B = point.y - line.start.y;
    const C = line.end.x - line.start.x;
    const D = line.end.y - line.start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) return PointOps.distance(line.start, point);

    const param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = line.start.x;
      yy = line.start.y;
    } else if (param > 1) {
      xx = line.end.x;
      yy = line.end.y;
    } else {
      xx = line.start.x + param * C;
      yy = line.start.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static intersects(a: Line, b: Line): Point | null {
    const x1 = a.start.x,
      y1 = a.start.y;
    const x2 = a.end.x,
      y2 = a.end.y;
    const x3 = b.start.x,
      y3 = b.start.y;
    const x4 = b.end.x,
      y4 = b.end.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1),
      };
    }

    return null;
  }
}

/**
 * Rectangle operations
 */
export class RectangleOps {
  static create(x: number, y: number, width: number, height: number): Rectangle {
    return { x, y, width, height };
  }

  static fromPoints(topLeft: Point, bottomRight: Point): Rectangle {
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }

  static area(rect: Rectangle): number {
    return rect.width * rect.height;
  }

  static perimeter(rect: Rectangle): number {
    return 2 * (rect.width + rect.height);
  }

  static center(rect: Rectangle): Point {
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  static topLeft(rect: Rectangle): Point {
    return { x: rect.x, y: rect.y };
  }

  static topRight(rect: Rectangle): Point {
    return { x: rect.x + rect.width, y: rect.y };
  }

  static bottomLeft(rect: Rectangle): Point {
    return { x: rect.x, y: rect.y + rect.height };
  }

  static bottomRight(rect: Rectangle): Point {
    return { x: rect.x + rect.width, y: rect.y + rect.height };
  }

  static containsPoint(rect: Rectangle, point: Point): boolean {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  }

  static containsRectangle(outer: Rectangle, inner: Rectangle): boolean {
    return (
      inner.x >= outer.x &&
      inner.y >= outer.y &&
      inner.x + inner.width <= outer.x + outer.width &&
      inner.y + inner.height <= outer.y + outer.height
    );
  }

  static intersects(a: Rectangle, b: Rectangle): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  static intersection(a: Rectangle, b: Rectangle): Rectangle | null {
    if (!this.intersects(a, b)) return null;

    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.width, b.x + b.width);
    const y2 = Math.min(a.y + a.height, b.y + b.height);

    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }

  static union(a: Rectangle, b: Rectangle): Rectangle {
    const x1 = Math.min(a.x, b.x);
    const y1 = Math.min(a.y, b.y);
    const x2 = Math.max(a.x + a.width, b.x + b.width);
    const y2 = Math.max(a.y + a.height, b.y + b.height);

    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }

  static expand(rect: Rectangle, amount: number): Rectangle {
    return {
      x: rect.x - amount,
      y: rect.y - amount,
      width: rect.width + amount * 2,
      height: rect.height + amount * 2,
    };
  }

  static shrink(rect: Rectangle, amount: number): Rectangle {
    return {
      x: rect.x + amount,
      y: rect.y + amount,
      width: Math.max(0, rect.width - amount * 2),
      height: Math.max(0, rect.height - amount * 2),
    };
  }

  static translate(rect: Rectangle, offset: Vector): Rectangle {
    return {
      x: rect.x + offset.x,
      y: rect.y + offset.y,
      width: rect.width,
      height: rect.height,
    };
  }

  static scale(rect: Rectangle, factor: number, center?: Point): Rectangle {
    if (center) {
      // Scale around specified center
      const newWidth = rect.width * factor;
      const newHeight = rect.height * factor;
      const newX = center.x - newWidth / 2;
      const newY = center.y - newHeight / 2;
      return { x: newX, y: newY, width: newWidth, height: newHeight };
    } else {
      // Scale from origin (0,0)
      return {
        x: rect.x * factor,
        y: rect.y * factor,
        width: rect.width * factor,
        height: rect.height * factor,
      };
    }
  }
}

/**
 * Circle operations
 */
export class CircleOps {
  static create(center: Point, radius: number): Circle {
    return { center, radius };
  }

  static area(circle: Circle): number {
    return Math.PI * circle.radius * circle.radius;
  }

  static circumference(circle: Circle): number {
    return 2 * Math.PI * circle.radius;
  }

  static containsPoint(circle: Circle, point: Point): boolean {
    return PointOps.distanceSquared(circle.center, point) <= circle.radius * circle.radius;
  }

  static intersects(a: Circle, b: Circle): boolean {
    const distance = PointOps.distance(a.center, b.center);
    return distance <= a.radius + b.radius;
  }

  static expand(circle: Circle, amount: number): Circle {
    return { center: circle.center, radius: circle.radius + amount };
  }

  static shrink(circle: Circle, amount: number): Circle {
    return { center: circle.center, radius: Math.max(0, circle.radius - amount) };
  }

  static translate(circle: Circle, offset: Vector): Circle {
    return { center: PointOps.add(circle.center, offset), radius: circle.radius };
  }
}

/**
 * Polygon operations
 */
export class PolygonOps {
  static create(points: Point[]): Polygon {
    return { points: [...points] };
  }

  static area(polygon: Polygon): number {
    if (polygon.points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < polygon.points.length; i++) {
      const j = (i + 1) % polygon.points.length;
      area += polygon.points[i].x * polygon.points[j].y;
      area -= polygon.points[j].x * polygon.points[i].y;
    }
    return Math.abs(area) / 2;
  }

  static perimeter(polygon: Polygon): number {
    if (polygon.points.length < 2) return 0;

    let perimeter = 0;
    for (let i = 0; i < polygon.points.length; i++) {
      const j = (i + 1) % polygon.points.length;
      perimeter += PointOps.distance(polygon.points[i], polygon.points[j]);
    }
    return perimeter;
  }

  static centroid(polygon: Polygon): Point {
    if (polygon.points.length === 0) return { x: 0, y: 0 };
    if (polygon.points.length === 1) return polygon.points[0];

    let cx = 0,
      cy = 0;
    for (const point of polygon.points) {
      cx += point.x;
      cy += point.y;
    }
    return { x: cx / polygon.points.length, y: cy / polygon.points.length };
  }

  static containsPoint(polygon: Polygon, point: Point): boolean {
    if (polygon.points.length < 3) return false;

    let inside = false;
    for (let i = 0, j = polygon.points.length - 1; i < polygon.points.length; j = i++) {
      const xi = polygon.points[i].x,
        yi = polygon.points[i].y;
      const xj = polygon.points[j].x,
        yj = polygon.points[j].y;

      if (yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  static boundingBox(polygon: Polygon): Rectangle {
    if (polygon.points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = polygon.points[0].x,
      maxX = polygon.points[0].x;
    let minY = polygon.points[0].y,
      maxY = polygon.points[0].y;

    for (const point of polygon.points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  static translate(polygon: Polygon, offset: Vector): Polygon {
    return {
      points: polygon.points.map(point => PointOps.add(point, offset)),
    };
  }

  static scale(polygon: Polygon, factor: number, center?: Point): Polygon {
    if (center) {
      // Scale around specified center
      return {
        points: polygon.points.map(point => {
          const offset = PointOps.subtract(point, center);
          const scaled = PointOps.multiply(offset, factor);
          return PointOps.add(center, scaled);
        }),
      };
    } else {
      // Scale from origin (0,0)
      return {
        points: polygon.points.map(point => PointOps.multiply(point, factor)),
      };
    }
  }
}

/**
 * Transform operations
 */
export class TransformOps {
  static identity(): Transform {
    return { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, rotation: 0 };
  }

  static translate(x: number, y: number): Transform {
    return { translateX: x, translateY: y, scaleX: 1, scaleY: 1, rotation: 0 };
  }

  static scale(x: number, y: number = x): Transform {
    return { translateX: 0, translateY: 0, scaleX: x, scaleY: y, rotation: 0 };
  }

  static rotate(angle: number): Transform {
    return { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, rotation: angle };
  }

  static combine(a: Transform, b: Transform): Transform {
    const cos = Math.cos(a.rotation);
    const sin = Math.sin(a.rotation);

    return {
      translateX: a.translateX + b.translateX * a.scaleX * cos - b.translateY * a.scaleY * sin,
      translateY: a.translateY + b.translateX * a.scaleX * sin + b.translateY * a.scaleY * cos,
      scaleX: a.scaleX * b.scaleX,
      scaleY: a.scaleY * b.scaleY,
      rotation: a.rotation + b.rotation,
    };
  }

  static applyToPoint(transform: Transform, point: Point): Point {
    const cos = Math.cos(transform.rotation);
    const sin = Math.sin(transform.rotation);

    return {
      x: point.x * transform.scaleX * cos - point.y * transform.scaleY * sin + transform.translateX,
      y: point.x * transform.scaleX * sin + point.y * transform.scaleY * cos + transform.translateY,
    };
  }

  static applyToRectangle(transform: Transform, rect: Rectangle): Rectangle {
    const corners = [
      RectangleOps.topLeft(rect),
      RectangleOps.topRight(rect),
      RectangleOps.bottomLeft(rect),
      RectangleOps.bottomRight(rect),
    ];

    const transformedCorners = corners.map(corner => this.applyToPoint(transform, corner));

    let minX = transformedCorners[0].x,
      maxX = transformedCorners[0].x;
    let minY = transformedCorners[0].y,
      maxY = transformedCorners[0].y;

    for (const corner of transformedCorners) {
      minX = Math.min(minX, corner.x);
      maxX = Math.max(maxX, corner.x);
      minY = Math.min(minY, corner.y);
      maxY = Math.max(maxY, corner.y);
    }

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  static inverse(transform: Transform): Transform {
    const cos = Math.cos(-transform.rotation);
    const sin = Math.sin(-transform.rotation);

    return {
      translateX: -(transform.translateX * cos - transform.translateY * sin) / transform.scaleX,
      translateY: -(transform.translateX * sin + transform.translateY * cos) / transform.scaleY,
      scaleX: 1 / transform.scaleX,
      scaleY: 1 / transform.scaleY,
      rotation: -transform.rotation,
    };
  }
}
