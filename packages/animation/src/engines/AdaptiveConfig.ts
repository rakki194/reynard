/**
 * 🦊 Adaptive Animation Configuration
 * Default configuration for adaptive animation engine
 */

import type { AnimationConfig } from '../types';

export interface AdaptiveConfig extends AnimationConfig {
  targetFPS: number;
  qualityLevels: number[];
  adaptationThreshold: number;
}

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  frameRate: 60,
  maxFPS: 120,
  enableVSync: true,
  enablePerformanceMonitoring: true,
  targetFPS: 60,
  qualityLevels: [1, 0.75, 0.5, 0.25], // Quality multipliers
  adaptationThreshold: 5, // FPS below target for this many frames
};