import { createSignal } from "solid-js";
import { Button } from "@reynard/components";
import {
  PointOps,
  RectangleOps,
  CircleOps,
  PolygonOps,
} from "@reynard/algorithms";
import { Shape, Operation } from "../types";
import "./GeometryDemo.css";

export function GeometryDemo() {
  const [shapes, setShapes] = createSignal<Shape[]>([]);
  const [operations, setOperations] = createSignal<Operation[]>([]);

  const addShape = (type: 'point' | 'line' | 'rectangle' | 'circle' | 'polygon') => {
    const id = Date.now();
    let data: any;
    
    switch (type) {
      case 'point':
        data = PointOps.create(Math.random() * 400 + 50, Math.random() * 300 + 50);
        break;
      case 'line':
        data = {
          start: PointOps.create(Math.random() * 400 + 50, Math.random() * 300 + 50),
          end: PointOps.create(Math.random() * 400 + 50, Math.random() * 300 + 50),
        };
        break;
      case 'rectangle':
        data = RectangleOps.create(
          Math.random() * 300 + 50,
          Math.random() * 200 + 50,
          Math.random() * 100 + 50,
          Math.random() * 100 + 50
        );
        break;
      case 'circle':
        data = CircleOps.create(
          PointOps.create(Math.random() * 400 + 50, Math.random() * 300 + 50),
          Math.random() * 30 + 20
        );
        break;
      case 'polygon':
        const points = Array.from({ length: 5 }, () => 
          PointOps.create(Math.random() * 200 + 100, Math.random() * 150 + 100)
        );
        data = PolygonOps.create(points);
        break;
    }
    
    setShapes(prev => [...prev, {
      id,
      type,
      data,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }]);
  };

  const performOperation = (operation: string) => {
    const shapesList = shapes();
    if (shapesList.length < 2) return;
    
    const shape1 = shapesList[0];
    const shape2 = shapesList[1];
    let result: any;
    
    switch (operation) {
      case 'distance':
        if (shape1.type === 'point' && shape2.type === 'point') {
          result = PointOps.distance(shape1.data, shape2.data);
        }
        break;
      case 'midpoint':
        if (shape1.type === 'point' && shape2.type === 'point') {
          result = PointOps.midpoint(shape1.data, shape2.data);
        }
        break;
      case 'area':
        if (shape1.type === 'rectangle') {
          result = RectangleOps.area(shape1.data);
        } else if (shape1.type === 'circle') {
          result = CircleOps.area(shape1.data);
        } else if (shape1.type === 'polygon') {
          result = PolygonOps.area(shape1.data);
        }
        break;
      case 'intersection':
        if (shape1.type === 'rectangle' && shape2.type === 'rectangle') {
          result = RectangleOps.intersection(shape1.data, shape2.data);
        }
        break;
    }
    
    if (result !== undefined) {
      setOperations(prev => [...prev, {
        type: operation,
        result,
        timestamp: Date.now(),
      }]);
    }
  };

  return (
    <div class="geometry-demo">
      <div class="demo-header">
        <h3>📐 Geometry Operations Demo</h3>
        <div class="demo-controls">
          <Button onClick={() => addShape('point')} variant="secondary" size="sm">
            Add Point
          </Button>
          <Button onClick={() => addShape('line')} variant="secondary" size="sm">
            Add Line
          </Button>
          <Button onClick={() => addShape('rectangle')} variant="secondary" size="sm">
            Add Rectangle
          </Button>
          <Button onClick={() => addShape('circle')} variant="secondary" size="sm">
            Add Circle
          </Button>
          <Button onClick={() => addShape('polygon')} variant="secondary" size="sm">
            Add Polygon
          </Button>
        </div>
      </div>
      
      <div class="geometry-canvas">
        <svg width={500} height={400} class="geometry-svg">
          {shapes().map(shape => {
            switch (shape.type) {
              case 'point':
                return (
                  <circle
                    cx={shape.data.x}
                    cy={shape.data.y}
                    r="5"
                    fill={shape.color}
                    stroke="#333"
                  />
                );
              case 'line':
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
              case 'rectangle':
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
              case 'circle':
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
              case 'polygon':
                const points = shape.data.points.map((p: any) => `${p.x},${p.y}`).join(' ');
                return (
                  <polygon
                    points={points}
                    fill="none"
                    stroke={shape.color}
                    stroke-width="2"
                  />
                );
            }
          })}
        </svg>
      </div>
      
      <div class="geometry-operations">
        <h4>Operations:</h4>
        <div class="operation-buttons">
          <Button onClick={() => performOperation('distance')} size="sm">
            Distance
          </Button>
          <Button onClick={() => performOperation('midpoint')} size="sm">
            Midpoint
          </Button>
          <Button onClick={() => performOperation('area')} size="sm">
            Area
          </Button>
          <Button onClick={() => performOperation('intersection')} size="sm">
            Intersection
          </Button>
        </div>
        
        <div class="operation-results">
          {operations().slice(-5).map(op => (
            <div class="operation-result">
              <strong>{op.type}:</strong> {JSON.stringify(op.result)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
