import { createSignal } from "solid-js";
import { Button } from "reynard-components-core";
// import { PointOps, RectangleOps, CircleOps, PolygonOps } from "reynard-algorithms";

// Temporary placeholders until algorithms package is built
const PointOps = {
  distance(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  
  add(p1: {x: number, y: number}, p2: {x: number, y: number}) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
  },
  
  subtract(p1: {x: number, y: number}, p2: {x: number, y: number}) {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
  },
  
  create(x: number, y: number) {
    return { x, y };
  },
  
  midpoint(p1: {x: number, y: number}, p2: {x: number, y: number}) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }
};

const RectangleOps = {
  contains(rect: {x: number, y: number, width: number, height: number}, point: {x: number, y: number}): boolean {
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
           point.y >= rect.y && point.y <= rect.y + rect.height;
  },
  
  intersects(rect1: {x: number, y: number, width: number, height: number}, rect2: {x: number, y: number, width: number, height: number}): boolean {
    return !(rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y || rect2.y + rect2.height < rect1.y);
  },
  
  create(x: number, y: number, width: number, height: number) {
    return { x, y, width, height };
  },
  
  area(rect: {x: number, y: number, width: number, height: number}): number {
    return rect.width * rect.height;
  },
  
  intersection(rect1: {x: number, y: number, width: number, height: number}, rect2: {x: number, y: number, width: number, height: number}) {
    const x = Math.max(rect1.x, rect2.x);
    const y = Math.max(rect1.y, rect2.y);
    const width = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - x;
    const height = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - y;
    return width > 0 && height > 0 ? { x, y, width, height } : null;
  }
};

const CircleOps = {
  contains(circle: {x: number, y: number, radius: number}, point: {x: number, y: number}): boolean {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
  },
  
  intersects(circle1: {x: number, y: number, radius: number}, circle2: {x: number, y: number, radius: number}): boolean {
    const dx = circle2.x - circle1.x;
    const dy = circle2.y - circle1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= circle1.radius + circle2.radius;
  },
  
  create(x: number, y: number, radius: number) {
    return { x, y, radius };
  },
  
  area(circle: {x: number, y: number, radius: number}): number {
    return Math.PI * circle.radius * circle.radius;
  }
};

const PolygonOps = {
  contains(polygon: {x: number, y: number}[], point: {x: number, y: number}): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
          (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
        inside = !inside;
      }
    }
    return inside;
  },
  
  create(points: {x: number, y: number}[]) {
    return points;
  },
  
  area(polygon: {x: number, y: number}[]): number {
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length;
      area += polygon[i].x * polygon[j].y;
      area -= polygon[j].x * polygon[i].y;
    }
    return Math.abs(area) / 2;
  }
};
import "./GeometryDemo.css";
export function GeometryDemo() {
  const [shapes, setShapes] = createSignal([]);
  const [operations, setOperations] = createSignal([]);
  const addShape = type => {
    const id = Date.now();
    let data;
    switch (type) {
      case "point":
        data = PointOps.create(Math.random() * 400 + 50, Math.random() * 300 + 50);
        break;
      case "line":
        data = {
          start: PointOps.create(Math.random() * 400 + 50, Math.random() * 300 + 50),
          end: PointOps.create(Math.random() * 400 + 50, Math.random() * 300 + 50),
        };
        break;
      case "rectangle":
        data = RectangleOps.create(
          Math.random() * 300 + 50,
          Math.random() * 200 + 50,
          Math.random() * 100 + 50,
          Math.random() * 100 + 50
        );
        break;
      case "circle":
        data = CircleOps.create(
          Math.random() * 400 + 50,
          Math.random() * 300 + 50,
          Math.random() * 30 + 20
        );
        break;
      case "polygon":
        const points = Array.from({ length: 5 }, () =>
          PointOps.create(Math.random() * 200 + 100, Math.random() * 150 + 100)
        );
        data = PolygonOps.create(points);
        break;
    }
    setShapes(prev => [
      ...prev,
      {
        id,
        type,
        data,
        color: `oklch(60% 0.2 ${Math.random() * 360})`,
      },
    ]);
  };
  const performOperation = operation => {
    const shapesList = shapes();
    if (shapesList.length < 2) return;
    const shape1 = shapesList[0];
    const shape2 = shapesList[1];
    let result;
    switch (operation) {
      case "distance":
        if (shape1.type === "point" && shape2.type === "point") {
          result = PointOps.distance(shape1.data, shape2.data);
        }
        break;
      case "midpoint":
        if (shape1.type === "point" && shape2.type === "point") {
          result = PointOps.midpoint(shape1.data, shape2.data);
        }
        break;
      case "area":
        if (shape1.type === "rectangle") {
          result = RectangleOps.area(shape1.data);
        } else if (shape1.type === "circle") {
          result = CircleOps.area(shape1.data);
        } else if (shape1.type === "polygon") {
          result = PolygonOps.area(shape1.data);
        }
        break;
      case "intersection":
        if (shape1.type === "rectangle" && shape2.type === "rectangle") {
          result = RectangleOps.intersection(shape1.data, shape2.data);
        }
        break;
    }
    if (result !== undefined) {
      setOperations(prev => [
        ...prev,
        {
          type: operation,
          result,
          timestamp: Date.now(),
        },
      ]);
    }
  };
  return (
    <div class="geometry-demo">
      <div class="demo-header">
        <h3>📐 Geometry Operations Demo</h3>
        <div class="demo-controls">
          <Button onClick={() => addShape("point")} variant="secondary" size="sm">
            Add Point
          </Button>
          <Button onClick={() => addShape("line")} variant="secondary" size="sm">
            Add Line
          </Button>
          <Button onClick={() => addShape("rectangle")} variant="secondary" size="sm">
            Add Rectangle
          </Button>
          <Button onClick={() => addShape("circle")} variant="secondary" size="sm">
            Add Circle
          </Button>
          <Button onClick={() => addShape("polygon")} variant="secondary" size="sm">
            Add Polygon
          </Button>
        </div>
      </div>

      <div class="geometry-canvas">
        <svg width={500} height={400} class="geometry-svg">
          {shapes().map(shape => {
            switch (shape.type) {
              case "point":
                return <circle cx={shape.data.x} cy={shape.data.y} r="5" fill={shape.color} stroke="#333" />;
              case "line":
                return (
                  <line
                    x1={shape.data.start.x}
                    y1={shape.data.start.y}
                    x2={shape.data.end.x}
                    y2={shape.data.end.y}
                    stroke={shape.color}
                    stroke-width="3"
                  />
                );
              case "rectangle":
                return (
                  <rect
                    x={shape.data.x}
                    y={shape.data.y}
                    width={shape.data.width}
                    height={shape.data.height}
                    fill="none"
                    stroke={shape.color}
                    stroke-width="2"
                  />
                );
              case "circle":
                return (
                  <circle
                    cx={shape.data.center.x}
                    cy={shape.data.center.y}
                    r={shape.data.radius}
                    fill="none"
                    stroke={shape.color}
                    stroke-width="2"
                  />
                );
              case "polygon":
                const points = shape.data.points.map(p => `${p.x},${p.y}`).join(" ");
                return <polygon points={points} fill="none" stroke={shape.color} stroke-width="2" />;
            }
          })}
        </svg>
      </div>

      <div class="geometry-operations">
        <h4>Operations:</h4>
        <div class="operation-buttons">
          <Button onClick={() => performOperation("distance")} size="sm">
            Distance
          </Button>
          <Button onClick={() => performOperation("midpoint")} size="sm">
            Midpoint
          </Button>
          <Button onClick={() => performOperation("area")} size="sm">
            Area
          </Button>
          <Button onClick={() => performOperation("intersection")} size="sm">
            Intersection
          </Button>
        </div>

        <div class="operation-results">
          {operations()
            .slice(-5)
            .map(op => (
              <div class="operation-result">
                <strong>{op.type}:</strong> {JSON.stringify(op.result)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
