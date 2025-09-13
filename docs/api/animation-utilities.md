# Animation Utilities API

> Comprehensive API documentation for Reynard's advanced animation utilities

## Overview

The Reynard Animation Utilities provide a comprehensive suite of tools for creating sophisticated animations, with special focus on phyllotactic patterns, stroboscopic effects, and performance optimization.

## Core Animation Engine

### `createAnimationCore(config: AnimationConfig)`

Creates a high-performance animation engine with built-in safety checks and performance monitoring.

```typescript
import { createAnimationCore } from '../utils/animation/AnimationCore';

const animationCore = createAnimationCore({
  frameRate: 60,
  maxFPS: 120,
  enableVSync: true,
  enablePerformanceMonitoring: true,
});
```

#### Parameters

- `config.frameRate` (number): Target frame rate (default: 60)
- `config.maxFPS` (number): Maximum allowed FPS (default: 120)
- `config.enableVSync` (boolean): Enable VSync (default: true)
- `config.enablePerformanceMonitoring` (boolean): Enable performance tracking (default: true)

#### Returns

```typescript
interface AnimationCore {
  animationState: () => AnimationState;
  start: (callbacks: AnimationCallbacks) => void;
  stop: () => void;
  getPerformanceStats: () => PerformanceStats;
  updateConfig: (config: Partial<AnimationConfig>) => void;
  updateCallbacks: (callbacks: AnimationCallbacks) => void;
  reset: () => void;
}
```

#### Methods

**`start(callbacks: AnimationCallbacks)`**

- Starts the animation loop
- Accepts callbacks for update and render phases
- Includes safety checks and timeout protection

**`stop()`**

- Stops the animation loop
- Cleans up resources and cancels frame requests

**`getPerformanceStats(): PerformanceStats`**

- Returns current performance metrics
- Includes FPS, frame time, render time, and update time

## Stroboscopic Engine

### `StroboscopicEngine`

Advanced stroboscopic animation effects based on mathematical research.

```typescript
import { StroboscopicEngine } from '../utils/animation/StroboscopicEngine';

const stroboscopicEngine = new StroboscopicEngine({
  frameRate: 60,
  rotationSpeed: 1.0,
  goldenAngle: 137.50776,
  stroboscopicThreshold: 0.1,
  enableTemporalAliasing: true,
  enableMorphingEffects: true,
});
```

#### Configuration

```typescript
interface StroboscopicConfig {
  frameRate: number;
  rotationSpeed: number;
  goldenAngle: number;
  stroboscopicThreshold: number;
  enableTemporalAliasing: boolean;
  enableMorphingEffects: boolean;
}
```

#### Methods

**`calculateStroboscopicEffect(deltaTime: number): StroboscopicState`**

- Calculates stroboscopic effect based on rotation speed and frame rate
- Returns state including phase, apparent motion, and intensity

**`applyStroboscopicTransform(points: Point[], deltaTime: number): TransformedPoint[]`**

- Applies stroboscopic transformation to point arrays
- Includes morphing effects and temporal aliasing

**`calculateOptimalRotationSpeed(frameRate: number): number`**

- Calculates optimal rotation speed for stroboscopic effect
- Based on golden angle and frame rate

#### State Interface

```typescript
interface StroboscopicState {
  isStroboscopic: boolean;
  stroboscopicPhase: number;
  apparentMotion: 'growing' | 'shrinking' | 'frozen' | 'morphing';
  temporalAliasing: number;
  morphingIntensity: number;
}
```

## Advanced Pattern Generator

### `AdvancedPatternGenerator`

Implements cutting-edge research models for phyllotactic pattern generation.

```typescript
import { AdvancedPatternGenerator } from '../utils/phyllotactic/AdvancedPatternGenerator';

const patternGenerator = new AdvancedPatternGenerator({
  patternType: 'rotase',
  pointCount: 1000,
  baseRadius: 10,
  growthFactor: 1.0,
  centerX: 400,
  centerY: 300,
  galacticSpiralFactor: 1.0,
  fibonacciSiblingRatio: 0.618,
  latticeDensity: 1.0,
  latticeOffset: 0,
  enableMorphing: true,
  morphingIntensity: 0.1,
  enableColorHarmonics: true,
});
```

#### Configuration

```typescript
interface AdvancedPatternConfig {
  patternType: 'vogel' | 'rotase' | 'bernoulli' | 'fibonacci-sibling';
  pointCount: number;
  baseRadius: number;
  growthFactor: number;
  centerX: number;
  centerY: number;
  galacticSpiralFactor: number;
  fibonacciSiblingRatio: number;
  latticeDensity: number;
  latticeOffset: number;
  enableMorphing: boolean;
  morphingIntensity: number;
  enableColorHarmonics: boolean;
}
```

#### Methods

**`generatePattern(): AdvancedPatternPoint[]`**

- Generates pattern based on current configuration
- Returns array of points with position, color, and metadata

**`updateConfig(newConfig: Partial<AdvancedPatternConfig>): void`**

- Updates configuration and triggers regeneration if needed

**`calculatePerformanceMetrics(): PerformanceMetrics`**

- Calculates performance metrics for the current pattern
- Includes complexity, rendering cost, and memory usage

#### Point Interface

```typescript
interface AdvancedPatternPoint {
  index: number;
  x: number;
  y: number;
  radius: number;
  angle: number;
  color: string;
  size: number;
  patternType: string;
  morphingPhase: number;
}
```

## 3D Phyllotactic System

### `Phyllotactic3DSystem`

Extends phyllotactic patterns into 3D space with advanced rendering capabilities.

```typescript
import { Phyllotactic3DSystem } from '../utils/phyllotactic/Phyllotactic3D';

const phyllotactic3D = new Phyllotactic3DSystem({
  pointCount: 1000,
  baseRadius: 10,
  height: 100,
  centerX: 0,
  centerY: 0,
  centerZ: 0,
  spiralPitch: 0.1,
  verticalGrowth: 1.0,
  enableSphericalProjection: false,
  sphereRadius: 50,
  rotationSpeedX: 0.01,
  rotationSpeedY: 0.02,
  rotationSpeedZ: 0.005,
  enableStroboscopic3D: true,
  stroboscopicThreshold: 0.1,
});
```

#### Configuration

```typescript
interface Phyllotactic3DConfig {
  pointCount: number;
  baseRadius: number;
  height: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  spiralPitch: number;
  verticalGrowth: number;
  enableSphericalProjection: boolean;
  sphereRadius: number;
  rotationSpeedX: number;
  rotationSpeedY: number;
  rotationSpeedZ: number;
  enableStroboscopic3D: boolean;
  stroboscopicThreshold: number;
}
```

#### Methods

**`generate3DSpiral(): Phyllotactic3DPoint[]`**

- Generates 3D phyllotactic spiral
- Returns array of 3D points with position and metadata

**`updateRotation(deltaTime: number): void`**

- Updates 3D rotation based on delta time
- Applies rotation speeds for all axes

**`getRotation(): { x: number; y: number; z: number }`**

- Returns current rotation state for all axes

**`calculate3DPerformanceMetrics(): PerformanceMetrics`**

- Calculates 3D-specific performance metrics
- Includes complexity, rendering cost, and stroboscopic overhead

#### 3D Point Interface

```typescript
interface Phyllotactic3DPoint {
  index: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  angle: number;
  height: number;
  color: string;
  size: number;
  stroboscopicIntensity: number;
}
```

## Performance Optimization Engine

### `PerformanceOptimizedEngine`

Advanced performance optimizations for large-scale animations.

```typescript
import { PerformanceOptimizedEngine } from '../utils/animation/PerformanceOptimizedEngine';

const performanceEngine = new PerformanceOptimizedEngine({
  maxPoints: 10000,
  targetFPS: 60,
  enableAdaptiveQuality: true,
  enableSpatialCulling: true,
  enableLOD: true,
  enableBatching: true,
  enableWebWorkers: false,
  memoryLimit: 100,
});
```

#### Configuration

```typescript
interface PerformanceConfig {
  maxPoints: number;
  targetFPS: number;
  enableAdaptiveQuality: boolean;
  enableSpatialCulling: boolean;
  enableLOD: boolean;
  enableBatching: boolean;
  enableWebWorkers: boolean;
  memoryLimit: number;
}
```

#### Methods

**`updateMetrics(frameTime: number, renderTime: number, updateTime: number, pointCount: number): void`**

- Updates performance metrics and adjusts quality if needed
- Triggers adaptive quality adjustments

**`applySpatialCulling(points: Point[], viewport: Viewport): Point[]`**

- Applies spatial culling to reduce rendered points
- Returns filtered point array based on viewport

**`applyLOD(points: Point[], cameraDistance: number): Point[]`**

- Applies level-of-detail optimization
- Reduces detail for distant objects

**`shouldSkipUpdate(): boolean`**

- Determines if update should be skipped for throttling
- Based on current quality level and performance

**`getCurrentQualityLevel(): AdaptiveQualityLevel`**

- Returns current adaptive quality level configuration
- Includes point count, update frequency, and render quality

#### Quality Levels

```typescript
interface AdaptiveQualityLevel {
  level: number;
  pointCount: number;
  updateFrequency: number;
  renderQuality: number;
  description: string;
}
```

## Mathematical Utilities

### Phyllotactic Constants

```typescript
import { PHYLLOTACTIC_CONSTANTS, GOLDEN_ANGLE } from '../utils/phyllotactic-constants';

// Available constants:
PHYLLOTACTIC_CONSTANTS.GOLDEN_RATIO        // φ = (1 + √5) / 2
PHYLLOTACTIC_CONSTANTS.GOLDEN_ANGLE_DEGREES // ψ = 360° / φ²
PHYLLOTACTIC_CONSTANTS.GOLDEN_ANGLE_RADIANS // ψ in radians
PHYLLOTACTIC_CONSTANTS.VOGEL_SCALING_FACTOR // Scaling factor for Vogel's model
```

### Spiral Calculations

```typescript
import { calculateSpiralPosition, generatePhyllotacticPattern } from '../utils/spiral-calculations';

// Calculate individual spiral position
const position = calculateSpiralPosition(index, rotationAngle, config);

// Generate complete phyllotactic pattern
const pattern = generatePhyllotacticPattern(pointCount, config, rotationAngle);
```

### Color Generation

```typescript
import { generateGoldenColor } from '../utils/phyllotactic-colors';

const color = generateGoldenColor(index, {
  baseHue: 0,
  saturation: 0.7,
  lightness: 0.5,
  hueOffset: 0,
});
```

## Demo Components

### StroboscopicDemo

```typescript
import { StroboscopicDemo } from '../components/StroboscopicDemo';

// Features:
// - Real-time stroboscopic calculations
// - Interactive parameter controls
// - Performance monitoring
// - Visual feedback
```

### AdvancedPatternDemo

```typescript
import { AdvancedPatternDemo } from '../components/AdvancedPatternDemo';

// Features:
// - Multiple pattern types
// - Real-time switching
// - Parameter adjustment
// - Performance metrics
```

### Phyllotactic3DDemo

```typescript
import { Phyllotactic3DDemo } from '../components/Phyllotactic3DDemo';

// Features:
// - 3D spiral generation
// - Multi-axis rotation
// - Spherical projection
// - 3D stroboscopic effects
```

### PerformanceDemo

```typescript
import { PerformanceDemo } from '../components/PerformanceDemo';

// Features:
// - Adaptive quality demonstration
// - Spatial culling visualization
// - LOD optimization
// - Performance metrics
```

### EnhancedIntegrationDemo

```typescript
import { EnhancedIntegrationDemo } from '../components/EnhancedIntegrationDemo';

// Features:
// - All features integrated
// - 2D/3D mode switching
// - Comprehensive monitoring
// - Unified configuration
```

## Type Definitions

### Core Types

```typescript
interface AnimationConfig {
  frameRate: number;
  maxFPS: number;
  enableVSync: boolean;
  enablePerformanceMonitoring: boolean;
}

interface AnimationState {
  isRunning: boolean;
  frameCount: number;
  lastFrameTime: number;
  deltaTime: number;
  fps: number;
  averageFPS: number;
  performanceMetrics: PerformanceMetrics;
}

interface AnimationCallbacks {
  onFrameStart?: (currentTime: number) => void;
  onUpdate?: (deltaTime: number, frameCount: number) => void;
  onRender?: (deltaTime: number, frameCount: number) => void;
  onFrameEnd?: (currentTime: number, frameCount: number) => void;
}

interface PerformanceStats {
  currentFPS: number;
  averageFPS: number;
  frameCount: number;
  frameTime: number;
  renderTime: number;
  updateTime: number;
  isRunning: boolean;
}
```

### Spiral Configuration

```typescript
interface SpiralConfig {
  baseRadius: number;
  growthFactor: number;
  centerX: number;
  centerY: number;
  scalingFactor?: number;
}

interface ColorConfig {
  baseHue: number;
  saturation: number;
  lightness: number;
  hueOffset?: number;
}
```

## Error Handling

### Common Errors

**Animation Loop Errors**

```typescript
// Safety checks prevent infinite loops
if (frameCount > maxFramesPerSecond) {
  console.warn("Frame count exceeded safety limit, stopping animation");
  stop();
}
```

**Performance Warnings**

```typescript
// Performance monitoring with warnings
if (fps < targetFPS * 0.8) {
  console.warn("Performance below target, reducing quality");
  adjustQualityLevel();
}
```

**Configuration Validation**

```typescript
// Validate configuration parameters
if (pointCount > maxPoints) {
  throw new Error(`Point count ${pointCount} exceeds maximum ${maxPoints}`);
}
```

## Best Practices

### 1. Performance Optimization

- Use adaptive quality for large point sets
- Enable spatial culling for better performance
- Monitor FPS and adjust parameters accordingly
- Use LOD for distant objects

### 2. Memory Management

- Clean up animation loops on component unmount
- Use efficient data structures for point storage
- Implement proper garbage collection
- Monitor memory usage with performance metrics

### 3. Mathematical Accuracy

- Always use precise golden angle calculations
- Validate stroboscopic effect parameters
- Ensure proper coordinate transformations
- Test edge cases and boundary conditions

### 4. User Experience

- Provide real-time performance feedback
- Allow parameter adjustment during animation
- Show mathematical information and status
- Implement smooth transitions between modes

## Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features

- `requestAnimationFrame`
- `performance.now()`
- Canvas 2D Context
- ES2020+ features

### Fallbacks

- Automatic quality reduction for older browsers
- Graceful degradation for unsupported features
- Performance monitoring with warnings
- Alternative rendering methods

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { StroboscopicEngine } from '../utils/animation/StroboscopicEngine';

describe('StroboscopicEngine', () => {
  it('should calculate stroboscopic effects correctly', () => {
    const engine = new StroboscopicEngine();
    const result = engine.calculateStroboscopicEffect(16.67);
    expect(result.isStroboscopic).toBeDefined();
  });
});
```

### Integration Tests

```typescript
import { render } from '@solidjs/testing-library';
import { StroboscopicDemo } from '../components/StroboscopicDemo';

describe('StroboscopicDemo', () => {
  it('should render without errors', () => {
    render(() => <StroboscopicDemo />);
    // Test implementation
  });
});
```

## Contributing

When contributing to the animation utilities:

1. Maintain mathematical accuracy
2. Follow performance optimization guidelines
3. Include comprehensive tests
4. Update documentation
5. Ensure cross-browser compatibility

For more information, see the [Contributing Guide](../../CONTRIBUTING.md).
