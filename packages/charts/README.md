# @reynard/charts

Advanced data visualization components for SolidJS applications, built on Chart.js.

## 🚀 Features

- **📊 Multiple Chart Types**: Line, Bar, Pie/Doughnut, and Time Series charts
- **⏱️ Real-time Updates**: Live data streaming with automatic management
- **🎨 Theme Integration**: Seamlessly works with Reynard's theming system
- **📱 Responsive Design**: Charts adapt to container size and mobile devices
- **♿ Accessibility**: Screen reader friendly with proper ARIA labels
- **⚡ Performance**: Optimized rendering with data aggregation and limits
- **🎯 TypeScript**: Complete type safety with excellent IntelliSense
- **🛠️ Configurable**: Extensive customization options for every chart type

## 📦 Installation

```bash
npm install @reynard/charts @reynard/core chart.js solid-chartjs solid-js
```

## 🎯 Quick Start

```tsx
import { LineChart, BarChart, PieChart, TimeSeriesChart } from '@reynard/charts';

function Dashboard() {
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sales',
      data: [12, 19, 3, 5, 2]
    }]
  };

  const performanceData = [
    { timestamp: Date.now() - 300000, value: 45, label: '5 min ago' },
    { timestamp: Date.now() - 240000, value: 52, label: '4 min ago' },
    { timestamp: Date.now() - 180000, value: 38, label: '3 min ago' },
    { timestamp: Date.now() - 120000, value: 67, label: '2 min ago' },
    { timestamp: Date.now() - 60000, value: 74, label: '1 min ago' },
    { timestamp: Date.now(), value: 82, label: 'Now' }
  ];

  return (
    <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '2rem' }}>
      <LineChart
        title="Sales Trend"
        labels={salesData.labels}
        datasets={salesData.datasets}
        yAxis={{ label: 'Sales ($)' }}
        responsive
      />
      
      <TimeSeriesChart
        title="Real-time Performance"
        data={performanceData}
        autoScroll
        maxDataPoints={50}
        valueFormatter={(value) => `${value}%`}
      />
    </div>
  );
}
```

## 📚 Components

### LineChart

Perfect for showing trends over time or continuous data.

```tsx
<LineChart
  title="Website Traffic"
  labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
  datasets={[
    {
      label: 'Visitors',
      data: [1200, 1900, 3000, 5000, 2300],
      tension: 0.4,
      fill: false
    },
    {
      label: 'Page Views', 
      data: [2400, 3800, 6000, 10000, 4600],
      tension: 0.4,
      fill: true
    }
  ]}
  xAxis={{ label: 'Day of Week' }}
  yAxis={{ label: 'Count' }}
  showGrid
  responsive
/>
```

**Features:**

- Multiple datasets support
- Smooth line interpolation
- Fill area under curves
- Time scale support
- Custom point styling

### BarChart

Ideal for comparing categories or showing discrete data.

```tsx
<BarChart
  title="Revenue by Quarter"
  labels={['Q1', 'Q2', 'Q3', 'Q4']}
  datasets={[
    {
      label: '2023',
      data: [45000, 52000, 48000, 61000],
    },
    {
      label: '2024',
      data: [51000, 58000, 55000, 67000],
    }
  ]}
  horizontal={false}
  stacked={false}
  yAxis={{ 
    label: 'Revenue ($)',
    ticks: {
      callback: (value) => `$${value.toLocaleString()}`
    }
  }}
/>
```

**Features:**

- Horizontal and vertical orientations
- Stacked bar support
- Custom bar colors
- Grouped datasets
- Value formatting

### PieChart

Great for showing proportions and percentages.

```tsx
<PieChart
  title="Market Share"
  labels={['Chrome', 'Firefox', 'Safari', 'Edge', 'Other']}
  data={[65, 15, 10, 7, 3]}
  variant="doughnut"
  cutout={0.6}
  showValues
  colors={['#4285f4', '#ff9500', '#00c851', '#0078d4', '#6c757d']}
/>
```

**Features:**

- Pie and doughnut variants
- Custom cutout percentage
- Automatic percentage calculation
- Legend with values
- Custom color palettes

### TimeSeriesChart

Advanced real-time chart with automatic data management.

```tsx
<TimeSeriesChart
  title="System Metrics"
  data={realTimeMetrics}
  maxDataPoints={100}
  timeRange={5 * 60 * 1000} // 5 minutes
  updateInterval={1000}
  autoScroll
  aggregationInterval={10000} // 10 seconds
  pointColors={(value) => value > 80 ? '#dc3545' : '#28a745'}
  valueFormatter={(value) => `${value.toFixed(1)}%`}
  onDataUpdate={(data) => console.log('Updated:', data.length, 'points')}
/>
```

**Features:**

- Real-time data streaming
- Automatic data point limiting
- Time-based aggregation
- Custom point coloring
- Performance optimization
- Data update callbacks

## 🎨 Theming

Charts automatically adapt to your application's theme using CSS custom properties:

```css
:root {
  --text-primary: #1a1a1a;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --accent: #3b82f6;
}

[data-theme="dark"] {
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
  --accent: #60a5fa;
}
```

Charts will automatically use these colors for:

- Text and labels
- Grid lines
- Default chart colors
- Tooltips and legends

## 📊 Data Formats

### Basic Dataset Format

```typescript
const dataset = {
  label: 'Sales',
  data: [10, 20, 30, 40, 50],
  backgroundColor: '#3b82f6',
  borderColor: '#1d4ed8',
  borderWidth: 2
};
```

### Time Series Format

```typescript
const timeSeriesData = [
  {
    timestamp: 1640995200000, // Unix timestamp
    value: 42.5,
    label: '12:00 PM' // Optional display label
  },
  // ... more data points
];
```

### Data Point Format (for scatter charts)

```typescript
const dataPoints = [
  { x: 10, y: 20 },
  { x: 15, y: 25 },
  { x: 20, y: 30 }
];
```

## ⚡ Performance

### Data Management

```tsx
// Limit data points for performance
<TimeSeriesChart
  data={largeDataset}
  maxDataPoints={100}
  aggregationInterval={60000} // 1 minute
/>

// Use time ranges for large datasets
<TimeSeriesChart
  data={historicalData}
  timeRange={24 * 60 * 60 * 1000} // 24 hours
/>
```

### Optimized Updates

```tsx
// Debounced updates for real-time data
const [chartData, setChartData] = createSignal([]);

const updateData = debounce((newData) => {
  setChartData(newData);
}, 100);
```

## 🛠️ Advanced Configuration

### Custom Tooltips

```tsx
<LineChart
  data={data}
  tooltip={{
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    titleColor: '#fff',
    bodyColor: '#fff',
    callbacks: {
      label: (context) => `Value: ${context.parsed.y.toFixed(2)}`
    }
  }}
/>
```

### Custom Scales

```tsx
<BarChart
  data={data}
  yAxis={{
    min: 0,
    max: 100,
    ticks: {
      stepSize: 10,
      callback: (value) => `${value}%`
    }
  }}
/>
```

### Animation Control

```tsx
<PieChart
  data={data}
  animation={{
    duration: 1000,
    easing: 'easeOutBounce'
  }}
/>
```

## 📦 Bundle Size

- **Core package**: ~27 kB (5.4 kB gzipped)
- **Peer dependency**: Chart.js (~200 kB, but likely already in your app)
- **Tree-shakable**: Import only the charts you need
- **Optimized**: Efficient Chart.js registration and cleanup

## 🤝 Integration Examples

### With Data Fetching

```tsx
function DashboardChart() {
  const [data, setData] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const response = await fetch('/api/metrics');
      const metrics = await response.json();
      setData(metrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <LineChart
      title="API Response Times"
      timeSeriesData={data()}
      loading={loading()}
      emptyMessage="No metrics available"
    />
  );
}
```

### With Real-time Updates

```tsx
function RealtimeChart() {
  const [metrics, setMetrics] = createSignal([]);

  onMount(() => {
    const ws = new WebSocket('ws://localhost:8080/metrics');
    
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setMetrics(prev => [...prev, newData]);
    };

    onCleanup(() => ws.close());
  });

  return (
    <TimeSeriesChart
      title="Live System Metrics"
      data={metrics()}
      autoScroll
      updateInterval={500}
      maxDataPoints={200}
    />
  );
}
```

### Responsive Grid Layout

```tsx
function ChartsGrid() {
  return (
    <div style={{
      display: 'grid',
      'grid-template-columns': 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1rem'
    }}>
      <LineChart title="Traffic" data={trafficData} responsive />
      <BarChart title="Sales" data={salesData} responsive />
      <PieChart title="Distribution" data={distributionData} responsive />
      <TimeSeriesChart title="Performance" data={performanceData} responsive />
    </div>
  );
}
```

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

---

**Built with ❤️ for data-driven SolidJS applications** 📊🦊




