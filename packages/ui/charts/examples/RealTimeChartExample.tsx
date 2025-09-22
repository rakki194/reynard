/**
 * Real-Time Chart Example
 * Demonstrates real-time data streaming capabilities
 */
import { createSignal, onMount, onCleanup } from "solid-js";
import { RealTimeChart } from "../components/RealTimeChart";
import type { RealTimeDataPoint } from "../components/RealTimeChart";

export function RealTimeChartExample() {
  const [data, setData] = createSignal<RealTimeDataPoint[]>([]);
  const [isRunning, setIsRunning] = createSignal(false);
  let intervalId: NodeJS.Timeout | null = null;

  const startRealTimeData = () => {
    if (isRunning()) return;
    
    setIsRunning(true);
    intervalId = setInterval(() => {
      const newPoint: RealTimeDataPoint = {
        timestamp: Date.now(),
        value: Math.random() * 100,
        label: new Date().toLocaleTimeString(),
      };
      
      setData(prev => {
        const updated = [...prev, newPoint];
        // Keep only last 50 points
        return updated.length > 50 ? updated.slice(-50) : updated;
      });
    }, 1000);
  };

  const stopRealTimeData = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setIsRunning(false);
  };

  const clearData = () => {
    setData([]);
  };

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return (
    <div style={{ padding: "20px", background: "#1a1a1a", color: "white" }}>
      <h2>🦊 Reynard Charts - Real-Time Example</h2>
      
      <div style={{ margin: "20px 0" }}>
        <h3>Live Performance Metrics</h3>
        
        <div style={{ margin: "10px 0" }}>
          <button 
            onClick={startRealTimeData}
            disabled={isRunning()}
            style={{
              padding: "8px 16px",
              margin: "0 5px",
              background: isRunning() ? "#666" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isRunning() ? "not-allowed" : "pointer"
            }}
          >
            {isRunning() ? "Running..." : "Start"}
          </button>
          
          <button 
            onClick={stopRealTimeData}
            disabled={!isRunning()}
            style={{
              padding: "8px 16px",
              margin: "0 5px",
              background: !isRunning() ? "#666" : "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: !isRunning() ? "not-allowed" : "pointer"
            }}
          >
            Stop
          </button>
          
          <button 
            onClick={clearData}
            style={{
              padding: "8px 16px",
              margin: "0 5px",
              background: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Clear
          </button>
        </div>

        <RealTimeChart
          type="line"
          data={data()}
          title="Live Performance Metrics"
          maxDataPoints={50}
          updateInterval={1000}
          autoScroll={true}
          useOKLCH={true}
          colorTheme="dark"
          width={800}
          height={400}
          showLegend={true}
          showGrid={true}
          xAxisLabel="Time"
          yAxisLabel="Value"
          enablePerformanceMonitoring={true}
        />
      </div>

      <div style={{ margin: "20px 0", padding: "10px", background: "#333", borderRadius: "4px" }}>
        <h4>Real-Time Features:</h4>
        <ul>
          <li>✅ Automatic data streaming with configurable intervals</li>
          <li>✅ Memory management with data point limits</li>
          <li>✅ Smooth animations and transitions</li>
          <li>✅ Performance monitoring and optimization</li>
          <li>✅ OKLCH color integration for consistent theming</li>
          <li>✅ Auto-scroll for continuous data visualization</li>
        </ul>
      </div>
    </div>
  );
}

