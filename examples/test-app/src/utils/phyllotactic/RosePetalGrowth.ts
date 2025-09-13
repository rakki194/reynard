/**
 * 🌹 Rose Petal Growth Animation System
 * Orchestrates beautiful organic rose petal growth patterns using phyllotactic mathematics
 */

import type { RosePetal, RosePetalConfig } from './RosePetalTypes';
import { RosePetalFactory } from './RosePetalFactory';
import { RosePetalAnimator } from './RosePetalAnimator';

export { type RosePetal, type RosePetalConfig } from './RosePetalTypes';

export class RosePetalGrowthSystem {
  private config: RosePetalConfig;
  private petals: RosePetal[] = [];
  private isGrowing: boolean = false;
  private factory: RosePetalFactory;
  private animator: RosePetalAnimator;

  constructor(config: Partial<RosePetalConfig> = {}) {
    this.config = {
      petalCount: 200,
      goldenAngle: 137.5,
      centerX: 400,
      centerY: 300,
      baseRadius: 20,
      growthSpeed: 0.02,
      maxPetalSize: 40,
      colorVariation: 0.3,
      petalLayers: 3,
      animationSpeed: 1.0,
      ...config
    };
    
    this.factory = new RosePetalFactory(this.config);
    this.animator = new RosePetalAnimator(this.config);
  }

  /**
   * Initialize the rose with a bud
   */
  initializeRose(): void {
    this.petals = [];
    this.isGrowing = true;
    this.animator.reset();
    this.petals = this.factory.createBudPetals();
  }

  /**
   * Update the rose growth animation
   */
  update(deltaTime: number): void {
    if (!this.isGrowing) return;

    // Update existing petals
    this.animator.updatePetals(this.petals, deltaTime);

    // Add new petals based on growth phase
    this.addNewPetals();
  }

  /**
   * Add new petals based on growth phase
   */
  private addNewPetals(): void {
    const currentPetalCount = this.petals.length;
    const targetPetalCount = this.animator.getTargetPetalCount();
    
    if (currentPetalCount < targetPetalCount) {
      const newPetalCount = Math.min(3, targetPetalCount - currentPetalCount);
      
      for (let i = 0; i < newPetalCount; i++) {
        const shape = this.factory.determinePetalShape(currentPetalCount + i);
        this.petals.push(this.factory.createPetal(currentPetalCount + i, shape));
      }
    }
  }

  /**
   * Get current petals for rendering
   */
  getPetals(): RosePetal[] {
    return this.petals;
  }

  /**
   * Get current growth phase
   */
  getGrowthPhase(): string {
    return this.animator.getGrowthPhase();
  }

  /**
   * Get current time
   */
  getTime(): number {
    return this.animator.getTime();
  }

  /**
   * Start growth animation
   */
  startGrowth(): void {
    this.isGrowing = true;
  }

  /**
   * Stop growth animation
   */
  stopGrowth(): void {
    this.isGrowing = false;
  }

  /**
   * Reset the rose to initial state
   */
  reset(): void {
    this.initializeRose();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RosePetalConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.factory.updateConfig(this.config);
    this.animator.updateConfig(this.config);
  }
}