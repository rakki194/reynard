# Reynard Charts

_Professional data visualization components for SolidJS applications with OKLCH color integration and real-time capabilities._

## Overview

Reynard Charts provides a comprehensive suite of data visualization components built on Chart.js, enhanced with advanced features from yipyap's visualization system. The package features unified OKLCH color management, real-time data streaming, statistical analysis tools, and performance optimization.

## Installation

```bash
npm install reynard-charts reynard-core reynard-color-media chart.js solid-chartjs solid-js
```

## Quick Start

### Basic Chart

```tsx
import { Chart } from "reynard-charts";

function Dashboard() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Sales",
        data: [12, 19, 3, 5, 2],
      },
    ],
  };

  return (
    <Chart
      type="line"
      labels={data.labels}
      datasets={data.datasets}
      title="Monthly Sales"
      width={600}
      height={400}
      useOKLCH={true}
      colorTheme="dark"
    />
  );
}
```

### Real-Time Chart

```tsx
import { RealTimeChart } from "reynard-charts";

function LiveDashboard() {
  const [data, setData] = createSignal([]);

  // Simulate real-time data
  onMount(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        [
          ...prev,
          {
            timestamp: Date.now(),
            value: Math.random() * 100,
            label: new Date().toLocaleTimeString(),
          },
        ].slice(-50),
      ); // Keep last 50 points
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  return (
    <RealTimeChart
      type="line"
      data={data()}
      title="Live Performance Metrics"
      maxDataPoints={50}
      updateInterval={1000}
      autoScroll={true}
      useOKLCH={true}
    />
  );
}
```

### Statistical Chart

```tsx
import { StatisticalChart } from "reynard-charts";

function AnalyticsDashboard() {
  const histogramData = {
    values: [1.2, 2.3, 1.8, 3.1, 2.7, 1.9, 2.4, 3.0, 2.1, 2.8],
    statistics: {
      min: 1.2,
      q1: 1.9,
      median: 2.35,
      q3: 2.8,
      max: 3.1,
      mean: 2.33,
      std: 0.58,
    },
  };

  return (
    <StatisticalChart
      type="histogram"
      data={histogramData}
      title="Data Distribution"
      numBins={10}
      showStatistics={true}
      useOKLCH={true}
    />
  );
}
```

## Core Features

### 🎨 OKLCH Color Integration

- **Perceptually Uniform Colors**: Uses OKLCH color space for consistent, accessible colors
- **Theme-Aware Generation**: Automatically adapts to Reynard themes (dark, light, gray, banana, strawberry, peanut)
- **Smart Color Palettes**: Generates harmonious color schemes for multiple datasets
- **Accessibility**: Built-in contrast ratios and color-blind friendly palettes

### ⚡ Real-Time Capabilities

- **Live Data Streaming**: WebSocket and polling-based real-time updates
- **Performance Optimization**: Automatic data aggregation and memory management
- **Smooth Animations**: Hardware-accelerated transitions and updates
- **Configurable Intervals**: Customizable update frequencies and data retention

### 📊 Advanced Chart Types

- **Standard Charts**: Line, Bar, Pie, Doughnut with enhanced styling
- **Statistical Visualizations**: Histograms, box plots, quality metrics
- **Real-Time Charts**: Live data streaming with performance monitoring
- **Custom Visualizations**: Extensible architecture for specialized charts

### 🔧 Performance Features

- **Memory Management**: Automatic cleanup and memory limit monitoring
- **Lazy Loading**: Dynamic imports for optimal bundle size
- **Performance Monitoring**: Built-in FPS and memory usage tracking
- **Optimized Rendering**: Efficient updates and minimal re-renders

## API Reference

### Chart Component

The unified `Chart` component provides a consistent interface for all chart types.

```tsx
interface ChartProps {
  type: "line" | "bar" | "pie" | "doughnut";
  labels: string[];
  datasets: Dataset[];
  useOKLCH?: boolean;
  colorTheme?: string;
  realTime?: boolean;
  updateInterval?: number;
  loading?: boolean;
  emptyMessage?: string;
  enablePerformanceMonitoring?: boolean;
  // ... standard chart props
}
```

### RealTimeChart Component

Specialized component for live data visualization.

```tsx
interface RealTimeChartProps {
  type: ChartType;
  data: RealTimeDataPoint[];
  maxDataPoints?: number;
  updateInterval?: number;
  autoScroll?: boolean;
  timeRange?: number;
  aggregationInterval?: number;
  streaming?: {
    enabled: boolean;
    url?: string;
    websocket?: WebSocket;
    parser?: (data: any) => RealTimeDataPoint;
  };
  // ... other props
}
```

### StatisticalChart Component

Advanced statistical visualization component.

```tsx
interface StatisticalChartProps {
  type: "histogram" | "boxplot" | "quality-bar" | "quality-gauge";
  data: StatisticalData | QualityData;
  numBins?: number;
  showStatistics?: boolean;
  showAssessment?: boolean;
  colorScheme?: "default" | "gradient" | "status";
  // ... other props
}
```

## Visualization Engine

The core `VisualizationEngine` provides centralized color management and performance monitoring.

```tsx
import { useVisualizationEngine } from "reynard-charts";

function MyComponent() {
  const visualization = useVisualizationEngine({
    theme: "dark",
    useOKLCH: true,
    performance: {
      lazyLoading: true,
      memoryLimit: 512,
      targetFPS: 60,
    },
  });

  // Generate colors
  const colors = visualization.generateColors(5);
  const tagColors = visualization.generateTagColors(["tag1", "tag2"]);
  const palette = visualization.generatePalette(3);

  // Monitor performance
  const stats = visualization.stats();
  console.log(`FPS: ${stats.fps}, Memory: ${stats.memoryUsage}MB`);

  return <div>...</div>;
}
```

## Advanced Usage

### Custom Color Generation

```tsx
import { useVisualizationEngine } from "reynard-charts";

function CustomChart() {
  const visualization = useVisualizationEngine({
    theme: "strawberry",
    baseHue: 120, // Green base
    saturation: 0.4,
    lightness: 0.7,
  });

  const customColors = visualization.generateColors(3, 0.8);

  return (
    <Chart
      type="bar"
      labels={["A", "B", "C"]}
      datasets={[
        {
          label: "Custom Colors",
          data: [10, 20, 30],
          backgroundColor: customColors,
        },
      ]}
    />
  );
}
```

### WebSocket Streaming

```tsx
function StreamingChart() {
  const [ws, setWs] = createSignal<WebSocket | null>(null);
  const [data, setData] = createSignal<RealTimeDataPoint[]>([]);

  onMount(() => {
    const websocket = new WebSocket("ws://localhost:8080/data");
    websocket.onmessage = (event) => {
      const point = JSON.parse(event.data);
      setData((prev) => [...prev, point].slice(-100));
    };
    setWs(websocket);
  });

  return (
    <RealTimeChart
      type="line"
      data={data()}
      streaming={{
        enabled: true,
        websocket: ws(),
        parser: (data) => ({
          timestamp: data.time,
          value: data.value,
          label: new Date(data.time).toLocaleTimeString(),
        }),
      }}
    />
  );
}
```

### Performance Monitoring

```tsx
function MonitoredChart() {
  const visualization = useVisualizationEngine();

  createEffect(() => {
    const stats = visualization.stats();
    if (stats.memoryUsage > 400) {
      console.warn("High memory usage detected");
    }
    if (stats.fps < 30) {
      console.warn("Low FPS detected");
    }
  });

  return (
    <Chart
      type="line"
      labels={labels}
      datasets={datasets}
      enablePerformanceMonitoring={true}
    />
  );
}
```

## Performance Considerations

### Memory Management

- **Automatic Cleanup**: Components automatically clean up resources on unmount
- **Memory Limits**: Configurable memory limits with automatic cache clearing
- **Data Aggregation**: Automatic data aggregation for large datasets
- **Lazy Loading**: Dynamic imports reduce initial bundle size

### Optimization Strategies

- **Data Limiting**: Use `maxDataPoints` to limit displayed data
- **Update Throttling**: Configure `updateInterval` to control update frequency
- **Color Caching**: Colors are cached for performance
- **Performance Monitoring**: Built-in monitoring helps identify bottlenecks

### Best Practices

1. **Use OKLCH Colors**: Enable `useOKLCH={true}` for better color consistency
2. **Limit Real-Time Data**: Set appropriate `maxDataPoints` for real-time charts
3. **Monitor Performance**: Enable performance monitoring in development
4. **Clean Up Resources**: Components handle cleanup automatically
5. **Optimize Updates**: Use appropriate update intervals for real-time data

## Troubleshooting

### Common Issues

**Chart not rendering:**

- Ensure Chart.js is properly registered
- Check that data is in the correct format
- Verify component is mounted

**Performance issues:**

- Reduce `maxDataPoints` for large datasets
- Increase `updateInterval` for real-time charts
- Enable performance monitoring to identify bottlenecks

**Color issues:**

- Verify `reynard-color-media` is installed
- Check theme configuration
- Ensure OKLCH support in target browsers

### Debug Mode

Enable debug mode for detailed logging:

```tsx
import { VisualizationEngine } from "reynard-charts";

const engine = VisualizationEngine.getInstance({
  performance: {
    lazyLoading: true,
    memoryLimit: 256,
  },
});

// Monitor performance
setInterval(() => {
  const stats = engine.getStats();
  console.log("Performance Stats:", stats);
}, 5000);
```

## Migration Guide

### From Legacy Components

The new unified components are backward compatible with existing code:

```tsx
// Old way
import { LineChart } from "reynard-charts";

// New way (recommended)
import { Chart } from "reynard-charts";

// Both work the same way
<Chart type="line" labels={labels} datasets={datasets} />;
```

### Adding OKLCH Support

To enable OKLCH colors in existing charts:

```tsx
// Add these props to existing charts
<Chart
  type="line"
  labels={labels}
  datasets={datasets}
  useOKLCH={true}
  colorTheme="dark"
/>
```

## Conclusion

🦊> _Reynard Charts provides a professional, performant, and accessible data visualization solution that combines the best of Chart.js with advanced features from yipyap's visualization system. The unified OKLCH color management ensures consistent, accessible colors across all visualizations, while the real-time capabilities and performance monitoring make it suitable for production applications._

Reynard Charts delivers a comprehensive visualization solution that scales from simple dashboards to complex real-time analytics. The modular architecture, OKLCH color integration, and performance optimization make it the ideal choice for modern SolidJS applications.

Key benefits:

- **Professional Quality**: Production-ready components with comprehensive testing
- **Accessibility**: OKLCH colors ensure consistent, accessible visualizations
- **Performance**: Optimized for real-time data and large datasets
- **Flexibility**: Extensible architecture supports custom visualizations
- **Integration**: Seamless integration with Reynard's theming system

_Build exceptional data visualizations that outfox complexity and deliver insights with style._ 🦊
