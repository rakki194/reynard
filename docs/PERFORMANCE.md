# 🚀 Reynard Performance Guide

Optimization strategies, performance monitoring, and best practices for building high-performance Reynard applications.

## Performance Overview

Reynard is optimized for performance with:

- **Bundle Splitting** - Automatic code splitting and lazy loading
- **Tree Shaking** - Import only what you need
- **Optimized Builds** - Production builds with minification and compression
- **Virtual Scrolling** - Efficient rendering of large lists
- **Memory Management** - Smart cleanup and garbage collection

## Bundle Sizes

### Core Packages

| Package | Size | Gzipped | Description |
|---------|------|---------|-------------|
| `reynard-core` | ~16 kB | 3.7 kB | Core utilities and modules |
| `reynard-components` | ~46 kB | 11.8 kB | UI component library |
| `reynard-themes` | ~22 kB | 6.1 kB | Theming system |
| `reynard-i18n` | ~22 kB | 6.1 kB | Internationalization |

### Specialized Packages

| Package | Size | Gzipped | Description |
|---------|------|---------|-------------|
| `reynard-chat` | ~110 kB | 25.1 kB | Chat messaging system |
| `reynard-rag` | ~21 kB | 6.7 kB | RAG system components |
| `reynard-auth` | ~46 kB | 11.8 kB | Authentication system |
| `reynard-charts` | ~28 kB | 8.4 kB | Data visualization |
| `reynard-gallery` | ~87 kB | 21.3 kB | File management |
| `reynard-settings` | ~35 kB | 8.8 kB | Settings management |
| `reynard-monaco` | ~232 kB | 62.0 kB | Code editor |
| `reynard-annotating` | ~35 kB | 8.8 kB | Caption generation |
| `reynard-caption` | ~22 kB | 7.0 kB | Caption editing UI |
| `reynard-algorithms` | ~12 kB | 3.6 kB | Algorithm primitives |
| `reynard-file-processing` | ~28 kB | 8.8 kB | File processing |
| `reynard-testing` | ~45 kB | 12.1 kB | Testing utilities |

### Development and Tools

| Package | Size | Gzipped | Description |
|---------|------|---------|-------------|
| `reynard-error-boundaries` | ~16 kB | 3.6 kB | Error boundary system |
| `reynard-3d` | ~60 kB | 19.6 kB | 3D graphics |
| `reynard-ui` | ~38 kB | 12.2 kB | Layout components |
| `reynard-composables` | ~16 kB | 3.6 kB | Reusable logic |
| `reynard-connection` | ~27 kB | 5.6 kB | Networking |
| `reynard-features` | ~11 kB | 3.6 kB | Feature system |
| `reynard-model-management` | ~21 kB | 4.7 kB | Model management |
| `reynard-service-manager` | ~22 kB | 7.1 kB | Service management |
| `reynard-tools` | ~21 kB | 5.6 kB | Development tools |
| `reynard-boundingbox` | ~28 kB | 8.4 kB | Bounding box components |
| `reynard-color-media` | ~26 kB | 7.0 kB | Color utilities |
| `reynard-games` | ~34 kB | 12.2 kB | Game utilities |

### Documentation and Applications

| Package | Size | Gzipped | Description |
|---------|------|---------|-------------|
| `reynard-docs-core` | ~22 kB | 6.1 kB | Documentation engine |
| `reynard-docs-components` | ~38 kB | 12.2 kB | Documentation UI |
| `reynard-docs-generator` | ~340 kB | 72.6 kB | Documentation generator |
| `reynard-docs-site` | ~192 kB | 57.8 kB | Documentation site |
| `reynard-basic-app` | ~8 kB | 2.1 kB | Basic todo app |
| `reynard-clock-app` | ~12 kB | 3.2 kB | Clock application |
| `reynard-test-app` | ~1.0.0 | 1.0.0 | Test application |

## Optimization Strategies

### Bundle Optimization

#### Code Splitting

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'solid-router': ['@solidjs/router'],
          'reynard-core': ['reynard-core'],
          'reynard-components': ['reynard-components'],
          'reynard-chat': ['reynard-chat'],
          'reynard-charts': ['reynard-charts'],
          'chart-js': ['chart.js'],
        }
      }
    }
  }
});
```

#### Dynamic Imports

```tsx
// Lazy load heavy components
import { lazy } from "solid-js";

const HeavyComponent = lazy(() => import("./HeavyComponent"));
const MonacoEditor = lazy(() => import("reynard-monaco"));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

#### Tree Shaking

```tsx
// Import only what you need
import { Button, Card } from "reynard-components";
import { useNotifications } from "reynard-core";

// Instead of importing everything
// import * from "reynard-components"; // ❌ Don't do this
```

### Component Optimization

#### Memoization

```tsx
import { createMemo } from "solid-js";

function ExpensiveComponent({ data }) {
  // Memoize expensive calculations
  const processedData = createMemo(() => {
    return data().map(item => ({
      ...item,
      processed: expensiveOperation(item)
    }));
  });

  return (
    <div>
      {processedData().map(item => (
        <ItemComponent key={item.id} item={item} />
      ))}
    </div>
  );
}
```

#### Conditional Rendering

```tsx
import { Show } from "solid-js";

function ConditionalComponent({ showExpensive }) {
  return (
    <div>
      <Show when={showExpensive()}>
        <ExpensiveComponent />
      </Show>
    </div>
  );
}
```

#### Virtual Scrolling

```tsx
import { For } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";

function VirtualList({ items }) {
  const virtualizer = createVirtualizer({
    count: items().length,
    getScrollElement: () => parentRef,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style="height: 400px; overflow: auto;">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
        <For each={virtualizer.getVirtualItems()}>
          {(virtualRow) => (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {items()[virtualRow.index]}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
```

### State Management Optimization

#### Signal Optimization

```tsx
import { createSignal, createEffect, batch } from "solid-js";

function OptimizedComponent() {
  const [count, setCount] = createSignal(0);
  const [name, setName] = createSignal("");

  // Batch multiple updates
  const handleUpdate = () => {
    batch(() => {
      setCount(count() + 1);
      setName("Updated");
    });
  };

  // Optimize effects
  createEffect(() => {
    // Only runs when count changes
    console.log("Count changed:", count());
  });

  return (
    <div>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
```

#### Store Optimization

```tsx
import { createStore } from "solid-js/store";

function StoreComponent() {
  const [store, setStore] = createStore({
    items: [],
    filter: "",
    sortBy: "name"
  });

  // Optimize store updates
  const addItem = (item) => {
    setStore("items", items => [...items, item]);
  };

  const updateFilter = (filter) => {
    setStore("filter", filter);
  };

  // Memoize derived state
  const filteredItems = createMemo(() => {
    return store.items.filter(item => 
      item.name.includes(store.filter)
    );
  });

  return (
    <div>
      {filteredItems().map(item => (
        <ItemComponent key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### Image and Media Optimization

#### Lazy Loading

```tsx
import { createSignal, onMount } from "solid-js";

function LazyImage({ src, alt }) {
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [isInView, setIsInView] = createSignal(false);
  let imgRef;

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef);
  });

  return (
    <div ref={imgRef}>
      <Show when={isInView()}>
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded() ? 1 : 0 }}
        />
      </Show>
    </div>
  );
}
```

#### Image Optimization

```tsx
import { useFileProcessing } from "reynard-file-processing";

function OptimizedImageUpload() {
  const { generateThumbnail } = useFileProcessing();

  const handleImageUpload = async (file: File) => {
    // Generate optimized thumbnails
    const thumbnail = await generateThumbnail(file, {
      width: 200,
      height: 200,
      quality: 0.8,
      format: "webp"
    });

    // Use WebP for better compression
    return thumbnail;
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleImageUpload(e.target.files[0])}
    />
  );
}
```

### Network Optimization

#### Request Debouncing

```tsx
import { useDebounce } from "reynard-core";

function SearchComponent() {
  const [searchTerm, setSearchTerm] = createSignal("");
  const [results, setResults] = createSignal([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  createEffect(async () => {
    if (debouncedSearchTerm()) {
      const response = await fetch(`/api/search?q=${debouncedSearchTerm()}`);
      const data = await response.json();
      setResults(data);
    }
  });

  return (
    <div>
      <input
        value={searchTerm()}
        onInput={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <div>
        {results().map(result => (
          <div key={result.id}>{result.title}</div>
        ))}
      </div>
    </div>
  );
}
```

#### Request Caching

```tsx
import { createSignal, createMemo } from "solid-js";

function CachedDataComponent() {
  const [cache, setCache] = createSignal(new Map());
  const [loading, setLoading] = createSignal(false);

  const fetchData = async (key: string) => {
    if (cache().has(key)) {
      return cache().get(key);
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/data/${key}`);
      const data = await response.json();
      setCache(prev => new Map(prev).set(key, data));
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading() && <div>Loading...</div>}
      {/* Component content */}
    </div>
  );
}
```

## Performance Monitoring

### Built-in Performance Tools

```tsx
import { PerformanceTimer } from "reynard-algorithms";

// Performance timing
const timer = new PerformanceTimer();
timer.start();

// Perform operation
await performOperation();

const duration = timer.stop();
console.log(`Operation took ${duration}ms`);
```

### Custom Performance Monitoring

```tsx
import { createSignal, createEffect } from "solid-js";

function usePerformanceMonitoring() {
  const [metrics, setMetrics] = createSignal({});

  const measure = async (name: string, operation: () => Promise<any>) => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      [name]: {
        duration: end - start,
        timestamp: Date.now()
      }
    }));
    
    return result;
  };

  const getMetrics = () => metrics();

  return { measure, getMetrics };
}
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Check bundle composition
npx vite-bundle-analyzer dist

# Monitor bundle size over time
npm run build:size
```

## Memory Management

### Cleanup Patterns

```tsx
import { onCleanup, onMount } from "solid-js";

function ComponentWithCleanup() {
  let intervalId;
  let observer;

  onMount(() => {
    // Set up intervals
    intervalId = setInterval(() => {
      console.log("Interval tick");
    }, 1000);

    // Set up observers
    observer = new IntersectionObserver(callback);
  });

  onCleanup(() => {
    // Clean up intervals
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Clean up observers
    if (observer) {
      observer.disconnect();
    }
  });

  return <div>Component with cleanup</div>;
}
```

### Memory Leak Prevention

```tsx
import { createSignal, createEffect, onCleanup } from "solid-js";

function MemorySafeComponent() {
  const [data, setData] = createSignal([]);
  const [isActive, setIsActive] = createSignal(true);

  // Prevent memory leaks with cleanup
  createEffect(() => {
    if (!isActive()) return;

    const controller = new AbortController();
    
    fetch("/api/data", { signal: controller.signal })
      .then(response => response.json())
      .then(data => {
        if (isActive()) {
          setData(data);
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error("Fetch error:", error);
        }
      });

    onCleanup(() => {
      controller.abort();
    });
  });

  return (
    <div>
      <button onClick={() => setIsActive(false)}>
        Stop Loading
      </button>
      {data().map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## Testing Performance

### Performance Testing

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "reynard-testing";

describe("Performance Tests", () => {
  it("should render large lists efficiently", async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }));

    const start = performance.now();
    render(() => <LargeList items={largeDataset} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Should render in under 100ms
  });

  it("should handle rapid state updates", async () => {
    const { user } = render(() => <CounterComponent />);
    
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      await user.click(screen.getByText("Increment"));
    }
    const end = performance.now();

    expect(end - start).toBeLessThan(1000); // Should handle 100 clicks in under 1s
  });
});
```

### Load Testing

```bash
# Run performance tests
npm run test:performance

# Load test with Artillery
npx artillery run load-test.yml

# Monitor performance metrics
npm run monitor:performance
```

## Best Practices

### General Performance Tips

1. **Use SolidJS Signals Efficiently**
   - Prefer `createSignal` over `createStore` for simple state
   - Use `batch` for multiple state updates
   - Memoize expensive calculations with `createMemo`

2. **Optimize Component Rendering**
   - Use `Show` for conditional rendering
   - Implement virtual scrolling for large lists
   - Lazy load heavy components

3. **Manage Bundle Size**
   - Import only what you need
   - Use dynamic imports for code splitting
   - Monitor bundle size regularly

4. **Optimize Network Requests**
   - Debounce search inputs
   - Cache API responses
   - Use request deduplication

5. **Handle Memory Efficiently**
   - Clean up intervals and observers
   - Use `onCleanup` for resource management
   - Prevent memory leaks with proper cleanup

### Package-Specific Optimizations

#### Chat Performance

```tsx
// Optimize chat rendering
<ChatContainer
  config={{
    maxMessages: 100, // Limit message history
    virtualScrolling: true, // Enable virtual scrolling
    lazyLoadImages: true, // Lazy load images
    debounceTyping: 300 // Debounce typing indicators
  }}
/>
```

#### Gallery Performance

```tsx
// Optimize gallery rendering
<Gallery
  config={{
    virtualScrolling: true,
    thumbnailSize: 200, // Optimize thumbnail size
    lazyLoadImages: true,
    maxVisibleItems: 50 // Limit visible items
  }}
/>
```

#### Charts Performance

```tsx
// Optimize chart rendering
<LineChart
  config={{
    animation: false, // Disable animations for large datasets
    responsive: true,
    maintainAspectRatio: false,
    maxDataPoints: 1000 // Limit data points
  }}
/>
```

## Monitoring and Profiling

### Performance Monitoring Setup

```tsx
// Performance monitoring hook
function usePerformanceMonitoring() {
  const [metrics, setMetrics] = createSignal({});

  const measure = (name: string, fn: () => any) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      [name]: end - start
    }));
    
    return result;
  };

  const measureAsync = async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      [name]: end - start
    }));
    
    return result;
  };

  return { measure, measureAsync, metrics };
}
```

### Real User Monitoring

```tsx
// RUM (Real User Monitoring)
function setupRUM() {
  // Monitor Core Web Vitals
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Monitor First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingStart - entry.startTime);
    }
  }).observe({ entryTypes: ['first-input'] });
}
```

## Next Steps

- **[Package Documentation](./PACKAGES.md)** - Detailed package documentation
- **[Examples and Templates](./EXAMPLES.md)** - Performance-optimized examples
- **[API Reference](./API.md)** - Performance-related APIs

---

*Build high-performance applications with Reynard!* 🦊
