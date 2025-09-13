/**
 * 🦊 3D Phyllotactic Configuration
 * Configuration interfaces and types for 3D phyllotactic systems
 */

export interface Phyllotactic3DConfig {
  pointCount: number;
  baseRadius: number;
  height: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  // 3D specific parameters
  spiralPitch: number;
  verticalGrowth: number;
  enableSphericalProjection: boolean;
  sphereRadius: number;
  // Animation parameters
  rotationSpeedX: number;
  rotationSpeedY: number;
  rotationSpeedZ: number;
  // Stroboscopic parameters
  enableStroboscopic3D: boolean;
  stroboscopicThreshold: number;
}

export interface Phyllotactic3DPoint {
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

export interface RotationState {
  x: number;
  y: number;
  z: number;
}

export interface PerformanceMetrics {
  complexity: number;
  renderingCost: number;
  memoryUsage: number;
  stroboscopicOverhead: number;
}

export const DEFAULT_3D_CONFIG: Phyllotactic3DConfig = {
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
};
