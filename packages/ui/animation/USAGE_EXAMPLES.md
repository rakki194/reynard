# 🦊 Animation System Usage Examples

*Comprehensive examples for using the Reynard animation system*

## Overview

This document provides practical examples for using the Reynard animation system, including fallback usage, performance modes, accessibility features, and migration scenarios.

## Basic Usage Examples

### Simple Animation

```typescript
import { useAnimationState } from 'reynard-animation';

function SimpleAnimation() {
  const animationState = useAnimationState({
    initial: false,
    duration: 300,
    easing: 'ease-in-out',
    fallback: 'css',
  });

  return (
    <div class="animation-container">
      <button onClick={() => animationState.toggle()}>
        Toggle Animation
      </button>
      <div 
        class="animated-element"
        classList={{ 'active': animationState.isActive() }}
      >
        This element animates
      </div>
    </div>
  );
}
```

### Staggered Animation

```typescript
import { useStaggeredAnimation } from 'reynard-animation';

function StaggeredAnimation() {
  const items = Array.from({ length: 5 }, (_, i) => ({ 
    id: i, 
    name: `Item ${i + 1}` 
  }));

  const staggeredAnimation = useStaggeredAnimation({
    items,
    stagger: 100,
    duration: 400,
    easing: 'ease-out',
    fallback: 'css',
  });

  return (
    <div class="staggered-container">
      <button onClick={() => staggeredAnimation.start()}>
        Start Staggered Animation
      </button>
      <For each={items}>
        {(item, index) => (
          <div 
            class="staggered-item"
            classList={{ 'active': staggeredAnimation.isActive() }}
            style={{
              'animation-delay': `${index() * 100}ms`,
            }}
          >
            {item.name}
          </div>
        )}
      </For>
    </div>
  );
}
```

### 3D Animation

```typescript
import { useThreeJSAnimations } from 'reynard-animation';

function ThreeDAnimation() {
  const threeJSAnimation = useThreeJSAnimations({
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    duration: 600,
    easing: 'ease-out',
    fallback: 'css',
  });

  return (
    <div class="three-d-container">
      <button onClick={() => threeJSAnimation.rotate({ y: 90 })}>
        Rotate Y
      </button>
      <button onClick={() => threeJSAnimation.rotate({ x: 90 })}>
        Rotate X
      </button>
      <button onClick={() => threeJSAnimation.scale({ x: 1.5, y: 1.5 })}>
        Scale Up
      </button>
      <div 
        class="three-d-element"
        style={{
          transform: `rotateX(${threeJSAnimation.rotation().x}deg) 
                     rotateY(${threeJSAnimation.rotation().y}deg) 
                     rotateZ(${threeJSAnimation.rotation().z}deg) 
                     scale(${threeJSAnimation.scale().x})`,
        }}
      >
        3D Element
      </div>
    </div>
  );
}
```

## Fallback Usage Examples

### CSS Fallback

```typescript
import { useAnimationState } from 'reynard-animation';

function CSSFallback() {
  const animationState = useAnimationState({
    initial: false,
    duration: 300,
    easing: 'ease-in-out',
    fallback: 'css', // CSS-based fallback
  });

  return (
    <div class="fallback-container">
      <button onClick={() => animationState.toggle()}>
        Toggle with CSS Fallback
      </button>
      <div 
        class="fallback-element"
        classList={{ 'active': animationState.isActive() }}
      >
        This uses CSS fallback when animation package is unavailable
      </div>
    </div>
  );
}
```

### Immediate Completion Fallback

```typescript
import { useAnimationState } from 'reynard-animation';

function ImmediateFallback() {
  const animationState = useAnimationState({
    initial: false,
    duration: 300,
    easing: 'ease-in-out',
    fallback: 'immediate', // Immediate completion fallback
  });

  return (
    <div class="immediate-container">
      <button onClick={() => animationState.toggle()}>
        Toggle with Immediate Fallback
      </button>
      <div 
        class="immediate-element"
        classList={{ 'active': animationState.isActive() }}
      >
        This completes immediately when disabled
      </div>
    </div>
  );
}
```

### Smart Import with Fallback

```typescript
import { createSignal, onMount } from 'solid-js';

function SmartImportFallback() {
  const [animationState, setAnimationState] = createSignal(null);
  const [isLoading, setIsLoading] = createSignal(true);

  onMount(async () => {
    try {
      const { useAnimationState } = await import('reynard-animation');
      setAnimationState(useAnimationState({
        initial: false,
        duration: 300,
        easing: 'ease-in-out',
        fallback: 'css',
      }));
    } catch (error) {
      console.warn('Animation package not available, using CSS fallback');
      // Use CSS fallback
      setAnimationState({
        isActive: () => false,
        toggle: () => {
          // CSS-based toggle logic
          const element = document.querySelector('.smart-element');
          element?.classList.toggle('active');
        },
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div class="smart-container">
      {isLoading() ? (
        <div>Loading animation system...</div>
      ) : (
        <>
          <button onClick={() => animationState()?.toggle()}>
            Toggle with Smart Import
          </button>
          <div 
            class="smart-element"
            classList={{ 'active': animationState()?.isActive() }}
          >
            This uses smart import with fallback
          </div>
        </>
      )}
    </div>
  );
}
```

## Performance Mode Examples

### Global Performance Mode

```typescript
import { useGlobalAnimationContext } from 'reynard-animation';

function GlobalPerformanceMode() {
  const globalContext = useGlobalAnimationContext({
    performanceMode: true,
    reducedMotion: false,
    accessibilityMode: false,
    globalDuration: 150, // Reduced duration
    globalEasing: 'ease-out', // Optimized easing
  });

  return (
    <div class="global-performance-container">
      <button onClick={() => globalContext.togglePerformanceMode()}>
        Toggle Performance Mode
      </button>
      <div class="performance-indicator">
        Performance Mode: {globalContext.config().performanceMode ? 'ON' : 'OFF'}
      </div>
    </div>
  );
}
```

### Component-Level Performance Mode

```typescript
import { useAnimationState } from 'reynard-animation';

function ComponentPerformanceMode() {
  const animationState = useAnimationState({
    initial: false,
    duration: 150, // Reduced duration for performance
    easing: 'ease-out', // Optimized easing
    performanceMode: true, // Enable performance optimizations
    fallback: 'css',
  });

  return (
    <div class="component-performance-container">
      <button onClick={() => animationState.toggle()}>
        Toggle with Performance Mode
      </button>
      <div 
        class="performance-element"
        classList={{ 'active': animationState.isActive() }}
      >
        This uses performance optimizations
      </div>
    </div>
  );
}
```

### Performance Monitoring

```typescript
import { usePerformanceMonitor } from 'reynard-animation';

function PerformanceMonitoring() {
  const performanceMonitor = usePerformanceMonitor({
    threshold: 'strict',
    enableAlerts: true,
    enableRecommendations: true,
    monitoringInterval: 500,
  });

  return (
    <div class="performance-monitoring-container">
      <button onClick={() => performanceMonitor.startMonitoring()}>
        Start Monitoring
      </button>
      <button onClick={() => performanceMonitor.stopMonitoring()}>
        Stop Monitoring
      </button>
      <div class="performance-metrics">
        <h3>Performance Metrics</h3>
        <div>Memory Usage: {performanceMonitor.metrics().memory.used / 1024 / 1024}MB</div>
        <div>Frame Rate: {performanceMonitor.metrics().animation.frameRate}fps</div>
        <div>Load Time: {performanceMonitor.metrics().timing.domContentLoaded}ms</div>
      </div>
      <div class="performance-alerts">
        <h3>Alerts</h3>
        <For each={performanceMonitor.alerts()}>
          {(alert) => (
            <div class={`alert alert-${alert.type}`}>
              {alert.message}
            </div>
          )}
        </For>
      </div>
      <div class="performance-recommendations">
        <h3>Recommendations</h3>
        <For each={performanceMonitor.recommendations()}>
          {(recommendation) => (
            <div class="recommendation">
              <h4>{recommendation.title}</h4>
              <p>{recommendation.description}</p>
              <ul>
                <For each={recommendation.actions}>
                  {(action) => <li>{action}</li>}
                </For>
              </ul>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
```

## Accessibility Examples

### Accessibility Mode

```typescript
import { useAccessibilityMode } from 'reynard-animation';

function AccessibilityMode() {
  const accessibilityMode = useAccessibilityMode({
    reducedMotion: true,
    highContrast: false,
    focusVisible: true,
    announce: true,
    announceDelay: 100,
  });

  return (
    <div class="accessibility-container">
      <button onClick={() => accessibilityMode.toggle()}>
        Toggle Accessibility Mode
      </button>
      <div class="accessibility-indicator">
        Accessibility Mode: {accessibilityMode.isEnabled() ? 'ON' : 'OFF'}
      </div>
    </div>
  );
}
```

### Reduced Motion Support

```typescript
import { useAnimationState } from 'reynard-animation';

function ReducedMotionSupport() {
  const animationState = useAnimationState({
    initial: false,
    duration: 300,
    easing: 'ease-in-out',
    fallback: 'css',
    accessibilityMode: true, // Enable accessibility features
    announce: true,
    announceText: 'Panel opened',
  });

  return (
    <div class="reduced-motion-container">
      <button onClick={() => animationState.toggle()}>
        Toggle with Reduced Motion Support
      </button>
      <div 
        class="reduced-motion-element"
        classList={{ 'active': animationState.isActive() }}
      >
        This respects prefers-reduced-motion
      </div>
    </div>
  );
}
```

### Focus Management

```typescript
import { useAnimationState } from 'reynard-animation';

function FocusManagement() {
  const animationState = useAnimationState({
    initial: false,
    duration: 200,
    easing: 'ease-in-out',
    fallback: 'css',
    accessibilityMode: true,
    focusVisible: true,
  });

  return (
    <div class="focus-management-container">
      <button 
        onClick={() => animationState.toggle()}
        onFocus={() => animationState.start()}
        onBlur={() => animationState.stop()}
      >
        Focus-Aware Button
      </button>
      <div 
        class="focus-element"
        classList={{ 'active': animationState.isActive() }}
      >
        This responds to focus events
      </div>
    </div>
  );
}
```

### Screen Reader Announcements

```typescript
import { useAnimationState } from 'reynard-animation';

function ScreenReaderAnnouncements() {
  const animationState = useAnimationState({
    initial: false,
    duration: 300,
    easing: 'ease-in-out',
    fallback: 'css',
    accessibilityMode: true,
    announce: true,
    announceText: 'Animation completed',
    announceDelay: 100,
  });

  return (
    <div class="screen-reader-container">
      <button onClick={() => animationState.toggle()}>
        Toggle with Screen Reader Announcements
      </button>
      <div 
        class="screen-reader-element"
        classList={{ 'active': animationState.isActive() }}
        aria-live="polite"
        aria-label="Animation status"
      >
        This announces completion to screen readers
      </div>
    </div>
  );
}
```

## Migration Examples

### Basic Migration

**Before (Old System):**

```typescript
function OldAnimation() {
  const [isVisible, setIsVisible] = createSignal(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible());
  };

  return (
    <div class="old-container">
      <button onClick={toggleVisibility}>
        Toggle Visibility
      </button>
      <div 
        class="old-element"
        classList={{ 'visible': isVisible() }}
      >
        Old Animation
      </div>
    </div>
  );
}
```

**After (New System):**

```typescript
import { useAnimationState } from 'reynard-animation';

function NewAnimation() {
  const animationState = useAnimationState({
    initial: false,
    duration: 300,
    easing: 'ease-in-out',
    fallback: 'css',
  });

  return (
    <div class="new-container">
      <button onClick={() => animationState.toggle()}>
        Toggle Visibility
      </button>
      <div 
        class="new-element"
        classList={{ 'visible': animationState.isActive() }}
      >
        New Animation
      </div>
    </div>
  );
}
```

### Staggered Animation Migration

**Before (Old System):**

```typescript
function OldStaggeredAnimation() {
  const [isActive, setIsActive] = createSignal(false);
  const items = Array.from({ length: 5 }, (_, i) => i);

  const startAnimation = () => {
    setIsActive(true);
    items.forEach((item, index) => {
      setTimeout(() => {
        // Animate item
      }, index * 100);
    });
  };

  return (
    <div class="old-staggered-container">
      <button onClick={startAnimation}>
        Start Animation
      </button>
      <For each={items}>
        {(item, index) => (
          <div 
            class="old-staggered-item"
            classList={{ 'active': isActive() }}
            style={{ 'animation-delay': `${index() * 100}ms` }}
          >
            Item {item}
          </div>
        )}
      </For>
    </div>
  );
}
```

**After (New System):**

```typescript
import { useStaggeredAnimation } from 'reynard-animation';

function NewStaggeredAnimation() {
  const items = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  const staggeredAnimation = useStaggeredAnimation({
    items,
    stagger: 100,
    duration: 300,
    easing: 'ease-out',
    fallback: 'css',
  });

  return (
    <div class="new-staggered-container">
      <button onClick={() => staggeredAnimation.start()}>
        Start Animation
      </button>
      <For each={items}>
        {(item, index) => (
          <div 
            class="new-staggered-item"
            classList={{ 'active': staggeredAnimation.isActive() }}
            style={{ 'animation-delay': `${index() * 100}ms` }}
          >
            {item.name}
          </div>
        )}
      </For>
    </div>
  );
}
```

### 3D Animation Migration

**Before (Old System):**

```typescript
function Old3DAnimation() {
  const [rotation, setRotation] = createSignal(0);

  const rotate = () => {
    setRotation(rotation() + 90);
  };

  return (
    <div class="old-3d-container">
      <button onClick={rotate}>
        Rotate
      </button>
      <div 
        class="old-3d-element"
        style={{ transform: `rotateY(${rotation()}deg)` }}
      >
        3D Element
      </div>
    </div>
  );
}
```

**After (New System):**

```typescript
import { useThreeJSAnimations } from 'reynard-animation';

function New3DAnimation() {
  const threeJSAnimation = useThreeJSAnimations({
    rotation: { x: 0, y: 0, z: 0 },
    duration: 500,
    easing: 'ease-out',
    fallback: 'css',
  });

  return (
    <div class="new-3d-container">
      <button onClick={() => threeJSAnimation.rotate({ y: 90 })}>
        Rotate
      </button>
      <div 
        class="new-3d-element"
        style={{
          transform: `rotateY(${threeJSAnimation.rotation().y}deg)`,
        }}
      >
        3D Element
      </div>
    </div>
  );
}
```

## Advanced Examples

### Complex Animation Sequence

```typescript
import { useAnimationState, useStaggeredAnimation } from 'reynard-animation';

function ComplexAnimationSequence() {
  const [currentStep, setCurrentStep] = createSignal(0);
  
  const mainAnimation = useAnimationState({
    initial: false,
    duration: 500,
    easing: 'ease-out',
    fallback: 'css',
  });

  const items = Array.from({ length: 3 }, (_, i) => ({ id: i, name: `Step ${i + 1}` }));
  
  const staggeredAnimation = useStaggeredAnimation({
    items,
    stagger: 200,
    duration: 300,
    easing: 'ease-in-out',
    fallback: 'css',
  });

  const runSequence = async () => {
    // Step 1: Start main animation
    mainAnimation.start();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Start staggered animation
    staggeredAnimation.start();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Complete sequence
    setCurrentStep(3);
  };

  return (
    <div class="complex-sequence-container">
      <button onClick={runSequence}>
        Run Complex Sequence
      </button>
      <div 
        class="main-element"
        classList={{ 'active': mainAnimation.isActive() }}
      >
        Main Animation
      </div>
      <For each={items}>
        {(item, index) => (
          <div 
            class="sequence-item"
            classList={{ 'active': staggeredAnimation.isActive() }}
            style={{ 'animation-delay': `${index() * 200}ms` }}
          >
            {item.name}
          </div>
        )}
      </For>
      <div class="sequence-status">
        Current Step: {currentStep()}
      </div>
    </div>
  );
}
```

### Conditional Animation Loading

```typescript
import { createSignal, onMount } from 'solid-js';

function ConditionalAnimationLoading() {
  const [animationSystem, setAnimationSystem] = createSignal(null);
  const [isLoading, setIsLoading] = createSignal(true);

  onMount(async () => {
    // Check device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency < 4;
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isLowEndDevice || hasReducedMotion) {
      // Load lightweight animation system
      const { useAnimationState } = await import('reynard-animation/lightweight');
      setAnimationSystem(useAnimationState({
        duration: 150,
        easing: 'ease-out',
        performanceMode: true,
        fallback: 'immediate',
      }));
    } else {
      // Load full animation system
      const { useAnimationState } = await import('reynard-animation');
      setAnimationSystem(useAnimationState({
        duration: 300,
        easing: 'ease-in-out',
        performanceMode: false,
        fallback: 'css',
      }));
    }
    
    setIsLoading(false);
  });

  return (
    <div class="conditional-loading-container">
      {isLoading() ? (
        <div>Loading appropriate animation system...</div>
      ) : (
        <>
          <button onClick={() => animationSystem()?.toggle()}>
            Toggle Conditional Animation
          </button>
          <div 
            class="conditional-element"
            classList={{ 'active': animationSystem()?.isActive() }}
          >
            This uses conditional loading based on device capabilities
          </div>
        </>
      )}
    </div>
  );
}
```

## CSS Integration Examples

### CSS Custom Properties

```css
/* Animation CSS with custom properties */
.animation-element {
  --animation-duration: 300ms;
  --animation-easing: ease-in-out;
  --animation-delay: 0ms;
  
  transition: all var(--animation-duration) var(--animation-easing);
  transition-delay: var(--animation-delay);
}

.animation-element.active {
  transform: scale(1.1);
  opacity: 0.8;
}

/* Performance mode overrides */
.performance-mode .animation-element {
  --animation-duration: 150ms;
  --animation-easing: ease-out;
}

/* Reduced motion overrides */
@media (prefers-reduced-motion: reduce) {
  .animation-element {
    --animation-duration: 0ms;
    transition: none;
  }
}
```

### CSS Animation Classes

```css
/* Base animation classes */
.animation-fade-in {
  opacity: 0;
  transition: opacity 300ms ease-in-out;
}

.animation-fade-in.active {
  opacity: 1;
}

.animation-slide-up {
  transform: translateY(20px);
  opacity: 0;
  transition: transform 300ms ease-out, opacity 300ms ease-out;
}

.animation-slide-up.active {
  transform: translateY(0);
  opacity: 1;
}

.animation-scale {
  transform: scale(0.9);
  opacity: 0;
  transition: transform 300ms ease-out, opacity 300ms ease-out;
}

.animation-scale.active {
  transform: scale(1);
  opacity: 1;
}
```

## Testing Examples

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { useAnimationState } from 'reynard-animation';

describe('Animation System', () => {
  it('should toggle animation state', () => {
    const TestComponent = () => {
      const animationState = useAnimationState({
        initial: false,
        duration: 300,
        easing: 'ease-in-out',
        fallback: 'css',
      });

      return (
        <div>
          <button onClick={() => animationState.toggle()}>
            Toggle
          </button>
          <div classList={{ 'active': animationState.isActive() }}>
            Animated Element
          </div>
        </div>
      );
    };

    const { getByText, getByRole } = render(() => <TestComponent />);
    const button = getByText('Toggle');
    const element = getByRole('generic');

    expect(element).not.toHaveClass('active');
    
    fireEvent.click(button);
    
    expect(element).toHaveClass('active');
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@solidjs/testing-library';
import { useStaggeredAnimation } from 'reynard-animation';

describe('Staggered Animation Integration', () => {
  it('should animate items in sequence', async () => {
    const TestComponent = () => {
      const items = Array.from({ length: 3 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      const staggeredAnimation = useStaggeredAnimation({
        items,
        stagger: 100,
        duration: 200,
        easing: 'ease-out',
        fallback: 'css',
      });

      return (
        <div>
          <button onClick={() => staggeredAnimation.start()}>
            Start Animation
          </button>
          <For each={items}>
            {(item, index) => (
              <div 
                class="staggered-item"
                classList={{ 'active': staggeredAnimation.isActive() }}
                data-testid={`item-${item.id}`}
              >
                {item.name}
              </div>
            )}
          </For>
        </div>
      );
    };

    const { getByText, getByTestId } = render(() => <TestComponent />);
    const button = getByText('Start Animation');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(getByTestId('item-0')).toHaveClass('active');
    });
  });
});
```

---

*🦊 These examples demonstrate the power and flexibility of the Reynard animation system, providing practical guidance for implementation across various scenarios.*
