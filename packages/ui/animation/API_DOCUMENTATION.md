# 🦊 Animation System API Documentation

*Complete API reference for the Reynard animation system*

## Overview

The Reynard animation system provides a comprehensive set of APIs for creating, controlling, and managing animations across the ecosystem. All APIs are designed to be optional, accessible, and performant.

## Core APIs

### `useAnimationState`

The primary animation state management composable.

```typescript
interface AnimationStateOptions {
  initial?: boolean;
  duration?: number;
  easing?: string;
  fallback?: 'css' | 'immediate';
  performanceMode?: boolean;
  accessibilityMode?: boolean;
  announce?: boolean;
  announceText?: string;
}

interface AnimationState {
  isActive: Accessor<boolean>;
  isCompleted: Accessor<boolean>;
  progress: Accessor<number>;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  reset: () => void;
}

function useAnimationState(options: AnimationStateOptions): AnimationState
```

#### Parameters

- **`initial`** (boolean, optional): Initial animation state. Default: `false`
- **`duration`** (number, optional): Animation duration in milliseconds. Default: `300`
- **`easing`** (string, optional): CSS easing function. Default: `'ease-in-out'`
- **`fallback`** ('css' | 'immediate', optional): Fallback behavior. Default: `'css'`
- **`performanceMode`** (boolean, optional): Enable performance optimizations. Default: `false`
- **`accessibilityMode`** (boolean, optional): Enable accessibility features. Default: `false`
- **`announce`** (boolean, optional): Announce completion to screen readers. Default: `false`
- **`announceText`** (string, optional): Text to announce. Default: `'Animation completed'`

#### Returns

- **`isActive`**: Accessor for current animation state
- **`isCompleted`**: Accessor for completion state
- **`progress`**: Accessor for animation progress (0-1)
- **`start`**: Function to start animation
- **`stop`**: Function to stop animation
- **`toggle`**: Function to toggle animation state
- **`reset`**: Function to reset animation to initial state

#### Example

```typescript
const animationState = useAnimationState({
  initial: false,
  duration: 500,
  easing: 'ease-out',
  fallback: 'css',
  performanceMode: true,
  accessibilityMode: true,
  announce: true,
  announceText: 'Panel opened',
});

// Use in component
<button onClick={() => animationState.toggle()}>
  Toggle Animation
</button>
```

### `useStaggeredAnimation`

Manages staggered animations for multiple elements.

```typescript
interface StaggeredAnimationOptions {
  items: any[];
  stagger?: number;
  duration?: number;
  easing?: string;
  fallback?: 'css' | 'immediate';
  performanceMode?: boolean;
  accessibilityMode?: boolean;
}

interface StaggeredAnimation {
  isActive: Accessor<boolean>;
  isCompleted: Accessor<boolean>;
  progress: Accessor<number>;
  start: () => void;
  stop: () => void;
  reset: () => void;
  getItemState: (index: number) => AnimationState;
}

function useStaggeredAnimation(options: StaggeredAnimationOptions): StaggeredAnimation
```

#### Parameters

- **`items`** (any[]): Array of items to animate
- **`stagger`** (number, optional): Delay between items in milliseconds. Default: `100`
- **`duration`** (number, optional): Animation duration per item. Default: `300`
- **`easing`** (string, optional): CSS easing function. Default: `'ease-in-out'`
- **`fallback`** ('css' | 'immediate', optional): Fallback behavior. Default: `'css'`
- **`performanceMode`** (boolean, optional): Enable performance optimizations. Default: `false`
- **`accessibilityMode`** (boolean, optional): Enable accessibility features. Default: `false`

#### Returns

- **`isActive`**: Accessor for overall animation state
- **`isCompleted`**: Accessor for completion state
- **`progress`**: Accessor for overall progress (0-1)
- **`start`**: Function to start staggered animation
- **`stop`**: Function to stop animation
- **`reset`**: Function to reset all animations
- **`getItemState`**: Function to get individual item animation state

#### Example

```typescript
const items = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Item ${i}` }));

const staggeredAnimation = useStaggeredAnimation({
  items,
  stagger: 150,
  duration: 400,
  easing: 'ease-out',
  fallback: 'css',
  performanceMode: true,
});

// Use in component
<For each={items}>
  {(item, index) => (
    <div class="item" data-animation-index={index()}>
      {item.name}
    </div>
  )}
</For>
```

### `useThreeJSAnimations`

Manages 3D animations using Three.js.

```typescript
interface ThreeJSAnimationOptions {
  rotation?: { x: number; y: number; z: number };
  position?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  duration?: number;
  easing?: string;
  fallback?: 'css' | 'immediate';
  performanceMode?: boolean;
  accessibilityMode?: boolean;
}

interface ThreeJSAnimation {
  isActive: Accessor<boolean>;
  isCompleted: Accessor<boolean>;
  progress: Accessor<number>;
  rotate: (rotation: Partial<{ x: number; y: number; z: number }>) => void;
  translate: (position: Partial<{ x: number; y: number; z: number }>) => void;
  scale: (scale: Partial<{ x: number; y: number; z: number }>) => void;
  reset: () => void;
}

function useThreeJSAnimations(options: ThreeJSAnimationOptions): ThreeJSAnimation
```

#### Parameters

- **`rotation`** (object, optional): Initial rotation values
- **`position`** (object, optional): Initial position values
- **`scale`** (object, optional): Initial scale values
- **`duration`** (number, optional): Animation duration. Default: `500`
- **`easing`** (string, optional): CSS easing function. Default: `'ease-in-out'`
- **`fallback`** ('css' | 'immediate', optional): Fallback behavior. Default: `'css'`
- **`performanceMode`** (boolean, optional): Enable performance optimizations. Default: `false`
- **`accessibilityMode`** (boolean, optional): Enable accessibility features. Default: `false`

#### Returns

- **`isActive`**: Accessor for current animation state
- **`isCompleted`**: Accessor for completion state
- **`progress`**: Accessor for animation progress (0-1)
- **`rotate`**: Function to animate rotation
- **`translate`**: Function to animate position
- **`scale`**: Function to animate scale
- **`reset`**: Function to reset to initial state

#### Example

```typescript
const threeJSAnimation = useThreeJSAnimations({
  rotation: { x: 0, y: 0, z: 0 },
  position: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  duration: 600,
  easing: 'ease-out',
  fallback: 'css',
  performanceMode: true,
});

// Use in component
<button onClick={() => threeJSAnimation.rotate({ y: 90 })}>
  Rotate 90°
</button>
```

## Global Control APIs

### `useGlobalAnimationContext`

Manages global animation configuration and state.

```typescript
interface GlobalAnimationOptions {
  performanceMode?: boolean;
  reducedMotion?: boolean;
  accessibilityMode?: boolean;
  highContrast?: boolean;
  focusVisible?: boolean;
  globalDuration?: number;
  globalEasing?: string;
}

interface GlobalAnimationContext {
  config: Accessor<GlobalAnimationOptions>;
  updateConfig: (options: Partial<GlobalAnimationOptions>) => void;
  enablePerformanceMode: () => void;
  disablePerformanceMode: () => void;
  enableAccessibilityMode: () => void;
  disableAccessibilityMode: () => void;
  togglePerformanceMode: () => void;
  toggleAccessibilityMode: () => void;
}

function useGlobalAnimationContext(options?: GlobalAnimationOptions): GlobalAnimationContext
```

#### Parameters

- **`performanceMode`** (boolean, optional): Enable performance optimizations globally. Default: `false`
- **`reducedMotion`** (boolean, optional): Respect reduced motion preferences. Default: `true`
- **`accessibilityMode`** (boolean, optional): Enable accessibility features globally. Default: `false`
- **`highContrast`** (boolean, optional): Enable high contrast mode. Default: `false`
- **`focusVisible`** (boolean, optional): Enable focus visible animations. Default: `false`
- **`globalDuration`** (number, optional): Global animation duration override. Default: `300`
- **`globalEasing`** (string, optional): Global easing function override. Default: `'ease-in-out'`

#### Returns

- **`config`**: Accessor for current global configuration
- **`updateConfig`**: Function to update global configuration
- **`enablePerformanceMode`**: Function to enable performance mode
- **`disablePerformanceMode`**: Function to disable performance mode
- **`enableAccessibilityMode`**: Function to enable accessibility mode
- **`disableAccessibilityMode`**: Function to disable accessibility mode
- **`togglePerformanceMode`**: Function to toggle performance mode
- **`toggleAccessibilityMode`**: Function to toggle accessibility mode

#### Example

```typescript
const globalContext = useGlobalAnimationContext({
  performanceMode: false,
  reducedMotion: true,
  accessibilityMode: true,
  highContrast: false,
  focusVisible: true,
  globalDuration: 300,
  globalEasing: 'ease-in-out',
});

// Use in component
<button onClick={() => globalContext.togglePerformanceMode()}>
  Toggle Performance Mode
</button>
```

## Fallback System APIs

### `useAnimationFallback`

Provides fallback animation implementations.

```typescript
interface AnimationFallbackOptions {
  type: 'css' | 'immediate';
  duration?: number;
  easing?: string;
  performanceMode?: boolean;
}

interface AnimationFallback {
  isAvailable: Accessor<boolean>;
  fallbackType: Accessor<string>;
  createFallback: (element: HTMLElement, options: any) => void;
  removeFallback: (element: HTMLElement) => void;
  updateFallback: (element: HTMLElement, options: any) => void;
}

function useAnimationFallback(options: AnimationFallbackOptions): AnimationFallback
```

#### Parameters

- **`type`** ('css' | 'immediate'): Type of fallback to use
- **`duration`** (number, optional): Fallback animation duration. Default: `300`
- **`easing`** (string, optional): CSS easing function. Default: `'ease-in-out'`
- **`performanceMode`** (boolean, optional): Enable performance optimizations. Default: `false`

#### Returns

- **`isAvailable`**: Accessor for fallback availability
- **`fallbackType`**: Accessor for current fallback type
- **`createFallback`**: Function to create fallback animation
- **`removeFallback`**: Function to remove fallback animation
- **`updateFallback`**: Function to update fallback animation

#### Example

```typescript
const fallback = useAnimationFallback({
  type: 'css',
  duration: 300,
  easing: 'ease-in-out',
  performanceMode: true,
});

// Use in component
<button 
  ref={(el) => fallback.createFallback(el, { scale: 1.1 })}
  onClick={() => fallback.updateFallback(el, { scale: 1.2 })}
>
  Animated Button
</button>
```

## Performance APIs

### `usePerformanceMonitor`

Monitors animation performance and provides optimization recommendations.

```typescript
interface PerformanceMonitorOptions {
  threshold?: 'lenient' | 'normal' | 'strict';
  enableAlerts?: boolean;
  enableRecommendations?: boolean;
  monitoringInterval?: number;
}

interface PerformanceMonitor {
  metrics: Accessor<PerformanceMetrics>;
  alerts: Accessor<PerformanceAlert[]>;
  recommendations: Accessor<PerformanceRecommendation[]>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  generateReport: () => PerformanceReport;
  clearAlerts: () => void;
}

interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  timing: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  animation: {
    frameRate: number;
    droppedFrames: number;
    animationDuration: number;
    animationCount: number;
  };
}

function usePerformanceMonitor(options: PerformanceMonitorOptions): PerformanceMonitor
```

#### Parameters

- **`threshold`** ('lenient' | 'normal' | 'strict', optional): Performance threshold level. Default: `'normal'`
- **`enableAlerts`** (boolean, optional): Enable performance alerts. Default: `true`
- **`enableRecommendations`** (boolean, optional): Enable optimization recommendations. Default: `true`
- **`monitoringInterval`** (number, optional): Monitoring interval in milliseconds. Default: `1000`

#### Returns

- **`metrics`**: Accessor for current performance metrics
- **`alerts`**: Accessor for active performance alerts
- **`recommendations`**: Accessor for optimization recommendations
- **`startMonitoring`**: Function to start performance monitoring
- **`stopMonitoring`**: Function to stop performance monitoring
- **`generateReport`**: Function to generate performance report
- **`clearAlerts`**: Function to clear all alerts

#### Example

```typescript
const performanceMonitor = usePerformanceMonitor({
  threshold: 'strict',
  enableAlerts: true,
  enableRecommendations: true,
  monitoringInterval: 500,
});

// Use in component
<button onClick={() => performanceMonitor.startMonitoring()}>
  Start Monitoring
</button>
```

## Accessibility APIs

### `useAccessibilityMode`

Manages accessibility features for animations.

```typescript
interface AccessibilityModeOptions {
  reducedMotion?: boolean;
  highContrast?: boolean;
  focusVisible?: boolean;
  announce?: boolean;
  announceDelay?: number;
}

interface AccessibilityMode {
  isEnabled: Accessor<boolean>;
  reducedMotion: Accessor<boolean>;
  highContrast: Accessor<boolean>;
  focusVisible: Accessor<boolean>;
  announce: Accessor<boolean>;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  announceCompletion: (text: string) => void;
}

function useAccessibilityMode(options: AccessibilityModeOptions): AccessibilityMode
```

#### Parameters

- **`reducedMotion`** (boolean, optional): Respect reduced motion preferences. Default: `true`
- **`highContrast`** (boolean, optional): Enable high contrast mode. Default: `false`
- **`focusVisible`** (boolean, optional): Enable focus visible animations. Default: `false`
- **`announce`** (boolean, optional): Announce completion to screen readers. Default: `false`
- **`announceDelay`** (number, optional): Delay before announcement. Default: `100`

#### Returns

- **`isEnabled`**: Accessor for accessibility mode state
- **`reducedMotion`**: Accessor for reduced motion state
- **`highContrast`**: Accessor for high contrast state
- **`focusVisible`**: Accessor for focus visible state
- **`announce`**: Accessor for announcement state
- **`enable`**: Function to enable accessibility mode
- **`disable`**: Function to disable accessibility mode
- **`toggle`**: Function to toggle accessibility mode
- **`announceCompletion`**: Function to announce completion

#### Example

```typescript
const accessibilityMode = useAccessibilityMode({
  reducedMotion: true,
  highContrast: false,
  focusVisible: true,
  announce: true,
  announceDelay: 100,
});

// Use in component
<button onClick={() => accessibilityMode.toggle()}>
  Toggle Accessibility Mode
</button>
```

## Utility APIs

### `useAnimationControl`

Provides low-level animation control utilities.

```typescript
interface AnimationControlOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

interface AnimationControl {
  isSupported: Accessor<boolean>;
  isAvailable: Accessor<boolean>;
  createAnimation: (element: HTMLElement, keyframes: any, options: AnimationControlOptions) => Animation;
  pauseAnimation: (animation: Animation) => void;
  resumeAnimation: (animation: Animation) => void;
  cancelAnimation: (animation: Animation) => void;
  finishAnimation: (animation: Animation) => void;
}

function useAnimationControl(options: AnimationControlOptions): AnimationControl
```

#### Parameters

- **`duration`** (number, optional): Animation duration. Default: `300`
- **`easing`** (string, optional): CSS easing function. Default: `'ease-in-out'`
- **`delay`** (number, optional): Animation delay. Default: `0`
- **`iterations`** (number, optional): Number of iterations. Default: `1`
- **`direction`** (string, optional): Animation direction. Default: `'normal'`
- **`fillMode`** (string, optional): Animation fill mode. Default: `'both'`

#### Returns

- **`isSupported`**: Accessor for Web Animations API support
- **`isAvailable`**: Accessor for animation package availability
- **`createAnimation`**: Function to create animation
- **`pauseAnimation`**: Function to pause animation
- **`resumeAnimation`**: Function to resume animation
- **`cancelAnimation`**: Function to cancel animation
- **`finishAnimation`**: Function to finish animation

#### Example

```typescript
const animationControl = useAnimationControl({
  duration: 500,
  easing: 'ease-out',
  delay: 0,
  iterations: 1,
  direction: 'normal',
  fillMode: 'both',
});

// Use in component
<button 
  ref={(el) => {
    const animation = animationControl.createAnimation(el, [
      { transform: 'scale(1)' },
      { transform: 'scale(1.1)' },
      { transform: 'scale(1)' }
    ], { duration: 300 });
  }}
>
  Animated Button
</button>
```

## Error Handling

All APIs include comprehensive error handling:

```typescript
// Automatic fallback on error
try {
  const animationState = useAnimationState(options);
  return animationState;
} catch (error) {
  console.warn('Animation system unavailable, using fallback');
  return useCSSAnimationFallback(options);
}
```

## TypeScript Support

All APIs are fully typed with TypeScript:

```typescript
// Import types
import type { 
  AnimationState, 
  StaggeredAnimation, 
  ThreeJSAnimation,
  GlobalAnimationContext,
  PerformanceMonitor,
  AccessibilityMode
} from 'reynard-animation/types';
```

## Browser Support

The animation system supports all modern browsers with graceful degradation:

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

For older browsers, the system automatically falls back to CSS animations.

---

*🦊 The animation system APIs provide a comprehensive, type-safe, and accessible foundation for all animation needs in the Reynard ecosystem.*
