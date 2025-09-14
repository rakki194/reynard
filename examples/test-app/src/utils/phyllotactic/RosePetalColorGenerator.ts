/**
 * 🌹 Rose Petal Color Generator
 * Generates beautiful organic colors for rose petals
 */

import type { PetalShape } from "./RosePetalTypes";

export class RosePetalColorGenerator {
  private colorVariation: number;

  constructor(colorVariation: number = 0.3) {
    this.colorVariation = colorVariation;
  }

  /**
   * Generate petal color based on position and shape
   */
  generatePetalColor(
    _index: number,
    shape: PetalShape,
    _totalPetals: number,
  ): string {
    let baseHue: number;
    let saturation: number;
    let lightness: number;

    switch (shape) {
      case "inner":
        baseHue = 320 + Math.random() * 30; // Deep pink to purple
        saturation = 70 + Math.random() * 20;
        lightness = 50 + Math.random() * 20;
        break;
      case "middle":
        baseHue = 340 + Math.random() * 20; // Pink to red
        saturation = 80 + Math.random() * 15;
        lightness = 60 + Math.random() * 15;
        break;
      case "outer":
        baseHue = 0 + Math.random() * 20; // Red to orange
        saturation = 85 + Math.random() * 10;
        lightness = 65 + Math.random() * 15;
        break;
    }

    // Add variation
    const hueVariation = (Math.random() - 0.5) * this.colorVariation * 60;
    const finalHue = (baseHue + hueVariation + 360) % 360;

    return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Update color variation
   */
  updateColorVariation(variation: number): void {
    this.colorVariation = variation;
  }
}
