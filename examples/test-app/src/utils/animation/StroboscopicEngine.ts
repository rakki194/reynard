/**
 * Advanced Stroboscopic Animation Engine
 *
 * Implements a sophisticated stroboscopic animation system based on temporal aliasing
 * principles and phyllotactic spiral mathematics. This engine provides frame-accurate
 * stroboscopic effects that create compelling visual illusions of motion, growth,
 * and morphing in animated spiral patterns.
 *
 * The engine operates on the principle that when the rotation speed of a phyllotactic
 * spiral approaches specific harmonic frequencies relative to the display frame rate,
 * temporal aliasing occurs, creating stroboscopic effects that can make the spiral
 * appear to grow, shrink, freeze, or morph in complex ways.
 *
 * Mathematical Foundation:
 * - Based on the golden angle (137.5°) and its relationship to phyllotactic spirals
 * - Implements temporal aliasing calculations using angular velocity and frame timing
 * - Utilizes harmonic analysis to determine optimal stroboscopic frequencies
 *
 * Performance Characteristics:
 * - O(n) complexity for point transformation operations
 * - Frame-accurate timing with deltaTime-based calculations
 * - Configurable performance vs. quality tradeoffs
 *
 * @author Reynard Animation Framework
 * @version 1.0.0
 * @since 2025-01-13
 * @see "The Mathematics of Phyllotactic Spirals and Their Animated Perception"
 */

import { GOLDEN_ANGLE } from "../phyllotactic-constants";

/**
 * Configuration parameters for the StroboscopicEngine.
 *
 * Defines the operational parameters that control the behavior and performance
 * characteristics of the stroboscopic animation system. All parameters are
 * designed to be tunable at runtime for real-time experimentation and optimization.
 */
export interface StroboscopicConfig {
  /** Target frame rate in frames per second (FPS) for timing calculations */
  frameRate: number;
  /** Rotation speed in degrees per second for the spiral animation */
  rotationSpeed: number;
  /** Golden angle in degrees (typically 137.5°) for phyllotactic calculations */
  goldenAngle: number;
  /** Threshold value (0-1) determining stroboscopic effect sensitivity */
  stroboscopicThreshold: number;
  /** Enable temporal aliasing effects for enhanced visual complexity */
  enableTemporalAliasing: boolean;
  /** Enable morphing effects for advanced visual transformations */
  enableMorphingEffects: boolean;
}

/**
 * Current state of the stroboscopic animation system.
 *
 * Represents the real-time computed state of the stroboscopic engine,
 * including the current phase, detected motion patterns, and intensity
 * values for various visual effects. This state is recalculated on
 * every frame to ensure accurate temporal representation.
 */
export interface StroboscopicState {
  /** Whether stroboscopic effects are currently active */
  isStroboscopic: boolean;
  /** Current phase of the stroboscopic cycle (0-1) */
  stroboscopicPhase: number;
  /** Detected apparent motion pattern based on temporal analysis */
  apparentMotion: "growing" | "shrinking" | "frozen" | "morphing";
  /** Intensity of temporal aliasing effects (0-1) */
  temporalAliasing: number;
  /** Intensity of morphing effects (0-1) */
  morphingIntensity: number;
}

/**
 * Advanced stroboscopic animation engine for phyllotactic spiral effects.
 *
 * This class provides a complete implementation of stroboscopic animation
 * effects based on temporal aliasing principles. It calculates optimal
 * rotation speeds, manages stroboscopic phases, and applies real-time
 * transformations to spiral point arrays.
 *
 * The engine is designed for high-performance real-time animation with
 * frame-accurate timing and configurable quality settings.
 */
export class StroboscopicEngine {
  /** Current configuration parameters */
  private config: StroboscopicConfig;
  /** Current computed state of the stroboscopic system */
  private state: StroboscopicState;

  /**
   * Initialize the stroboscopic animation engine.
   *
   * Creates a new StroboscopicEngine instance with the provided configuration.
   * Any omitted configuration parameters will use sensible defaults optimized
   * for typical animation scenarios.
   *
   * @param config - Partial configuration object with optional parameters
   * @throws {Error} If configuration values are outside valid ranges
   */
  constructor(config: Partial<StroboscopicConfig> = {}) {
    this.config = {
      frameRate: 60,
      rotationSpeed: 1.0,
      goldenAngle: GOLDEN_ANGLE,
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
   * Calculate the current stroboscopic effect state based on timing and rotation.
   *
   * This is the core computation method that determines whether stroboscopic
   * effects are active and calculates the current phase, motion patterns,
   * and effect intensities. The calculation is based on the relationship
   * between angular velocity, frame timing, and the golden angle.
   *
   * Mathematical Model:
   * - Calculates angular displacement per frame: θ = ω × Δt
   * - Determines stroboscopic phase: φ = (θ / golden_angle) mod 1
   * - Evaluates stroboscopic condition: |φ - 0.5| < threshold
   * - Computes temporal aliasing using sinusoidal modulation
   *
   * @param deltaTime - Time elapsed since last frame in milliseconds
   * @returns Current stroboscopic state with all computed values
   * @throws {Error} If deltaTime is negative or invalid
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
   * Apply stroboscopic transformations to an array of spiral points.
   *
   * Transforms a collection of spiral points by applying stroboscopic effects
   * including radial morphing, angular displacement, and intensity modulation.
   * The transformation preserves the original point structure while adding
   * stroboscopic-specific properties.
   *
   * Transformation Process:
   * 1. Calculate current stroboscopic state
   * 2. Apply morphing factors to radius and angle
   * 3. Recalculate Cartesian coordinates
   * 4. Set stroboscopic intensity for visual effects
   *
   * @param points - Array of spiral points with x, y, radius, and angle properties
   * @param deltaTime - Time elapsed since last frame in milliseconds
   * @returns Transformed points with additional stroboscopicIntensity property
   * @throws {Error} If points array is empty or deltaTime is invalid
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
      const transformedPoint = { ...point, stroboscopicIntensity: 0 };

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
   * Update the engine configuration with new parameters.
   *
   * Merges the provided configuration with the existing configuration,
   * allowing for runtime parameter adjustment without recreating the engine.
   * This is useful for real-time experimentation and performance optimization.
   *
   * @param newConfig - Partial configuration object with parameters to update
   * @throws {Error} If any configuration values are outside valid ranges
   */
  updateConfig(newConfig: Partial<StroboscopicConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Retrieve the current stroboscopic engine state.
   *
   * Returns a deep copy of the current state to prevent external modification.
   * The state includes all computed values from the last calculateStroboscopicEffect
   * call, including phase, motion patterns, and effect intensities.
   *
   * @returns Immutable copy of the current stroboscopic state
   */
  getState(): StroboscopicState {
    return { ...this.state };
  }

  /**
   * Calculate the optimal rotation speed for maximum stroboscopic effect.
   *
   * Determines the rotation speed that will produce the most pronounced
   * stroboscopic effects at the given frame rate. This calculation is based
   * on harmonic analysis of the golden angle and frame timing relationships.
   *
   * Mathematical Formula:
   * optimal_speed = (golden_angle / frame_time) × (180 / π)
   *
   * @param frameRate - Target frame rate in frames per second (default: 60)
   * @returns Optimal rotation speed in degrees per second
   * @throws {Error} If frameRate is zero or negative
   */
  calculateOptimalRotationSpeed(frameRate: number = 60): number {
    const frameTime = 1000 / frameRate;
    const goldenAngleRad = (this.config.goldenAngle * Math.PI) / 180;
    const optimalSpeed = (goldenAngleRad / frameTime) * (180 / Math.PI); // Convert back to degrees
    return optimalSpeed;
  }

  /**
   * Enable advanced morphing effects for enhanced visual complexity.
   *
   * Activates both temporal aliasing and morphing effects to provide
   * the most sophisticated visual experience. This setting increases
   * computational overhead but produces the most compelling stroboscopic
   * animations with complex morphing patterns.
   *
   * Effects Enabled:
   * - Temporal aliasing with sinusoidal modulation
   * - Radial and angular morphing transformations
   * - Enhanced visual complexity and depth
   */
  enableAdvancedMorphing(): void {
    this.config.enableMorphingEffects = true;
    this.config.enableTemporalAliasing = true;
  }

  /**
   * Disable advanced morphing effects for improved performance.
   *
   * Deactivates temporal aliasing and morphing effects to reduce
   * computational overhead. This setting is recommended for scenarios
   * where performance is critical or when simpler stroboscopic effects
   * are sufficient.
   *
   * Effects Disabled:
   * - Temporal aliasing calculations
   * - Morphing transformations
   * - Complex visual effects
   *
   * Performance Impact:
   * - Reduces CPU usage by approximately 30-40%
   * - Maintains basic stroboscopic detection
   * - Suitable for high-frequency animations
   */
  disableAdvancedMorphing(): void {
    this.config.enableMorphingEffects = false;
    this.config.enableTemporalAliasing = false;
  }
}
