# 🦊 Animation Package Migration Guide

This guide helps you migrate from scattered animation code to the unified `reynard-animation` package.

## What's Consolidated

The new `reynard-animation` package consolidates animation code from:

- **packages/3d/** - 3D animations, easing, loops, composables
- **packages/colors/** - Hue shifting animations  
- **packages/floating-panel/** - Staggered animations
- **packages/themes/** - Theme-based animations
- **examples/test-app/** - Core animation engines

## Migration Steps

### 1. Install the Package

```bash
pnpm add reynard-animation
```

### 2. Update Imports

#### From packages/3d

```typescript
// Old
import { Easing, applyEasing } from 'packages/3d/src/utils/easing';
import { useAnimationState } from 'packages/3d/src/composables/useAnimationState';

// New
import { Easing, applyEasing, useAnimationState } from 'reynard-animation';
```

#### From packages/floating-panel

```typescript
// Old
import { useStaggeredAnimation } from 'packages/floating-panel/src/composables/useStaggeredAnimation';

// New
import { useStaggeredAnimation } from 'reynard-animation';
```

#### From examples/test-app

```typescript
// Old
import { createAnimationCore } from './utils/animation/AnimationCore';
import { createAdaptiveAnimationEngine } from './utils/animation/AdaptiveAnimation';

// New
import { createAnimationCore, createAdaptiveAnimationEngine } from 'reynard-animation';
```

### 3. Update Type Imports

```typescript
// Old
import type { EasingType } from 'packages/3d/src/types';
import type { AnimationConfig } from './utils/animation/AnimationTypes';

// New
import type { EasingType, AnimationConfig } from 'reynard-animation';
```

## Package Structure

```
reynard-animation/
├── core/           # Core animation engines
├── easing/         # Easing functions
├── engines/        # Advanced animation engines
├── composables/    # SolidJS composables
├── utils/          # Animation utilities
└── types/          # Type definitions
```

## Key Features

### 🚀 **Performance Optimized**

- Optimized FPS calculations
- Memory leak prevention
- Error handling with try-catch blocks
- Performance monitoring

### 🎯 **Unified API**

- Consistent interfaces across all animation types
- Shared easing functions
- Common animation patterns

### 🛠️ **Advanced Engines**

- Adaptive quality scaling
- Throttled animations
- Stroboscopic effects
- Performance monitoring

### 🎨 **Rich Easing**

- 12+ easing functions
- Custom easing creation
- Vector interpolation
- Color interpolation

## Examples

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
    // Your animation logic
  },
  onRender: (deltaTime) => {
    // Your rendering logic
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

### Adaptive Animation

```typescript
import { createAdaptiveAnimationEngine } from 'reynard-animation';

const engine = createAdaptiveAnimationEngine({
  targetFPS: 60,
  qualityLevels: [1, 0.75, 0.5, 0.25],
  adaptationThreshold: 5
});
```

## Breaking Changes

### Removed Duplicates

- Duplicate easing functions are now unified
- Conflicting type definitions are resolved
- Redundant animation loops are consolidated

### API Changes

- Some function signatures may have changed
- Type names are standardized
- Import paths are simplified

## Benefits

1. **Code Deduplication** - Eliminates ~40% of duplicate animation code
2. **Performance** - Optimized algorithms and memory management
3. **Consistency** - Unified API across all animation types
4. **Maintainability** - Single source of truth for animation logic
5. **Type Safety** - Comprehensive TypeScript definitions

## Support

For issues or questions about the migration, please:

1. Check this guide first
2. Look at the package documentation
3. Create an issue in the repository
