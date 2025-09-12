import { Component, createSignal, createMemo, onMount } from "solid-js";
import type { OKLCHColor } from "reynard-colors";
import { basicColorRamp, generateHueShiftRamp } from "../utils/hueShiftingAlgorithms";
import "./PerformanceComparison.css";

export const PerformanceComparison: Component = () => {
  const [iterations, setIterations] = createSignal(1000);
  const [isRunning, setIsRunning] = createSignal(false);
  const [results, setResults] = createSignal<{
    oklch: { time: number; operations: number };
    rgb: { time: number; operations: number };
  } | null>(null);
  
  const testColors = createMemo(() => {
    const colors: OKLCHColor[] = [];
    for (let i = 0; i < 100; i++) {
      colors.push({
        l: 20 + (i % 8) * 10,
        c: 0.1 + (i % 5) * 0.05,
        h: (i * 36) % 360
      });
    }
    return colors;
  });
  
  const runBenchmark = async () => {
    setIsRunning(true);
    setResults(null);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const testColorsArray = testColors();
    const iterationsCount = iterations();
    
    // Test OKLCH hue shifting
    const oklchStart = performance.now();
    for (let i = 0; i < iterationsCount; i++) {
      testColorsArray.forEach(color => {
        basicColorRamp(color, 'shadow', 0.3);
        basicColorRamp(color, 'highlight', 0.3);
        generateHueShiftRamp(color, 5);
      });
    }
    const oklchEnd = performance.now();
    
    // Test RGB-based approach (simulated)
    const rgbStart = performance.now();
    for (let i = 0; i < iterationsCount; i++) {
      testColorsArray.forEach(color => {
        // Simulate RGB-based hue shifting (just lightness changes)
        const shadow = { ...color, l: Math.max(0, color.l - 30) };
        const highlight = { ...color, l: Math.min(100, color.l + 25) };
        // Simulate ramp generation
        for (let j = 0; j < 5; j++) {
          const t = j / 4;
          const lightness = color.l + (t - 0.5) * 40;
          const rampColor = { l: lightness, c: color.c, h: color.h };
          // Use the rampColor to simulate processing
          Math.sqrt(rampColor.l * rampColor.c);
        }
      });
    }
    const rgbEnd = performance.now();
    
    setResults({
      oklch: {
        time: oklchEnd - oklchStart,
        operations: iterationsCount * testColorsArray.length * 3
      },
      rgb: {
        time: rgbEnd - rgbStart,
        operations: iterationsCount * testColorsArray.length * 3
      }
    });
    
    setIsRunning(false);
  };
  
  const performanceRatio = createMemo(() => {
    const result = results();
    if (!result) return 0;
    return result.oklch.time / result.rgb.time;
  });
  
  const operationsPerSecond = createMemo(() => {
    const result = results();
    if (!result) return { oklch: 0, rgb: 0 };
    return {
      oklch: Math.round(result.oklch.operations / (result.oklch.time / 1000)),
      rgb: Math.round(result.rgb.operations / (result.rgb.time / 1000))
    };
  });
  
  return (
    <div class="performance-comparison">
      <header class="comparison-header">
        <h2>Performance Comparison</h2>
        <p>
          Compare the performance of OKLCH hue shifting algorithms against 
          traditional RGB-based approaches.
        </p>
      </header>
      
      <div class="comparison-controls">
        <div class="control-group">
          <label for="iterations-input">
            Test Iterations: {iterations()}
          </label>
          <input
            id="iterations-input"
            type="range"
            min="100"
            max="10000"
            step="100"
            value={iterations()}
            onInput={(e) => setIterations(parseInt(e.target.value))}
            class="iterations-slider"
            disabled={isRunning()}
          />
          <div class="slider-labels">
            <span>100</span>
            <span>10,000</span>
          </div>
        </div>
        
        <button
          class="run-benchmark-button"
          onClick={runBenchmark}
          disabled={isRunning()}
        >
          {isRunning() ? "Running..." : "Run Benchmark"}
        </button>
      </div>
      
      {results() && (
        <div class="results-display">
          <div class="results-grid">
            <div class="result-card oklch">
              <h3>OKLCH Hue Shifting</h3>
              <div class="result-metrics">
                <div class="metric">
                  <span class="metric-label">Total Time:</span>
                  <span class="metric-value">{results()!.oklch.time.toFixed(2)}ms</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Operations/sec:</span>
                  <span class="metric-value">{operationsPerSecond().oklch.toLocaleString()}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Total Operations:</span>
                  <span class="metric-value">{results()!.oklch.operations.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div class="result-card rgb">
              <h3>RGB-Based Approach</h3>
              <div class="result-metrics">
                <div class="metric">
                  <span class="metric-label">Total Time:</span>
                  <span class="metric-value">{results()!.rgb.time.toFixed(2)}ms</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Operations/sec:</span>
                  <span class="metric-value">{operationsPerSecond().rgb.toLocaleString()}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Total Operations:</span>
                  <span class="metric-value">{results()!.rgb.operations.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="performance-summary">
            <h3>Performance Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">OKLCH vs RGB Ratio:</span>
                <span class="summary-value">
                  {performanceRatio().toFixed(2)}x
                  {performanceRatio() > 1 ? " slower" : " faster"}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Performance Winner:</span>
                <span class="summary-value">
                  {performanceRatio() > 1 ? "RGB Approach" : "OKLCH Approach"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div class="performance-info">
        <h3>Performance Considerations</h3>
        <div class="info-grid">
          <div class="info-card">
            <h4>OKLCH Advantages</h4>
            <ul>
              <li>Perceptually uniform color changes</li>
              <li>Better visual quality</li>
              <li>Consistent results across hues</li>
              <li>Modern browser optimization</li>
            </ul>
          </div>
          <div class="info-card">
            <h4>RGB Advantages</h4>
            <ul>
              <li>Simpler calculations</li>
              <li>Lower computational overhead</li>
              <li>Universal browser support</li>
              <li>Familiar to developers</li>
            </ul>
          </div>
          <div class="info-card">
            <h4>Optimization Tips</h4>
            <ul>
              <li>Cache color calculations</li>
              <li>Use batch processing</li>
              <li>Pre-compute palettes</li>
              <li>Consider Web Workers for heavy tasks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
