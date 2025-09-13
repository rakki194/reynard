/**
 * 🌹 Rose Petal Animator
 * Handles animation and growth logic for rose petals
 */

import type { RosePetal, RosePetalConfig, GrowthPhase } from './RosePetalTypes';

export class RosePetalAnimator {
  private config: RosePetalConfig;
  private time: number = 0;
  private growthPhase: GrowthPhase = 'bud';

  constructor(config: RosePetalConfig) {
    this.config = config;
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
   * Update individual petal
   */
  private updatePetal(petal: RosePetal, deltaTime: number): void {
    // Increase growth progress
    petal.growthProgress = Math.min(1, petal.growthProgress + this.config.growthSpeed * deltaTime);
    
    // Update size based on growth progress
    const growthCurve = this.easeOutCubic(petal.growthProgress);
    petal.size = 2 + (this.config.maxPetalSize - 2) * growthCurve;
    
    // Update scale for smooth appearance
    petal.scale = 0.1 + 0.9 * growthCurve;
    
    // Update opacity based on age and growth phase
    petal.opacity = this.calculatePetalOpacity(petal);
    
    // Age the petal
    petal.age += deltaTime;
    
    // Gentle rotation
    petal.rotation += deltaTime * 0.1;
    
    // Subtle position variation for organic movement
    const timeVariation = Math.sin(this.time * 0.5 + petal.id * 0.1) * 0.5;
    petal.x = this.config.centerX + Math.cos(petal.angle) * (petal.radius + timeVariation);
    petal.y = this.config.centerY + Math.sin(petal.angle) * (petal.radius + timeVariation);
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
   * Calculate petal opacity based on age and growth phase
   */
  private calculatePetalOpacity(petal: RosePetal): number {
    const ageRatio = petal.age / petal.maxAge;
    const growthOpacity = 0.3 + 0.7 * this.easeOutCubic(petal.growthProgress);
    
    if (this.growthPhase === 'wilting' && ageRatio > 0.7) {
      return growthOpacity * (1 - (ageRatio - 0.7) / 0.3);
    }
    
    return growthOpacity;
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