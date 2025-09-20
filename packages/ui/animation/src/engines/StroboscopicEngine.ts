/**
 * 🦊 Advanced Stroboscopic Animation Engine
 * Implements cutting-edge stroboscopic effects based on latest research
 * Based on "The Mathematics of Phyllotactic Spirals and Their Animated Perception"
 */

import type { StroboscopicConfig, StroboscopicState } from "../types";

export class StroboscopicEngine {
  private config: StroboscopicConfig;
  private state: StroboscopicState;
  private frameHistory: number[] = [];
  private readonly maxFrameHistory = 10;

  constructor(config: Partial<StroboscopicConfig> = {}) {
    this.config = {
      frameRate: 60,
      rotationSpeed: 1.0,
      goldenAngle: 137.5, // Golden angle in degrees
      stroboscopicThreshold: 0.1,
      enableTemporalAliasing: true,
      enableMorphingEffects: true,
      ...config,
    };

    this.state = {
      isStroboscopic: false,
      stroboscopicPhase: 0,
      apparentMotion: "frozen",
      temporalAliasing: 0,
      morphingIntensity: 0,
    };
  }

  /**
   * Calculate stroboscopic effect based on rotation speed and frame rate
   * Implements the mathematical model from the research paper
   */
  calculateStroboscopicEffect(deltaTime: number): StroboscopicState {
    // Use actual deltaTime for frame-accurate calculations
    const frameTime = deltaTime;
    const angularVelocity = this.config.rotationSpeed * (Math.PI / 180); // Convert to rad/s
    const anglePerFrame = angularVelocity * frameTime;

    // Calculate stroboscopic phase
    const stroboscopicPhase = (anglePerFrame / ((this.config.goldenAngle * Math.PI) / 180)) % 1;

    // Determine if stroboscopic effect is active
    const isStroboscopic = Math.abs(stroboscopicPhase - 0.5) < this.config.stroboscopicThreshold;

    // Calculate apparent motion
    let apparentMotion: StroboscopicState["apparentMotion"] = "frozen";
    if (isStroboscopic) {
      if (stroboscopicPhase > 0.5) {
        apparentMotion = "growing";
      } else if (stroboscopicPhase < 0.5) {
        apparentMotion = "shrinking";
      } else {
        apparentMotion = "frozen";
      }
    }

    // Calculate temporal aliasing effect
    const temporalAliasing = this.config.enableTemporalAliasing
      ? Math.sin(stroboscopicPhase * Math.PI * 2) * 0.5 + 0.5
      : 0;

    // Calculate morphing intensity for advanced effects
    const morphingIntensity = this.config.enableMorphingEffects
      ? Math.abs(Math.sin(stroboscopicPhase * Math.PI * 4)) * 0.3
      : 0;

    this.state = {
      isStroboscopic,
      stroboscopicPhase,
      apparentMotion,
      temporalAliasing,
      morphingIntensity,
    };

    return this.state;
  }

  /**
   * Apply stroboscopic transformation to spiral points
   * Implements the morphing effects from the research
   */
  applyStroboscopicTransform(
    points: Array<{ x: number; y: number; radius: number; angle: number }>,
    deltaTime: number
  ): Array<{
    x: number;
    y: number;
    radius: number;
    angle: number;
    stroboscopicIntensity: number;
  }> {
    const stroboscopicState = this.calculateStroboscopicEffect(deltaTime);

    return points.map((point, index) => {
      let transformedPoint = { ...point, stroboscopicIntensity: 0 };

      if (stroboscopicState.isStroboscopic) {
        // Apply morphing transformation based on research findings
        const morphingFactor = stroboscopicState.morphingIntensity * Math.sin(index * 0.1);

        // Radial morphing effect
        const radialMorphing = 1 + morphingFactor * 0.2;
        transformedPoint.radius *= radialMorphing;

        // Angular morphing effect
        const angularMorphing = morphingFactor * 0.1;
        transformedPoint.angle += angularMorphing;

        // Recalculate position
        transformedPoint.x = Math.cos(transformedPoint.angle) * transformedPoint.radius;
        transformedPoint.y = Math.sin(transformedPoint.angle) * transformedPoint.radius;

        // Set stroboscopic intensity for visual effects
        transformedPoint.stroboscopicIntensity = stroboscopicState.temporalAliasing;
      }

      return transformedPoint;
    });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<StroboscopicConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current state
   */
  getState(): StroboscopicState {
    return { ...this.state };
  }

  /**
   * Calculate optimal rotation speed for stroboscopic effect
   * Based on the research paper's mathematical model
   */
  calculateOptimalRotationSpeed(frameRate: number = 60): number {
    const frameTime = 1000 / frameRate;
    const goldenAngleRad = (this.config.goldenAngle * Math.PI) / 180;
    const optimalSpeed = (goldenAngleRad / frameTime) * (180 / Math.PI); // Convert back to degrees
    return optimalSpeed;
  }

  /**
   * Enable advanced morphing effects based on research
   */
  enableAdvancedMorphing(): void {
    this.config.enableMorphingEffects = true;
    this.config.enableTemporalAliasing = true;
  }

  /**
   * Disable morphing effects for performance
   */
  disableAdvancedMorphing(): void {
    this.config.enableMorphingEffects = false;
    this.config.enableTemporalAliasing = false;
  }
}
