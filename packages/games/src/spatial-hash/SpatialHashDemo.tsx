import { createSignal, onMount } from "solid-js";
import { Button } from "reynard-components";
import { SpatialHash } from "reynard-algorithms";
import { SpatialObject, QueryRect, GameConfig } from "../types";
import "./SpatialHashDemo.css";

interface SpatialHashDemoProps {
  config?: GameConfig;
}

export function SpatialHashDemo(props: SpatialHashDemoProps = {}) {
  const [objects, setObjects] = createSignal<SpatialObject[]>([]);
  const [spatialHash, setSpatialHash] = createSignal<SpatialHash | null>(null);
  const [queryResults, setQueryResults] = createSignal<number[]>([]);
  const [queryRect, setQueryRect] = createSignal<QueryRect>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [stats, setStats] = createSignal<any>(null);

  const config = {
    canvasWidth: 600,
    canvasHeight: 400,
    objectCount: 50,
    ...props.config,
  };

  const CANVAS_WIDTH = config.canvasWidth!;
  const CANVAS_HEIGHT = config.canvasHeight!;
  const OBJECT_COUNT = config.objectCount!;

  const createObject = (id: number): SpatialObject => ({
    id,
    x: Math.random() * (CANVAS_WIDTH - 40),
    y: Math.random() * (CANVAS_HEIGHT - 40),
    width: Math.random() * 30 + 10,
    height: Math.random() * 30 + 10,
    color: `oklch(60% 0.2 ${Math.random() * 360})`,
  });

  const initializeDemo = () => {
    const newObjects = Array.from({ length: OBJECT_COUNT }, (_, i) =>
      createObject(i),
    );
    setObjects(newObjects);

    const hash = new SpatialHash({ cellSize: 50 });
    newObjects.forEach((obj: SpatialObject) => {
      hash.insert({ ...obj, data: { name: `Object ${obj.id}` } });
    });
    setSpatialHash(hash);
    setStats(hash.getStats());
  };

  const handleCanvasClick = (event: MouseEvent) => {
    const rect = (event.target as SVGElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newQueryRect: QueryRect = {
      x: x - 50,
      y: y - 50,
      width: 100,
      height: 100,
    };
    setQueryRect(newQueryRect);

    const hash = spatialHash();
    if (hash) {
      const results = hash.queryRect(
        newQueryRect.x,
        newQueryRect.y,
        newQueryRect.width,
        newQueryRect.height,
      );
      setQueryResults(results.map((obj) => obj.id as number));
    }
  };

  onMount(initializeDemo);

  return (
    <div class="spatial-hash-demo">
      <div class="demo-header">
        <h3>🗺️ Spatial Hashing Visualization</h3>
        <div class="demo-controls">
          <Button onClick={initializeDemo} variant="secondary" size="sm">
            Regenerate
          </Button>
        </div>
        <div class="demo-stats">
          <span>Objects: {objects().length}</span>
          <span>Query Results: {queryResults().length}</span>
          <span>Cells: {stats()?.totalCells || 0}</span>
        </div>
      </div>

      <div class="spatial-canvas">
        <svg
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          class="spatial-svg"
          onClick={handleCanvasClick}
        >
          {/* Grid lines */}
          {Array.from({ length: Math.ceil(CANVAS_WIDTH / 50) }, (_, i) => (
            <line
              x1={i * 50}
              y1={0}
              x2={i * 50}
              y2={CANVAS_HEIGHT}
              stroke="#ddd"
              stroke-width="1"
            />
          ))}
          {Array.from({ length: Math.ceil(CANVAS_HEIGHT / 50) }, (_, i) => (
            <line
              x1={0}
              y1={i * 50}
              x2={CANVAS_WIDTH}
              y2={i * 50}
              stroke="#ddd"
              stroke-width="1"
            />
          ))}

          {/* Objects */}
          {objects().map((obj) => (
            <rect
              x={obj.x}
              y={obj.y}
              width={obj.width}
              height={obj.height}
              fill={obj.color}
              stroke={queryResults().includes(obj.id) ? "red" : "#333"}
              stroke-width={queryResults().includes(obj.id) ? "3" : "1"}
              opacity={queryResults().includes(obj.id) ? "0.8" : "0.6"}
            />
          ))}

          {/* Query rectangle */}
          <rect
            x={queryRect().x}
            y={queryRect().y}
            width={queryRect().width}
            height={queryRect().height}
            fill="none"
            stroke="blue"
            stroke-width="2"
            stroke-dasharray="5,5"
          />
        </svg>
      </div>

      <div class="demo-instructions">
        <p>
          🎯 <strong>Click</strong> anywhere to query objects in a 100x100 area
        </p>
        <p>
          💡 <strong>Algorithm:</strong> Spatial hashing for O(1) average case
          queries
        </p>
      </div>

      {stats() && (
        <div class="demo-stats-detail">
          <h4>Spatial Hash Statistics:</h4>
          <pre>{JSON.stringify(stats(), null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
