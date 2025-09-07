import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { 
  batchCollisionDetection, 
  batchCollisionWithSpatialHash,
  type AABB 
} from "reynard-algorithms";

interface SpatialOptimizationDemoProps {
  onStatsUpdate: (stats: any) => void;
}

interface PerformanceStats {
  naiveTime: number;
  spatialTime: number;
  speedup: number;
  objectCount: number;
  collisionCount: number;
}

export const SpatialOptimizationDemo: Component<SpatialOptimizationDemoProps> = (props) => {
  const [objectCount, setObjectCount] = createSignal(50);
  const [isRunning, setIsRunning] = createSignal(false);
  const [stats, setStats] = createSignal<PerformanceStats>({
    naiveTime: 0,
    spatialTime: 0,
    speedup: 0,
    objectCount: 0,
    collisionCount: 0
  });
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();
  const [objects, setObjects] = createSignal<AABB[]>([]);

  let animationFrameId: number;

  // Generate random AABBs
  const generateObjects = () => {
    const newObjects: AABB[] = [];
    for (let i = 0; i < objectCount(); i++) {
      newObjects.push({
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30
      });
    }
    setObjects(newObjects);
  };

  // Benchmark both algorithms
  const benchmarkAlgorithms = () => {
    const currentObjects = objects();
    if (currentObjects.length === 0) return;

    // Benchmark naive algorithm
    const naiveStart = performance.now();
    const naiveCollisions = batchCollisionDetection(currentObjects, {
      spatialHash: { enableOptimization: false }
    });
    const naiveEnd = performance.now();
    const naiveTime = naiveEnd - naiveStart;

    // Benchmark spatial hash algorithm
    const spatialStart = performance.now();
    const spatialCollisions = batchCollisionDetection(currentObjects, {
      spatialHash: { 
        enableOptimization: true,
        cellSize: 50
      }
    });
    const spatialEnd = performance.now();
    const spatialTime = spatialEnd - spatialStart;

    const speedup = naiveTime > 0 ? naiveTime / spatialTime : 0;

    setStats({
      naiveTime,
      spatialTime,
      speedup,
      objectCount: currentObjects.length,
      collisionCount: spatialCollisions.length
    });

    props.onStatsUpdate({
      naiveTime: naiveTime.toFixed(2),
      spatialTime: spatialTime.toFixed(2),
      speedup: speedup.toFixed(2),
      objectCount: currentObjects.length,
      collisionCount: spatialCollisions.length
    });
  };

  // Render visualization
  const render = () => {
    const canvas = canvasRef();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw spatial hash grid
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    const cellSize = 50;
    for (let x = 0; x < canvas.width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw objects
    objects().forEach((obj, index) => {
      ctx.fillStyle = `hsl(${(index * 137.5) % 360}, 70%, 60%)`;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    });

    // Draw performance info
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(`Objects: ${stats().objectCount}`, 10, 30);
    ctx.fillText(`Naive Time: ${stats().naiveTime.toFixed(2)}ms`, 10, 50);
    ctx.fillText(`Spatial Time: ${stats().spatialTime.toFixed(2)}ms`, 10, 70);
    ctx.fillText(`Speedup: ${stats().speedup.toFixed(2)}x`, 10, 90);
    ctx.fillText(`Collisions: ${stats().collisionCount}`, 10, 110);
  };

  // Animation loop
  const animate = () => {
    if (!isRunning()) return;

    benchmarkAlgorithms();
    render();

    animationFrameId = requestAnimationFrame(animate);
  };

  // Effects
  createEffect(() => {
    generateObjects();
  });

  createEffect(() => {
    if (isRunning()) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    }
  });

  onCleanup(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });

  return (
    <div class="spatial-demo">
      <div class="demo-controls">
        <div class="control-group">
          <label for="spatial-object-count-slider">Object Count: {objectCount()}</label>
          <input 
            id="spatial-object-count-slider"
            type="range" 
            min="10" 
            max="200" 
            value={objectCount()}
            onInput={(e) => setObjectCount(parseInt(e.currentTarget.value))}
            title="Adjust the number of objects for performance comparison"
          />
        </div>
        
        <div class="control-group">
          <button 
            class={`control-button ${isRunning() ? 'active' : ''}`}
            onClick={() => setIsRunning(!isRunning())}
          >
            {isRunning() ? '⏸️ Pause' : '▶️ Start Benchmark'}
          </button>
          
          <button 
            class="control-button"
            onClick={generateObjects}
          >
            🔄 Regenerate
          </button>
        </div>
      </div>

      <div class="demo-canvas-container">
        <canvas
          ref={setCanvasRef}
          width={800}
          height={500}
          class="demo-canvas"
        />
        <div class="canvas-overlay">
          <p>Spatial Hash Grid Visualization • Each cell is 50x50 pixels</p>
        </div>
      </div>

      <div class="performance-comparison">
        <div class="comparison-card">
          <h3>Naive O(n²) Algorithm</h3>
          <div class="metric">
            <span class="metric-label">Execution Time:</span>
            <span class="metric-value">{stats().naiveTime.toFixed(2)}ms</span>
          </div>
          <div class="metric">
            <span class="metric-label">Complexity:</span>
            <span class="metric-value">O(n²)</span>
          </div>
        </div>

        <div class="comparison-card">
          <h3>Spatial Hash Algorithm</h3>
          <div class="metric">
            <span class="metric-label">Execution Time:</span>
            <span class="metric-value">{stats().spatialTime.toFixed(2)}ms</span>
          </div>
          <div class="metric">
            <span class="metric-label">Complexity:</span>
            <span class="metric-value">O(n)</span>
          </div>
        </div>

        <div class="comparison-card highlight">
          <h3>Performance Improvement</h3>
          <div class="metric">
            <span class="metric-label">Speedup:</span>
            <span class="metric-value">{stats().speedup.toFixed(2)}x</span>
          </div>
          <div class="metric">
            <span class="metric-label">Efficiency Gain:</span>
            <span class="metric-value">{((stats().speedup - 1) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
