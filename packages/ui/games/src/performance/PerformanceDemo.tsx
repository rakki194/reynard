// import { debounce, MemoryMonitor, PerformanceTimer, throttle } from "reynard-algorithms";

// Temporary placeholders until algorithms package is built
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

class MemoryMonitor {
  static getMemoryUsage() {
    if ((performance as any).memory) {
      return {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }
  
  static measure(): { used: number; total: number; limit: number } {
    return this.getMemoryUsage();
  }
}

class PerformanceTimer {
  private startTime: number = 0;
  
  start() {
    this.startTime = performance.now();
  }
  
  end(): number {
    return performance.now() - this.startTime;
  }
  
  stop(): number {
    return this.end();
  }
}
import { Button } from "reynard-components-core";
import { createSignal } from "solid-js";
import "./PerformanceDemo.css";
export function PerformanceDemo(_props = {}) {
  const [memoryMonitor, setMemoryMonitor] = createSignal(null);
  const [measurements, setMeasurements] = createSignal([]);
  const performHeavyOperation = () => {
    const newTimer = new PerformanceTimer();
    const newMemoryMonitor = new MemoryMonitor();
    setMemoryMonitor(newMemoryMonitor);
    newTimer.start();
    const memoryBefore = MemoryMonitor.measure();
    // Simulate heavy operation
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i) * Math.sin(i);
    }
    const duration = newTimer.stop();
    const memoryAfter = MemoryMonitor.measure();
    setMeasurements(prev => [
      ...prev,
      {
        name: `Heavy Operation ${prev.length + 1}`,
        duration,
        memory: memoryAfter.used - memoryBefore.used,
        timestamp: Date.now(),
      },
    ]);
  };
  const throttledOperation = throttle(() => {
    console.log("Throttled operation executed");
  }, 1000);
  const debouncedOperation = debounce(() => {
    console.log("Debounced operation executed");
  }, 500);
  return (
    <div class="performance-demo">
      <div class="demo-header">
        <h3>⚡ Performance Monitoring Demo</h3>
        <div class="demo-controls">
          <Button onClick={performHeavyOperation} variant="primary" size="sm">
            Run Heavy Operation
          </Button>
          <Button onClick={throttledOperation} variant="secondary" size="sm">
            Throttled (1s)
          </Button>
          <Button onClick={debouncedOperation} variant="secondary" size="sm">
            Debounced (500ms)
          </Button>
        </div>
      </div>

      <div class="performance-metrics">
        <div class="metric-card">
          <h4>Recent Measurements</h4>
          <div class="measurements-list">
            {measurements()
              .slice(-5)
              .map(measurement => (
                <div class="measurement">
                  <span class="measurement-name">{measurement.name}</span>
                  <span class="measurement-duration">{measurement.duration.toFixed(2)}ms</span>
                  <span class="measurement-memory">{measurement.memory} bytes</span>
                </div>
              ))}
          </div>
        </div>

        <div class="metric-card">
          <h4>Memory Usage</h4>
          <div class="memory-info">
            {memoryMonitor() && (
              <div>
                <p>Current: {memoryMonitor().getAverageUsage().toFixed(0)} bytes</p>
                <p>Delta: {memoryMonitor().getDelta()} bytes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div class="demo-instructions">
        <p>
          🎯 <strong>Click</strong> buttons to test performance monitoring
        </p>
        <p>
          💡 <strong>Features:</strong> High-precision timing, memory monitoring, throttling, debouncing
        </p>
      </div>
    </div>
  );
}
