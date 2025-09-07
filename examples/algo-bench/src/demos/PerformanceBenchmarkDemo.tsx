import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { 
  batchCollisionDetection, 
  type AABB 
} from "reynard-algorithms";

interface PerformanceBenchmarkDemoProps {
  onStatsUpdate: (stats: any) => void;
}

interface BenchmarkResult {
  objectCount: number;
  naiveTime: number;
  spatialTime: number;
  speedup: number;
  collisionCount: number;
}

export const PerformanceBenchmarkDemo: Component<PerformanceBenchmarkDemoProps> = (props) => {
  const [isRunning, setIsRunning] = createSignal(false);
  const [results, setResults] = createSignal<BenchmarkResult[]>([]);
  const [currentTest, setCurrentTest] = createSignal(0);
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>();

  let animationFrameId: number;

  // Generate test data for different object counts
  const generateTestData = (objectCount: number): AABB[] => {
    const objects: AABB[] = [];
    for (let i = 0; i < objectCount; i++) {
      objects.push({
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30
      });
    }
    return objects;
  };

  // Run benchmark for a specific object count
  const runBenchmark = (objectCount: number): BenchmarkResult => {
    const objects = generateTestData(objectCount);
    
    // Warm up
    batchCollisionDetection(objects, { spatialHash: { enableOptimization: false } });
    batchCollisionDetection(objects, { spatialHash: { enableOptimization: true, cellSize: 50 } });

    // Benchmark naive algorithm (multiple runs for accuracy)
    const naiveRuns = 5;
    let naiveTotalTime = 0;
    for (let i = 0; i < naiveRuns; i++) {
      const start = performance.now();
      batchCollisionDetection(objects, { spatialHash: { enableOptimization: false } });
      naiveTotalTime += performance.now() - start;
    }
    const naiveTime = naiveTotalTime / naiveRuns;

    // Benchmark spatial hash algorithm (multiple runs for accuracy)
    const spatialRuns = 5;
    let spatialTotalTime = 0;
    let collisionCount = 0;
    for (let i = 0; i < spatialRuns; i++) {
      const start = performance.now();
      const collisions = batchCollisionDetection(objects, { 
        spatialHash: { enableOptimization: true, cellSize: 50 } 
      });
      spatialTotalTime += performance.now() - start;
      collisionCount = collisions.length;
    }
    const spatialTime = spatialTotalTime / spatialRuns;

    return {
      objectCount,
      naiveTime,
      spatialTime,
      speedup: naiveTime / spatialTime,
      collisionCount
    };
  };

  // Run comprehensive benchmark
  const runComprehensiveBenchmark = async () => {
    const testSizes = [10, 25, 50, 100, 150, 200, 300, 500];
    const newResults: BenchmarkResult[] = [];

    for (let i = 0; i < testSizes.length; i++) {
      setCurrentTest(i + 1);
      const result = runBenchmark(testSizes[i]);
      newResults.push(result);
      
      // Update results incrementally
      setResults([...newResults]);
      props.onStatsUpdate({
        currentTest: i + 1,
        totalTests: testSizes.length,
        latestResult: result
      });

      // Small delay to allow UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setCurrentTest(0);
    setIsRunning(false);
  };

  // Render benchmark visualization
  const render = () => {
    const canvas = canvasRef();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resultsData = results();
    if (resultsData.length === 0) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set up chart dimensions
    const margin = 60;
    const chartWidth = canvas.width - 2 * margin;
    const chartHeight = canvas.height - 2 * margin;
    const maxObjects = Math.max(...resultsData.map(r => r.objectCount));
    const maxTime = Math.max(...resultsData.map(r => Math.max(r.naiveTime, r.spatialTime)));

    // Draw axes
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = margin + (i / 10) * chartWidth;
      const y = margin + (i / 10) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, canvas.height - margin);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(canvas.width - margin, y);
      ctx.stroke();
    }

    // Draw naive algorithm line
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    resultsData.forEach((result, index) => {
      const x = margin + (result.objectCount / maxObjects) * chartWidth;
      const y = canvas.height - margin - (result.naiveTime / maxTime) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw spatial hash algorithm line
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    resultsData.forEach((result, index) => {
      const x = margin + (result.objectCount / maxObjects) * chartWidth;
      const y = canvas.height - margin - (result.spatialTime / maxTime) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    resultsData.forEach(result => {
      const x = margin + (result.objectCount / maxObjects) * chartWidth;
      const naiveY = canvas.height - margin - (result.naiveTime / maxTime) * chartHeight;
      const spatialY = canvas.height - margin - (result.spatialTime / maxTime) * chartHeight;

      // Naive points
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(x, naiveY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Spatial points
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.arc(x, spatialY, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText('Object Count', canvas.width / 2 - 50, canvas.height - 20);
    
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Execution Time (ms)', 0, 0);
    ctx.restore();

    // Draw legend
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(canvas.width - 200, 20, 15, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Naive O(n²)', canvas.width - 180, 32);

    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(canvas.width - 200, 40, 15, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Spatial Hash O(n)', canvas.width - 180, 52);
  };

  // Animation loop
  const animate = () => {
    render();
    animationFrameId = requestAnimationFrame(animate);
  };

  // Effects
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
    <div class="benchmark-demo">
      <div class="demo-controls">
        <div class="control-group">
          <button 
            class={`control-button ${isRunning() ? 'active' : ''}`}
            onClick={() => {
              if (!isRunning()) {
                setIsRunning(true);
                setResults([]);
                runComprehensiveBenchmark();
              }
            }}
            disabled={isRunning()}
          >
            {isRunning() ? `🔄 Running Test ${currentTest()}/8...` : '🚀 Start Benchmark'}
          </button>
          
          <button 
            class="control-button"
            onClick={() => setResults([])}
            disabled={isRunning()}
          >
            🗑️ Clear Results
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
          <p>Performance Comparison Chart • Red: Naive O(n²) • Teal: Spatial Hash O(n)</p>
        </div>
      </div>

      <div class="benchmark-results">
        {results().length > 0 && (
          <div class="results-table">
            <h3>Benchmark Results</h3>
            <table>
              <thead>
                <tr>
                  <th>Objects</th>
                  <th>Naive Time (ms)</th>
                  <th>Spatial Time (ms)</th>
                  <th>Speedup</th>
                  <th>Collisions</th>
                </tr>
              </thead>
              <tbody>
                {results().map(result => (
                  <tr>
                    <td>{result.objectCount}</td>
                    <td>{result.naiveTime.toFixed(2)}</td>
                    <td>{result.spatialTime.toFixed(2)}</td>
                    <td class={result.speedup > 2 ? 'highlight' : ''}>
                      {result.speedup.toFixed(2)}x
                    </td>
                    <td>{result.collisionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
