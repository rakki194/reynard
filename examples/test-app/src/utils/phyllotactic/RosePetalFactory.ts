/**
 * 🌹 Rose Petal Factory
 * Creates and manages individual rose petals with phyllotactic positioning
 */

import type { PetalShape, RosePetal, RosePetalConfig } from "./RosePetalTypes";

export class RosePetalFactory {
  private config: RosePetalConfig;

  constructor(config: RosePetalConfig) {
    this.config = config;
  }

  /**
   * Create initial bud petals
   */
  createBudPetals(): RosePetal[] {
    const budPetalCount = Math.floor(this.config.petalCount * 0.1);
    const petals: RosePetal[] = [];

    for (let i = 0; i < budPetalCount; i++) {
      petals.push(this.createPetal(i, "bud"));
    }

    return petals;
  }

  /**
   * Create a new petal at the specified index
   */
  createPetal(
    index: number,
    shape: "inner" | "middle" | "outer" | "bud" = "inner",
  ): RosePetal {
    const angle = index * this.config.goldenAngle * (Math.PI / 180);
    const radius = this.calculatePetalRadius(index);

    // Calculate which 5-petal bundle this belongs to
    const petalBundle = Math.floor(index / 5);

    return {
      id: index,
      x: this.config.centerX + Math.cos(angle) * radius,
      y: this.config.centerY + Math.sin(angle) * radius,
      angle,
      radius,
      size: 2,
      growthProgress: 0,
      color: this.generatePetalColor(index, shape),
      petalShape: shape as PetalShape,
      age: 0,
      maxAge: 100 + Math.random() * 50,
      rotation: Math.random() * Math.PI * 2,
      scale: 0.1,
      opacity: 0.8,
      // Natural growth properties
      unfoldPhase: "closed",
      lobeSeparation: 0,
      petalBundle,
      sepalVisible: false,
      naturalGrowthProgress: 0,
    };
  }

  /**
   * Calculate petal radius based on index
   */
  private calculatePetalRadius(index: number): number {
    const normalizedIndex = index / this.config.petalCount;
    const baseRadius = this.config.baseRadius;
    const maxRadius = baseRadius * 3;

    const spiralRadius =
      baseRadius + (maxRadius - baseRadius) * normalizedIndex;
    const variation = 0.8 + Math.random() * 0.4;

    return spiralRadius * variation;
  }

  /**
   * Determine petal shape based on position
   */
  determinePetalShape(index: number): "inner" | "middle" | "outer" {
    const normalizedIndex = index / this.config.petalCount;

    if (normalizedIndex < 0.3) return "inner";
    if (normalizedIndex < 0.7) return "middle";
    return "outer";
  }

  /**
   * Generate petal color based on position and shape
   */
  private generatePetalColor(
    _index: number,
    shape: "inner" | "middle" | "outer" | "bud",
  ): string {
    let baseHue: number;
    let saturation: number;
    let lightness: number;

    switch (shape) {
      case "bud":
        baseHue = 320 + Math.random() * 20;
        saturation = 60 + Math.random() * 20;
        lightness = 40 + Math.random() * 20;
        break;
      case "inner":
        baseHue = 320 + Math.random() * 30;
        saturation = 70 + Math.random() * 20;
        lightness = 50 + Math.random() * 20;
        break;
      case "middle":
        baseHue = 340 + Math.random() * 20;
        saturation = 80 + Math.random() * 15;
        lightness = 60 + Math.random() * 15;
        break;
      case "outer":
        baseHue = 0 + Math.random() * 20;
        saturation = 85 + Math.random() * 10;
        lightness = 65 + Math.random() * 15;
        break;
    }

    const hueVariation =
      (Math.random() - 0.5) * this.config.colorVariation * 60;
    const finalHue = (baseHue + hueVariation + 360) % 360;

    return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: RosePetalConfig): void {
    this.config = config;
  }
}
