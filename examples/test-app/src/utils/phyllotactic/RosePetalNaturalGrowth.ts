/**
 * 🌹 Natural Rose Petal Growth System
 * Implements biologically-accurate petal growth and unfolding mechanics
 * Based on real rose anatomy: 5-petal bundles, lobe separation, sepal visibility
 */

import { type RosePetal, type RosePetalConfig } from "./RosePetalTypes";

export class RosePetalNaturalGrowth {
  private config: RosePetalConfig;
  private time: number = 0;

  constructor(config: RosePetalConfig) {
    this.config = config;
  }

  /**
   * Update petal with natural growth mechanics
   */
  updatePetal(petal: RosePetal, deltaTime: number): void {
    this.time += deltaTime;

    // Determine which growth mode to use
    switch (this.config.growthMode) {
      case "natural":
        this.updateNaturalGrowth(petal, deltaTime);
        break;
      case "hybrid":
        this.updateHybridGrowth(petal, deltaTime);
        break;
      case "gaussian":
      default:
        this.updateGaussianGrowth(petal, deltaTime);
        break;
    }

    // Update common properties
    this.updateCommonProperties(petal, deltaTime);
  }

  /**
   * Natural growth: Realistic petal unfolding with lobe separation
   */
  private updateNaturalGrowth(petal: RosePetal, deltaTime: number): void {
    // Calculate bundle-based growth timing
    const bundleDelay = petal.petalBundle * this.config.bundleGrowthDelay;
    const bundleTime = Math.max(0, this.time - bundleDelay);

    // Phase 1: Petal emerges from bud (closed -> unfolding)
    if (bundleTime < 2.0) {
      petal.unfoldPhase = "closed";
      petal.naturalGrowthProgress = Math.min(1, bundleTime / 2.0);
      petal.lobeSeparation = 0;
    }
    // Phase 2: Petal unfolds and lobes separate (unfolding -> open)
    else if (bundleTime < 4.0) {
      petal.unfoldPhase = "unfolding";
      const unfoldProgress = (bundleTime - 2.0) / 2.0;
      petal.naturalGrowthProgress =
        0.3 + 0.4 * this.easeOutQuart(unfoldProgress);
      petal.lobeSeparation = this.easeInOutCubic(unfoldProgress);
    }
    // Phase 3: Petal reaches full maturity (open -> mature)
    else {
      petal.unfoldPhase = "mature";
      const matureProgress = Math.min(1, (bundleTime - 4.0) / 1.0);
      petal.naturalGrowthProgress =
        0.7 + 0.3 * this.easeOutCubic(matureProgress);
      petal.lobeSeparation = 1.0;
    }

    // Update size based on natural growth
    const sizeProgress = this.calculateNaturalSizeProgress(petal);
    petal.size = 2 + (this.config.maxPetalSize - 2) * sizeProgress;

    // Update scale with natural unfolding
    petal.scale = this.calculateNaturalScale(petal);

    // Update opacity with natural emergence
    petal.opacity = this.calculateNaturalOpacity(petal);
  }

  /**
   * Hybrid growth: Combines natural unfolding with smooth gaussian appearance
   */
  private updateHybridGrowth(petal: RosePetal, _deltaTime: number): void {
    // Use natural growth for structure
    this.updateNaturalGrowth(petal, _deltaTime);

    // Apply gaussian smoothing to the appearance
    const gaussianProgress = this.easeOutCubic(petal.growthProgress);
    const naturalProgress = petal.naturalGrowthProgress;

    // Blend natural and gaussian for smooth appearance
    petal.scale = 0.1 + 0.9 * (0.3 * gaussianProgress + 0.7 * naturalProgress);
    petal.opacity =
      0.3 + 0.7 * (0.4 * gaussianProgress + 0.6 * naturalProgress);
  }

  /**
   * Original gaussian growth (preserved for compatibility)
   */
  private updateGaussianGrowth(petal: RosePetal, _deltaTime: number): void {
    petal.growthProgress = Math.min(
      1,
      petal.growthProgress + this.config.growthSpeed * _deltaTime,
    );

    const growthCurve = this.easeOutCubic(petal.growthProgress);
    petal.size = 2 + (this.config.maxPetalSize - 2) * growthCurve;
    petal.scale = 0.1 + 0.9 * growthCurve;
    petal.opacity = 0.3 + 0.7 * growthCurve;

    // Set default values for natural properties
    petal.unfoldPhase = "mature";
    petal.lobeSeparation = 1.0;
    petal.naturalGrowthProgress = petal.growthProgress;
  }

  /**
   * Update properties common to all growth modes
   */
  private updateCommonProperties(petal: RosePetal, deltaTime: number): void {
    // Age the petal
    petal.age += deltaTime;

    // Gentle rotation with natural variation
    const rotationSpeed = 0.05 + Math.sin(petal.id * 0.1) * 0.03;
    petal.rotation += deltaTime * rotationSpeed;

    // Subtle position variation for organic movement
    const timeVariation = Math.sin(this.time * 0.5 + petal.id * 0.1) * 0.5;
    petal.x =
      this.config.centerX +
      Math.cos(petal.angle) * (petal.radius + timeVariation);
    petal.y =
      this.config.centerY +
      Math.sin(petal.angle) * (petal.radius + timeVariation);

    // Update sepal visibility based on petal position
    petal.sepalVisible = this.shouldShowSepal(petal);
  }

  /**
   * Calculate natural size progress based on unfold phase
   */
  private calculateNaturalSizeProgress(petal: RosePetal): number {
    switch (petal.unfoldPhase) {
      case "closed":
        return petal.naturalGrowthProgress * 0.3; // Small bud size
      case "unfolding":
        return 0.3 + petal.naturalGrowthProgress * 0.5; // Growing during unfold
      case "open":
        return 0.8 + petal.naturalGrowthProgress * 0.2; // Nearly full size
      case "mature":
        return 1.0; // Full size
      default:
        return petal.naturalGrowthProgress;
    }
  }

  /**
   * Calculate natural scale with unfolding mechanics
   */
  private calculateNaturalScale(petal: RosePetal): number {
    const baseScale = 0.1 + 0.9 * petal.naturalGrowthProgress;

    // Add unfolding effect - petals appear to "unroll" from the center
    const unfoldEffect =
      petal.unfoldPhase === "unfolding"
        ? Math.sin(petal.naturalGrowthProgress * Math.PI) * 0.1
        : 0;

    return Math.min(1.0, baseScale + unfoldEffect);
  }

  /**
   * Calculate natural opacity with realistic emergence
   */
  private calculateNaturalOpacity(petal: RosePetal): number {
    const ageRatio = petal.age / petal.maxAge;

    // Base opacity from growth progress
    let baseOpacity = 0.2 + 0.8 * petal.naturalGrowthProgress;

    // Add phase-specific opacity effects
    switch (petal.unfoldPhase) {
      case "closed":
        baseOpacity *= 0.6; // Bud is less visible
        break;
      case "unfolding":
        baseOpacity *= 0.8 + 0.2 * petal.lobeSeparation; // Gradually becomes visible
        break;
      case "open":
      case "mature":
        baseOpacity *= 1.0; // Full visibility
        break;
    }

    // Wilting effect
    if (ageRatio > 0.7) {
      baseOpacity *= 1 - (ageRatio - 0.7) / 0.3;
    }

    return Math.max(0, Math.min(1, baseOpacity));
  }

  /**
   * Determine if sepal should be visible (green points alternating with petals)
   */
  private shouldShowSepal(petal: RosePetal): boolean {
    if (!this.config.sepalVisibility) return false;

    // Sepals are visible when petals are in early growth phases
    // and positioned to show the green points between petal bundles
    return (
      petal.unfoldPhase === "closed" ||
      (petal.unfoldPhase === "unfolding" && petal.naturalGrowthProgress < 0.5)
    );
  }

  /**
   * Easing functions for natural growth curves
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RosePetalConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
