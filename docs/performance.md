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

_All bundle sizes are measured from production builds and include gzipped compression estimates._

### Core Packages

| Package              | Size | Gzipped  | Description                |
| -------------------- | ---- | -------- | -------------------------- |
| `reynard-core`       | 28K  | 6.9 kB   | Core utilities and modules |
| `reynard-components` | 760K | 190.7 kB | UI component library       |
| `reynard-themes`     | 40K  | 9.9 kB   | Theming system             |
| `reynard-i18n`       | 4.0K | 1.4 kB   | Internationalization       |

### Specialized Packages

| Package                   | Size | Gzipped | Description           |
| ------------------------- | ---- | ------- | --------------------- |
| `reynard-chat`            | 128K | 28.5 kB | Chat messaging system |
| `reynard-charts`          | 60K  | 11.8 kB | Data visualization    |
| `reynard-annotating`      | 24K  | 5.1 kB  | Caption generation    |
| `reynard-caption`         | 28K  | 8.2 kB  | Caption editing UI    |
| `reynard-algorithms`      | 88K  | 16.8 kB | Algorithm primitives  |
| `reynard-file-processing` | 44K  | 8.6 kB  | File processing       |
| `reynard-testing`         | 4.0K | 0.1 kB  | Testing utilities     |
| `reynard-3d`              | 92K  | 23.7 kB | 3D graphics           |
| `reynard-colors`          | 16K  | 4.0 kB  | Color utilities       |
| `reynard-service-manager` | 20K  | 4.3 kB  | Service management    |

### Development and Tools

| Package                | Size | Gzipped | Description            |
| ---------------------- | ---- | ------- | ---------------------- |
| `reynard-composables`  | 4.0K | 0.2 kB  | Reusable logic         |
| `reynard-features`     | 4.0K | 0.3 kB  | Feature system         |
| `reynard-fluent-icons` | 176K | 46.5 kB | Fluent UI icons        |
| `reynard-ai-shared`    | 4.0K | 0.5 kB  | AI/ML shared utilities |

### Documentation and Applications

| Package                   | Size | Gzipped  | Description             |
| ------------------------- | ---- | -------- | ----------------------- |
| `reynard-docs-core`       | 1.8M | 449.6 kB | Documentation engine    |
| `reynard-docs-components` | 216K | 54.0 kB  | Documentation UI        |
| `reynard-docs-generator`  | 4.0K | 0.3 kB   | Documentation generator |

### Package Status

_Note: Some packages (`reynard-auth`, `reynard-gallery`, `reynard-monaco`, `reynard-rag`, `reynard-settings`,
`reynard-ui`, `reynard-tools`, `reynard-games`, `reynard-error-boundaries`, `reynard-connection`,
`reynard-model-management`, `reynard-gallery-ai`, `reynard-boundingbox`,
`reynard-floating-panel`) are currently under development and
may have build issues. Bundle sizes will be updated as these packages are completed._

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
          "solid-router": ["@solidjs/router"],
          "reynard-core": ["reynard-core"],
          "reynard-components": ["reynard-components"],
          "reynard-chat": ["reynard-chat"],
          "reynard-charts": ["reynard-charts"],
          "chart-js": ["chart.js"],
        },
      },
    },
  },
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
    return data().map((item) => ({
      ...item,
      processed: expensiveOperation(item),
    }));
  });

  return (
    <div>
      {processedData().map((item) => (
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
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
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
    sortBy: "name",
  });

  // Optimize store updates
  const addItem = (item) => {
    setStore("items", (items) => [...items, item]);
  };

  const updateFilter = (filter) => {
    setStore("filter", filter);
  };

  // Memoize derived state
  const filteredItems = createMemo(() => {
    return store.items.filter((item) => item.name.includes(store.filter));
  });

  return (
    <div>
      {filteredItems().map((item) => (
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
      { threshold: 0.1 },
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
      format: "webp",
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
        {results().map((result) => (
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
      setCache((prev) => new Map(prev).set(key, data));
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

    setMetrics((prev) => ({
      ...prev,
      [name]: {
        duration: end - start,
        timestamp: Date.now(),
      },
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
pnpm run build -- --analyze

# Check bundle composition
pnpx vite-bundle-analyzer dist

# Monitor bundle size over time
pnpm run build:size
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
      .then((response) => response.json())
      .then((data) => {
        if (isActive()) {
          setData(data);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Fetch error:", error);
        }
      });

    onCleanup(() => {
      controller.abort();
    });
  });

  return (
    <div>
      <button onClick={() => setIsActive(false)}>Stop Loading</button>
      {data().map((item) => (
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
      name: `Item ${i}`,
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
pnpm run test:performance

# Load test with Artillery
pnpx artillery run load-test.yml

# Monitor performance metrics
pnpm run monitor:performance
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
    debounceTyping: 300, // Debounce typing indicators
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
    maxVisibleItems: 50, // Limit visible items
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
    maxDataPoints: 1000, // Limit data points
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

    setMetrics((prev) => ({
      ...prev,
      [name]: end - start,
    }));

    return result;
  };

  const measureAsync = async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    setMetrics((prev) => ({
      ...prev,
      [name]: end - start,
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
      if (entry.entryType === "largest-contentful-paint") {
        console.log("LCP:", entry.startTime);
      }
    }
  }).observe({ entryTypes: ["largest-contentful-paint"] });

  // Monitor First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log("FID:", entry.processingStart - entry.startTime);
    }
  }).observe({ entryTypes: ["first-input"] });
}
```

## Next Steps

- **[Package Documentation](./packages.md)** - Detailed package documentation
- **[Examples and Templates](./examples.md)** - Performance-optimized examples
- **[API Reference](./api.md)** - Performance-related APIs

---

_Build high-performance applications with Reynard!_ 🦊
