# Passive Event Listeners

Passive event listeners are a crucial performance optimization feature in
yipyap, particularly important for smooth scrolling and touch interactions. This
document outlines our implementation approach and best practices.

## Table of Contents

- [Passive Event Listeners](#passive-event-listeners)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Implementation Guidelines](#implementation-guidelines)
  - [When to Use Passive Listeners](#when-to-use-passive-listeners)
  - [Performance Impact](#performance-impact)
  - [Browser Support](#browser-support)
  - [Implementation Examples](#implementation-examples)
    - [Gallery Scroll Handling](#gallery-scroll-handling)
    - [Touch Interaction Handling](#touch-interaction-handling)
    - [Crawl Streaming Events](#crawl-streaming-events)
    - [Non-Passive Example (When preventDefault is needed)](#non-passive-example-when-preventdefault-is-needed)
  - [Best Practices](#best-practices)
  - [Common Pitfalls](#common-pitfalls)
  - [Related Documentation](#related-documentation)

## Overview

---

Passive event listeners allow the browser to optimize event handling by
indicating that a listener will not call `preventDefault()`. This enables the
browser to immediately begin scrolling operations without waiting for JavaScript
execution, significantly improving scroll performance.

## Implementation Guidelines

---

When adding event listeners in yipyap, follow these principles:

```typescript
// Preferred - explicitly declare passive for scroll/touch events
element.addEventListener("touchstart", handler, { passive: true });
element.addEventListener("wheel", handler, { passive: true });

// Only use non-passive when preventDefault is required
element.addEventListener("touchstart", handler, { passive: false });
```

## When to Use Passive Listeners

---

Use passive listeners for:

- Scroll events (`wheel`, `touchstart`, `touchmove`)
- Touch events when not preventing default behavior
- Performance-critical event handlers
- Analytics and tracking code

Do not use passive listeners when:

- You need to call `preventDefault()`
- Implementing custom scroll behavior
- Building drag-and-drop interfaces
- Handling gesture interactions

## Performance Impact

---

Passive event listeners can improve scroll performance by:

- Reducing main thread blocking
- Enabling immediate scroll initiation
- Decreasing input latency
- Improving frames per second during scroll

## Browser Support

---

Yipyap supports passive event listeners across all modern browsers:

- Chrome/Edge: 51+
- Firefox: 49+
- Safari: 10+
- iOS Safari: 10+
- Android Browser: 51+

## Implementation Examples

---

### Gallery Scroll Handling

```typescript
// Gallery scroll handling
const useGalleryScroll = () => {
  onMount(() => {
    const handler = (e: WheelEvent) => {
      // Scroll handling logic
    };

    // Use passive listener for better performance
    window.addEventListener("wheel", handler, { passive: true });

    onCleanup(() => {
      window.removeEventListener("wheel", handler);
    });
  });
};
```

### Touch Interaction Handling

```typescript
// Touch interaction handling
const useTouchInteraction = () => {
  onMount(() => {
    const touchHandler = (e: TouchEvent) => {
      // Touch handling logic that doesn't prevent default
    };

    element.addEventListener("touchstart", touchHandler, { passive: true });
    element.addEventListener("touchmove", touchHandler, { passive: true });

    onCleanup(() => {
      element.removeEventListener("touchstart", touchHandler);
      element.removeEventListener("touchmove", touchHandler);
    });
  });
};
```

### Crawl Streaming Events

```typescript
// From useCrawl.ts - SSE event listeners with passive options
es.addEventListener(
  "submitted",
  (ev) => {
    try {
      handlers.onSubmitted?.(JSON.parse((ev as MessageEvent).data));
    } catch {}
  },
  { passive: true } as any,
);
es.addEventListener(
  "status",
  (ev) => {
    try {
      handlers.onStatus?.(JSON.parse((ev as MessageEvent).data));
    } catch {}
  },
  { passive: true } as any,
);
es.addEventListener(
  "done",
  (ev) => {
    try {
      handlers.onDone?.(JSON.parse((ev as MessageEvent).data));
    } catch {}
    stop();
  },
  { passive: true } as any,
);
```

### Non-Passive Example (When preventDefault is needed)

```typescript
// From useGalleryScroll.tsx - wheel navigation that prevents default
wheelHandler = (e: WheelEvent) => {
  e.preventDefault();
  // ... image navigation logic ...
};

// Use passive listener for performance where possible; here we require preventDefault
galleryElement.addEventListener("wheel", wheelHandler, { passive: false });
```

## Best Practices

---

1. Always explicitly declare the `passive` option rather than relying on
   defaults
2. Use TypeScript's `EventListenerOptions` type for proper type checking
3. Consider performance implications when setting `passive: false`
4. Test scrolling performance with and without passive listeners
5. Monitor console for warnings about preventDefault calls in passive listeners
6. Clean up event listeners in `onCleanup` to prevent memory leaks
7. Store handler references for proper removal

## Common Pitfalls

---

- Attempting to call `preventDefault()` in a passive listener (will be ignored)
- Forgetting to remove event listeners during cleanup
- Using non-passive listeners unnecessarily
- Not testing on touch devices
- Storing event listeners without proper cleanup mechanisms

## Related Documentation

---

- [Performance Documentation](performance.md)
- [Event Handling Guide](event-handling.md)
- [Touch Interaction Guide](touch-interactions.md)
- [Composables Documentation](composables.md)
