/**
 * Comprehensive Dashboard Example
 * Demonstrates all chart types and features of Reynard Charts
 */
import { createSignal, onMount } from "solid-js";
import { Chart, RealTimeChart, StatisticalChart } from "../components";
import type { Dataset, RealTimeDataPoint } from "../types";

export function ComprehensiveDashboard() {
  const [realTimeData, setRealTimeData] = createSignal<RealTimeDataPoint[]>([]);
  const [selectedTheme, setSelectedTheme] = createSignal<"dark" | "light" | "gray">("dark");

  // Sample data for different chart types
  const salesData: Dataset[] = [
    {
      label: "Q1 Sales",
      data: [120, 190, 300, 500, 200, 300],
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 2,
    },
    {
      label: "Q2 Sales",
      data: [180, 250, 400, 600, 350, 450],
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 2,
    },
  ];

  const revenueData: Dataset[] = [
    {
      label: "Revenue",
      data: [45, 35, 20],
    },
  ];

  const performanceData: Dataset[] = [
    {
      label: "CPU Usage",
      data: [65, 78, 82, 75, 88, 92, 85],
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 2,
      fill: true,
    },
  ];

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const pieLabels = ["Desktop", "Mobile", "Tablet"];

  // Initialize real-time data
  onMount(() => {
    const interval = setInterval(() => {
      const newPoint: RealTimeDataPoint = {
        timestamp: Date.now(),
        value: Math.random() * 100,
        label: new Date().toLocaleTimeString(),
      };
      
      setRealTimeData(prev => {
        const updated = [...prev, newPoint];
        return updated.length > 30 ? updated.slice(-30) : updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  });

  const themeColors = {
    dark: { background: "#1a1a1a", text: "white", card: "#2a2a2a" },
    light: { background: "#ffffff", text: "black", card: "#f5f5f5" },
    gray: { background: "#f0f0f0", text: "#333", card: "#e0e0e0" },
  };

  const currentTheme = () => themeColors[selectedTheme()];

  return (
    <div style={{ 
      padding: "20px", 
      background: currentTheme().background, 
      color: currentTheme().text,
      minHeight: "100vh"
    }}>
      <header style={{ marginBottom: "30px" }}>
        <h1>🦊 Reynard Charts - Comprehensive Dashboard</h1>
        <p>Professional data visualization with OKLCH color integration and real-time capabilities</p>
        
        <div style={{ margin: "20px 0" }}>
          <label style={{ marginRight: "10px" }}>Theme:</label>
          <select 
            value={selectedTheme()}
            onChange={(e) => setSelectedTheme(e.target.value as any)}
            style={{
              padding: "5px 10px",
              background: currentTheme().card,
              color: currentTheme().text,
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="gray">Gray</option>
          </select>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        {/* Line Chart */}
        <div style={{ 
          background: currentTheme().card, 
          padding: "20px", 
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}>
          <h3>📈 Sales Trend Analysis</h3>
          <Chart
            type="line"
            labels={labels}
            datasets={salesData}
            useOKLCH={true}
            colorTheme={selectedTheme()}
            width={500}
            height={300}
            title="Quarterly Sales Comparison"
            showLegend={true}
            showGrid={true}
            xAxisLabel="Month"
            yAxisLabel="Sales ($K)"
            enablePerformanceMonitoring={true}
          />
        </div>

        {/* Bar Chart */}
        <div style={{ 
          background: currentTheme().card, 
          padding: "20px", 
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}>
          <h3>📊 Performance Metrics</h3>
          <Chart
            type="bar"
            labels={labels}
            datasets={performanceData}
            useOKLCH={true}
            colorTheme={selectedTheme()}
            width={500}
            height={300}
            title="System Performance"
            showLegend={true}
            showGrid={true}
            xAxisLabel="Time"
            yAxisLabel="CPU Usage (%)"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        {/* Pie Chart */}
        <div style={{ 
          background: currentTheme().card, 
          padding: "20px", 
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}>
          <h3>🥧 Traffic Sources</h3>
          <Chart
            type="pie"
            labels={pieLabels}
            datasets={revenueData}
            useOKLCH={true}
            colorTheme={selectedTheme()}
            width={400}
            height={300}
            title="User Traffic Distribution"
            showLegend={true}
          />
        </div>

        {/* Doughnut Chart */}
        <div style={{ 
          background: currentTheme().card, 
          padding: "20px", 
          borderRadius: "8px",
          border: "1px solid #ddd"
        }}>
          <h3>🍩 Revenue Breakdown</h3>
          <Chart
            type="doughnut"
            labels={["Product Sales", "Services", "Subscriptions"]}
            datasets={[{
              label: "Revenue",
              data: [60, 25, 15],
            }]}
            useOKLCH={true}
            colorTheme={selectedTheme()}
            width={400}
            height={300}
            title="Revenue Distribution"
            showLegend={true}
          />
        </div>
      </div>

      {/* Real-Time Chart */}
      <div style={{ 
        background: currentTheme().card, 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #ddd",
        marginBottom: "30px"
      }}>
        <h3>⚡ Real-Time Monitoring</h3>
        <RealTimeChart
          type="line"
          data={realTimeData()}
          title="Live System Metrics"
          maxDataPoints={30}
          updateInterval={2000}
          autoScroll={true}
          useOKLCH={true}
          colorTheme={selectedTheme()}
          width={800}
          height={300}
          showLegend={true}
          showGrid={true}
          xAxisLabel="Time"
          yAxisLabel="Value"
          enablePerformanceMonitoring={true}
        />
      </div>

      {/* Features Overview */}
      <div style={{ 
        background: currentTheme().card, 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid #ddd"
      }}>
        <h3>🚀 Reynard Charts Features</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          <div>
            <h4>🎨 Color System</h4>
            <ul>
              <li>OKLCH color space integration</li>
              <li>Automatic theme adaptation</li>
              <li>Accessible color palettes</li>
              <li>Custom color generators</li>
            </ul>
          </div>
          <div>
            <h4>⚡ Performance</h4>
            <ul>
              <li>Real-time data streaming</li>
              <li>Memory management</li>
              <li>Performance monitoring</li>
              <li>Optimized rendering</li>
            </ul>
          </div>
          <div>
            <h4>🔧 Flexibility</h4>
            <ul>
              <li>Multiple chart types</li>
              <li>Customizable themes</li>
              <li>Responsive design</li>
              <li>TypeScript support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

