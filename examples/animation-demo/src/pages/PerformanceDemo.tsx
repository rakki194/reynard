/**
 * ⚡ Performance Demo
 *
 * Showcase of performance monitoring and optimization features
 */

import { Component, createSignal, onMount, onCleanup, For } from "solid-js";
// import { useAnimationControl } from "reynard-core/composables";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  threshold: { warning: number; critical: number };
}

export const PerformanceDemo: Component = () => {
  // Mock animation control functions for demo
  const getPerformanceMetrics = () => ({
    fps: 60,
    memoryUsage: 45.2,
    loadTime: 1200,
    animationCount: 5,
  });
  const setPerformanceMode = (_mode: string) => {};
  const isAnimationsDisabled = () => false;
  const [metrics, setMetrics] = createSignal<PerformanceMetric[]>([]);
  const [performanceMode, setPerformanceModeState] = createSignal<"normal" | "high" | "low">("normal");
  const [isMonitoring, setIsMonitoring] = createSignal(false);

  let monitoringInterval: ReturnType<typeof setInterval> | null = null;

  const updateMetrics = () => {
    const perfMetrics = getPerformanceMetrics();

    setMetrics([
      {
        name: "FPS",
        value: perfMetrics.fps,
        unit: "fps",
        trend: perfMetrics.fps > 55 ? "up" : perfMetrics.fps < 30 ? "down" : "stable",
        threshold: { warning: 45, critical: 30 },
      },
      {
        name: "Memory Usage",
        value: perfMetrics.memoryUsage,
        unit: "MB",
        trend: perfMetrics.memoryUsage < 50 ? "down" : perfMetrics.memoryUsage > 100 ? "up" : "stable",
        threshold: { warning: 80, critical: 120 },
      },
      {
        name: "Load Time",
        value: perfMetrics.loadTime,
        unit: "ms",
        trend: perfMetrics.loadTime < 1000 ? "down" : perfMetrics.loadTime > 3000 ? "up" : "stable",
        threshold: { warning: 2000, critical: 5000 },
      },
      {
        name: "Active Animations",
        value: perfMetrics.animationCount,
        unit: "count",
        trend: perfMetrics.animationCount < 10 ? "down" : perfMetrics.animationCount > 50 ? "up" : "stable",
        threshold: { warning: 30, critical: 100 },
      },
    ]);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    updateMetrics();

    monitoringInterval = setInterval(() => {
      updateMetrics();
    }, 1000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
  };

  const handlePerformanceModeChange = (mode: "normal" | "high" | "low") => {
    setPerformanceModeState(mode);
    setPerformanceMode(mode);
  };

  onMount(() => {
    updateMetrics();
  });

  onCleanup(() => {
    stopMonitoring();
  });

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.value >= metric.threshold.critical) return "critical";
    if (metric.value >= metric.threshold.warning) return "warning";
    return "good";
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      case "stable":
        return "➡️";
    }
  };

  return (
    <div class="performance-demo">
      <div class="demo-header">
        <h1 class="page-title">⚡ Performance Demo</h1>
        <p class="page-description">
          Real-time performance monitoring, optimization controls, and system health metrics.
        </p>
      </div>

      {/* Performance Controls */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎛️</span>
          Performance Controls
        </h2>
        <div class="demo-controls">
          <div class="control-group">
            <label class="control-label">Performance Mode</label>
            <select
              value={performanceMode()}
              onChange={e => handlePerformanceModeChange(e.currentTarget.value as "normal" | "high" | "low")}
            >
              <option value="normal">Normal</option>
              <option value="high">High Performance</option>
              <option value="low">Low Performance</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">
              <input
                type="checkbox"
                checked={isAnimationsDisabled()}
                onChange={() => {
                  // Toggle animations
                }}
              />
              Disable Animations
            </label>
          </div>

          <div class="control-group">
            <button class="control-button primary" onClick={isMonitoring() ? stopMonitoring : startMonitoring}>
              {isMonitoring() ? "⏹️ Stop Monitoring" : "▶️ Start Monitoring"}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>📊</span>
          Performance Metrics
        </h2>
        <div class="performance-metrics">
          <For each={metrics()}>
            {metric => (
              <div class={`metric-card ${getMetricStatus(metric)}`}>
                <div class="metric-header">
                  <div class="metric-name">{metric.name}</div>
                  <div class="metric-trend">{getTrendIcon(metric.trend)}</div>
                </div>
                <div class="metric-value">
                  {metric.value.toFixed(metric.unit === "fps" ? 1 : 0)}
                  <span class="metric-unit">{metric.unit}</span>
                </div>
                <div class="metric-thresholds">
                  <div class="threshold warning">
                    Warning: {metric.threshold.warning}
                    {metric.unit}
                  </div>
                  <div class="threshold critical">
                    Critical: {metric.threshold.critical}
                    {metric.unit}
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Performance Chart */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>📈</span>
          Performance Chart
        </h2>
        <div class="performance-chart">
          <div class="chart-placeholder">
            <div class="chart-info">
              <h3>Performance Chart Placeholder</h3>
              <p>In a real implementation, this would show a real-time performance chart</p>
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color good"></div>
                  <span>Good Performance</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color warning"></div>
                  <span>Warning</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color critical"></div>
                  <span>Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>💡</span>
          Performance Tips
        </h2>
        <div class="performance-tips">
          <div class="tip-item">
            <div class="tip-icon">🎯</div>
            <div class="tip-content">
              <h4>Optimize Animation Count</h4>
              <p>Keep active animations under 30 for optimal performance</p>
            </div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">⚡</div>
            <div class="tip-content">
              <h4>Use Performance Mode</h4>
              <p>Enable high performance mode for complex scenes</p>
            </div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">🛡️</div>
            <div class="tip-content">
              <h4>Fallback System</h4>
              <p>Automatic fallbacks ensure smooth performance on all devices</p>
            </div>
          </div>
          <div class="tip-item">
            <div class="tip-icon">📱</div>
            <div class="tip-content">
              <h4>Device Detection</h4>
              <p>System automatically adjusts quality based on device capabilities</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🔧</span>
          System Status
        </h2>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Monitoring:</span>
            <span class="status-value">{isMonitoring() ? "Active" : "Inactive"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Performance Mode:</span>
            <span class="status-value">{performanceMode()}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Animations:</span>
            <span class="status-value">{isAnimationsDisabled() ? "Disabled" : "Enabled"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Fallback System:</span>
            <span class="status-value">Ready</span>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>💻</span>
          Code Example
        </h2>
        <pre class="code-example">
          {`import { useAnimationControl } from "reynard-core/composables";

const { 
  getPerformanceMetrics, 
  setPerformanceMode, 
  isAnimationsDisabled 
} = useAnimationControl();

// Get current performance metrics
const metrics = getPerformanceMetrics();
console.log(\`FPS: \${metrics.fps}\`);
console.log(\`Memory: \${metrics.memoryUsage}MB\`);
console.log(\`Active Animations: \${metrics.animationCount}\`);

// Set performance mode
setPerformanceMode("high"); // "normal" | "high" | "low"

// Monitor performance
setInterval(() => {
  const currentMetrics = getPerformanceMetrics();
  if (currentMetrics.fps < 30) {
    setPerformanceMode("high");
  }
}, 1000);`}
        </pre>
      </div>
    </div>
  );
};
