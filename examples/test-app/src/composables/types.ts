/**
 * 🦊 Type Definitions
 * Shared types for the enhanced engines system
 */

export interface Point {
  x: number;
  y: number;
  z?: number;
  color?: string;
  size?: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
}

export interface StroboscopicState {
  isActive: boolean;
  frequency: number;
  phase: number;
  intensity: number;
}

export interface QualityLevel {
  level: 'low' | 'medium' | 'high' | 'ultra';
  pointCount: number;
  renderDistance: number;
  effectsEnabled: boolean;
}
