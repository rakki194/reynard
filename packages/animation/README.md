# 🦊 Reynard Animation Package

Unified animation system for Reynard - consolidates all animation functionality from across the codebase.

## Features

### 🚀 **Core Animation Engines**

- **AnimationCore** - High-performance animation loop with FPS limiting
- **AdaptiveAnimation** - Quality-adaptive engine that scales based on performance
- **ThrottledAnimation** - Throttled engine for performance optimization
- **StroboscopicEngine** - Advanced stroboscopic effects for phyllotactic spirals

### 🎨 **Rich Easing System**

- 12+ easing functions (linear, quad, cubic, elastic, bounce)
- Custom easing creation
- Vector interpolation (2D, 3D)
- Color interpolation
- Easing combination and reversal

### 🎯 **SolidJS Composables**

- **useAnimationState** - Animation state management
- **useStaggeredAnimation** - Staggered animation orchestration
- Reactive animation controls
- Automatic cleanup

### 📊 **Performance Monitoring**

- Real-time FPS tracking
- Performance trend analysis
- Quality level recommendations
- Memory usage monitoring
- Stability calculations

### 🛠️ **Animation Utilities**

- Animation loops (simple, repeating, ping-pong)
- Cluster animation support
- Frame timing utilities
- Interpolation helpers

## Installation

```bash
pnpm add reynard-animation
```

## Quick Start

### Basic Animation

```typescript
import { createAnimationCore } from 'reynard-animation';

const engine = createAnimationCore({
  frameRate: 60,
  maxFPS: 120,
  enableVSync: true,
  enablePerformanceMonitoring: true
});

engine.start({
  onUpdate: (deltaTime) => {
    // Update your animation state
  },
  onRender: (deltaTime) => {
    // Render your animation
  }
});
```

### Staggered Animation

```typescript
import { useStaggeredAnimation } from 'reynard-animation';

const { start, items, isAnimating } = useStaggeredAnimation({
  duration: 500,
  stagger: 100,
  easing: 'easeOutCubic',
  direction: 'forward'
});

// Start animation for 5 items
await start(5);
```

### Adaptive Quality

```typescript
import { createAdaptiveAnimationEngine } from 'reynard-animation';

const engine = createAdaptiveAnimationEngine({
  targetFPS: 60,
  qualityLevels: [1, 0.75, 0.5, 0.25],
  adaptationThreshold: 5
});

// Engine automatically adjusts quality based on performance
```

### Easing Functions

```typescript
import { Easing, interpolate, interpolateVector3 } from 'reynard-animation';

// Use built-in easing
const easedValue = Easing.easeOutCubic(0.5);

// Interpolate with easing
const value = interpolate(0, 100, 0.5, 'easeInOutCubic');

// Interpolate 3D vectors
const position = interpolateVector3(
  [0, 0, 0],
  [100, 100, 100],
  0.5,
  'easeOutElastic'
);
```

## Package Structure

```
reynard-animation/
├── core/           # Core animation engines
│   ├── AnimationCore.ts
│   └── PerformanceMonitor.ts
├── easing/         # Easing functions and interpolation
│   └── index.ts
├── engines/        # Advanced animation engines
│   ├── AdaptiveAnimation.ts
│   ├── ThrottledAnimation.ts
│   └── StroboscopicEngine.ts
├── composables/    # SolidJS composables
│   ├── useAnimationState.ts
│   └── useStaggeredAnimation.ts
├── utils/          # Animation utilities
│   └── AnimationLoop.ts
└── types/          # TypeScript definitions
    └── index.ts
```

## API Reference

### Core Engines

#### `createAnimationCore(config)`

Creates a high-performance animation engine.

**Config:**

- `frameRate: number` - Target frame rate
- `maxFPS: number` - Maximum FPS limit
- `enableVSync: boolean` - Enable VSync
- `enablePerformanceMonitoring: boolean` - Enable performance logging

#### `createAdaptiveAnimationEngine(config)`

Creates an adaptive animation engine that scales quality based on performance.

**Additional Config:**

- `targetFPS: number` - Target FPS for adaptation
- `qualityLevels: number[]` - Quality scaling levels
- `adaptationThreshold: number` - Frames below target before adapting

#### `createThrottledAnimationEngine(config)`

Creates a throttled animation engine for performance optimization.

**Additional Config:**

- `throttleInterval: number` - Throttle interval in milliseconds

### Composables

#### `useAnimationState()`

SolidJS composable for animation state management.

**Returns:**

- `currentAnimation` - Current animation state
- `createAnimationState` - Create new animation state
- `stopAnimations` - Stop all animations

#### `useStaggeredAnimation(options)`

SolidJS composable for staggered animations.

**Options:**

- `duration: number` - Animation duration
- `stagger: number` - Stagger delay between items
- `easing: EasingType` - Easing function
- `direction: 'forward' | 'reverse' | 'center' | 'random'` - Animation direction

### Easing Functions

#### Available Easing Types

- `linear` - No easing
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad` - Quadratic easing
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic` - Cubic easing
- `easeInElastic`, `easeOutElastic`, `easeInOutElastic` - Elastic easing
- `easeInBounce`, `easeOutBounce`, `easeInOutBounce` - Bounce easing

#### Interpolation Functions

- `interpolate(start, end, t, easing)` - Interpolate numbers
- `interpolateVector2(start, end, t, easing)` - Interpolate 2D vectors
- `interpolateVector3(start, end, t, easing)` - Interpolate 3D vectors
- `interpolateColor(start, end, t, easing)` - Interpolate RGB colors

## Performance Features

### Automatic Quality Scaling

The adaptive engine automatically reduces quality when performance drops:

- Monitors FPS in real-time
- Scales quality levels based on performance
- Provides smooth performance degradation

### Memory Management

- Automatic cleanup on component unmount
- Optimized FPS calculations
- Memory leak prevention

### Error Handling

- Try-catch blocks around all callbacks
- Graceful error recovery
- Performance monitoring integration

## Migration

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions from existing animation code.

## Examples

Check the `examples/` directory for comprehensive usage examples:

- Basic animation loops
- Staggered animations
- 3D animations
- Performance optimization
- Custom easing functions

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure backward compatibility

## License

MIT License - see LICENSE file for details.
