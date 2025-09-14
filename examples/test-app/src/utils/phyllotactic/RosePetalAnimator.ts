/**
 * 🌹 Rose Petal Animator
 * Handles animation and growth logic for rose petals
 */

import type { RosePetal, RosePetalConfig, GrowthPhase } from './RosePetalTypes';
import { RosePetalNaturalGrowth } from './RosePetalNaturalGrowth';

export class RosePetalAnimator {
  private config: RosePetalConfig;
  private time: number = 0;
  private growthPhase: GrowthPhase = 'bud';
  private naturalGrowth: RosePetalNaturalGrowth;

  constructor(config: RosePetalConfig) {
    this.config = config;
    this.naturalGrowth = new RosePetalNaturalGrowth(config);
  }

  /**
   * Update petal animations
   */
  updatePetals(petals: RosePetal[], deltaTime: number): void {
    this.time += deltaTime * this.config.animationSpeed;
    this.updateGrowthPhase();
    
    petals.forEach(petal => {
      this.updatePetal(petal, deltaTime);
    });
  }

  /**
   * Update individual petal using natural growth system
   */
  private updatePetal(petal: RosePetal, deltaTime: number): void {
    // Use the natural growth system for all growth modes
    this.naturalGrowth.updatePetal(petal, deltaTime);
    
    // Update growth progress for compatibility
    petal.growthProgress = Math.min(1, petal.growthProgress + this.config.growthSpeed * deltaTime);
  }

  /**
   * Update the current growth phase
   */
  private updateGrowthPhase(): void {
    const totalTime = this.config.petalCount * 0.1;
    
    if (this.time < totalTime * 0.3) {
      this.growthPhase = 'bud';
    } else if (this.time < totalTime * 0.7) {
      this.growthPhase = 'blooming';
    } else if (this.time < totalTime * 0.9) {
      this.growthPhase = 'full';
    } else {
      this.growthPhase = 'wilting';
    }
  }

  /**
   * Update configuration for both animator and natural growth system
   */
  updateConfig(config: Partial<RosePetalConfig>): void {
    this.config = { ...this.config, ...config };
    this.naturalGrowth.updateConfig(this.config);
  }

  /**
   * Get target petal count based on growth phase
   */
  getTargetPetalCount(): number {
    switch (this.growthPhase) {
      case 'bud':
        return Math.floor(this.config.petalCount * 0.1);
      case 'blooming':
        return Math.floor(this.config.petalCount * 0.6);
      case 'full':
        return this.config.petalCount;
      case 'wilting':
        return Math.floor(this.config.petalCount * 0.8);
      default:
        return this.config.petalCount;
    }
  }

  /**
   * Easing function for smooth growth
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Get current growth phase
   */
  getGrowthPhase(): GrowthPhase {
    return this.growthPhase;
  }

  /**
   * Get current time
   */
  getTime(): number {
    return this.time;
  }

  /**
   * Reset animation state
   */
  reset(): void {
    this.time = 0;
    this.growthPhase = 'bud';
  }

  /**
   * Update configuration
   */
  updateConfig(config: RosePetalConfig): void {
    this.config = config;
  }
}