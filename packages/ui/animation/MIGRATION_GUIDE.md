# 🦊 Animation System Migration Guide

_Complete guide for migrating to the unified Reynard animation system_

## Overview

The Reynard animation system provides a unified, optional, and easily disableable animation framework that consolidates all animation implementations across the ecosystem. This guide covers the migration strategy, fallback systems, performance modes, and accessibility features.

## Migration Strategy

### Optional Dependency Approach

The animation system is designed as an **optional dependency** that gracefully degrades when not available:

```typescript
// Smart import with fallback
import { useAnimationState } from "reynard-animation";

// Fallback when package unavailable
const animationState = useAnimationState({
  fallback: "css", // CSS-based fallback
  immediate: true, // Immediate completion for disabled state
});
```

### Package Configuration

Update your `package.json` to include the animation package as an optional peer dependency:

```json
{
  "peerDependencies": {
    "reynard-animation": "workspace:*"
  },
  "peerDependenciesMeta": {
    "reynard-animation": {
      "optional": true
    }
  }
}
```

### Import Strategy

Use the smart import system for graceful degradation:

```typescript
// Dynamic import with fallback
const loadAnimation = async () => {
  try {
    const { useAnimationState } = await import("reynard-animation");
    return useAnimationState;
  } catch {
    // Fallback to CSS animations
    return useCSSAnimationFallback;
  }
};
```

## Fallback System

### CSS-Based Fallbacks

When the animation package is unavailable, the system automatically falls back to CSS-based animations:

```css
/* Automatic CSS fallback */
.animation-fallback {
  transition: all 0.3s ease-in-out;
}

.animation-fallback:hover {
  transform: scale(1.05);
  opacity: 0.8;
}
```

### Immediate Completion

For disabled animations, the system provides immediate completion:

```typescript
// Immediate completion for disabled state
const animationState = useAnimationState({
  duration: 300,
  immediate: true, // Completes immediately when disabled
  fallback: "css",
});
```

### Performance-Optimized Fallbacks

The system includes performance-optimized fallback implementations:

```typescript
// Performance-optimized fallback
const performanceFallback = {
  duration: 150, // Reduced duration
  easing: "ease-out", // Optimized easing
  willChange: "transform", // GPU acceleration
  backfaceVisibility: "hidden", // Performance optimization
};
```

## Performance Modes

### Performance Mode Configuration

Enable performance mode for optimized animations:

```typescript
// Global performance mode
useGlobalAnimationContext({
  performanceMode: true,
  reducedMotion: false,
  accessibilityMode: false,
});

// Component-level performance mode
const animationState = useAnimationState({
  performanceMode: true,
  duration: 150, // Reduced duration
  complexity: "low", // Reduced complexity
});
```

### Performance Optimizations

Performance mode includes several optimizations:

- **Reduced Duration**: Animations complete faster
- **Simplified Easing**: Less complex easing functions
- **GPU Acceleration**: Automatic `will-change` properties
- **Memory Optimization**: Reduced memory allocation
- **Frame Rate Limiting**: Capped at 30fps for better performance

### Bundle Size Optimization

The system automatically optimizes bundle size:

```typescript
// Tree-shakable imports
import { useAnimationState } from "reynard-animation/core";
import { useStaggeredAnimation } from "reynard-animation/staggered";

// Conditional loading
if (typeof window !== "undefined" && window.innerWidth > 768) {
  // Load full animations for desktop
  await import("reynard-animation/full");
} else {
  // Load lightweight animations for mobile
  await import("reynard-animation/lightweight");
}
```

## Accessibility Features

### Prefers Reduced Motion

The system automatically respects `prefers-reduced-motion`:

```css
/* Automatic reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animation-element {
    animation: none;
    transition: none;
  }
}
```

### Accessibility Mode

Enable accessibility mode for enhanced accessibility:

```typescript
// Accessibility mode configuration
useGlobalAnimationContext({
  accessibilityMode: true,
  reducedMotion: true,
  highContrast: true,
  focusVisible: true,
});
```

### Focus Management

The system includes focus management for animations:

```typescript
// Focus-aware animations
const animationState = useAnimationState({
  focusVisible: true,
  focusDuration: 200,
  focusEasing: "ease-in-out",
});
```

### Screen Reader Support

Animations are designed to be screen reader friendly:

```typescript
// Screen reader announcements
const animationState = useAnimationState({
  announce: true,
  announceText: "Animation completed",
  announceDelay: 100,
});
```

## Migration Examples

### Basic Animation Migration

**Before:**

```typescript
// Old animation implementation
const [isVisible, setIsVisible] = createSignal(false);

const toggleVisibility = () => {
  setIsVisible(!isVisible());
};
```

**After:**

```typescript
// New animation system
import { useAnimationState } from "reynard-animation";

const animationState = useAnimationState({
  initial: false,
  duration: 300,
  easing: "ease-in-out",
  fallback: "css",
});

const toggleVisibility = () => {
  animationState.toggle();
};
```

### Staggered Animation Migration

**Before:**

```typescript
// Old staggered implementation
const items = Array.from({ length: 5 }, (_, i) => i);

const animateItems = () => {
  items.forEach((item, index) => {
    setTimeout(() => {
      // Animate item
    }, index * 100);
  });
};
```

**After:**

```typescript
// New staggered system
import { useStaggeredAnimation } from "reynard-animation";

const staggeredAnimation = useStaggeredAnimation({
  items: Array.from({ length: 5 }, (_, i) => i),
  stagger: 100,
  duration: 300,
  fallback: "css",
});

const animateItems = () => {
  staggeredAnimation.start();
};
```

### 3D Animation Migration

**Before:**

```typescript
// Old 3D animation
const [rotation, setRotation] = createSignal(0);

const rotate = () => {
  setRotation(rotation() + 90);
};
```

**After:**

```typescript
// New 3D animation system
import { useThreeJSAnimations } from "reynard-animation";

const threeJSAnimation = useThreeJSAnimations({
  rotation: { x: 0, y: 0, z: 0 },
  duration: 500,
  easing: "ease-in-out",
  fallback: "css",
});

const rotate = () => {
  threeJSAnimation.rotate({ y: 90 });
};
```

## Testing Migration

### Test Configuration

Update your test configuration to handle optional dependencies:

```typescript
// Test configuration
import { vi } from "vitest";

// Mock animation package
vi.mock("reynard-animation", () => ({
  useAnimationState: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    toggle: vi.fn(),
  })),
}));
```

### Fallback Testing

Test fallback behavior:

```typescript
// Test fallback behavior
describe("Animation Fallbacks", () => {
  it("should use CSS fallback when package unavailable", () => {
    // Test CSS fallback
    expect(document.querySelector(".animation-fallback")).toBeTruthy();
  });

  it("should complete immediately when disabled", () => {
    // Test immediate completion
    const startTime = performance.now();
    animationState.start();
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(10);
  });
});
```

## Best Practices

### Performance

- Use performance mode for low-end devices
- Implement lazy loading for non-essential animations
- Monitor bundle size impact
- Use CSS animations when possible

### Accessibility

- Always respect `prefers-reduced-motion`
- Provide alternative feedback for animations
- Ensure focus management
- Test with screen readers

### Migration

- Migrate incrementally
- Test fallback behavior
- Monitor performance impact
- Update documentation

## Troubleshooting

### Common Issues

#### Package Not Found

```typescript
// Handle missing package gracefully
try {
  const { useAnimationState } = await import("reynard-animation");
  return useAnimationState;
} catch (error) {
  console.warn("Animation package not available, using fallback");
  return useCSSAnimationFallback;
}
```

#### Performance Issues

```typescript
// Enable performance mode
useGlobalAnimationContext({
  performanceMode: true,
  reducedMotion: true,
});
```

#### Accessibility Issues

```typescript
// Enable accessibility mode
useGlobalAnimationContext({
  accessibilityMode: true,
  reducedMotion: true,
  highContrast: true,
});
```

## Support

For migration support:

1. Check the troubleshooting section
2. Review the API documentation
3. Test with the provided examples
4. Check GitHub issues for known problems

---

_🦊 The unified animation system provides a robust, accessible, and performant foundation for all animations in the Reynard ecosystem._
