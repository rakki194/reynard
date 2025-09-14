/**
 * 🦊 Phyllotactic Spiral Logic
 * Core logic for spiral generation and animation
 */

import {
  calculateSpiralPosition,
  generateGoldenColor,
  type SpiralConfig,
  type ColorConfig,
} from "../utils/phyllotacticMath";

export interface SpiralPoint {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export interface GameConfig {
  pointCount: number;
  rotationSpeed: number;
  spiralGrowth: number;
  baseRadius: number;
  colorSaturation: number;
  colorLightness: number;
  // Additional phyllotactic parameters
  angleFraction: number;
  step: number;
  dotSize: number;
  rotationFraction: number;
  lockRotation: boolean;
  // Line controls
  enableLine1: boolean;
  showLines1: boolean;
  lineStep1: number;
  fillGaps1: boolean;
  enableLine2: boolean;
  showLines2: boolean;
  lineStep2: number;
  fillGaps2: boolean;
}

export class PhyllotacticSpiralLogic {
  private config: GameConfig;

  constructor(config: GameConfig) {
    console.log(
      "🦊 PhyllotacticSpiralLogic: Constructor called with config",
      config,
    );
    this.config = config;
  }

  /**
   * Generate spiral color using golden angle distribution
   */
  generateSpiralColor(index: number): string {
    const colorConfig: ColorConfig = {
      baseHue: 0,
      saturation: this.config.colorSaturation,
      lightness: this.config.colorLightness,
    };

    const color = generateGoldenColor(index, colorConfig);
    const oklchString = `oklch(${color.lightness * 100}% ${color.saturation * 100}% ${color.hue})`;
    console.log(
      `🦊 PhyllotacticSpiralLogic: Generated color for index ${index}`,
      { colorConfig, color, oklchString },
    );
    return oklchString;
  }

  /**
   * Calculate spiral point position
   */
  calculateSpiralPointPosition(index: number, rotationAngle: number = 0) {
    const spiralConfig: SpiralConfig = {
      baseRadius: this.config.baseRadius,
      growthFactor: this.config.spiralGrowth,
      centerX: 400,
      centerY: 300,
    };

    return calculateSpiralPosition(index, rotationAngle, spiralConfig);
  }

  /**
   * Initialize spiral points
   */
  initializeSpiral(): SpiralPoint[] {
    console.log("🦊 PhyllotacticSpiralLogic: initializeSpiral called", {
      pointCount: this.config.pointCount,
    });
    const points: SpiralPoint[] = [];
    for (let i = 0; i < this.config.pointCount; i++) {
      const position = this.calculateSpiralPointPosition(i);
      const color = this.generateSpiralColor(i);
      points.push({
        id: i,
        x: position.x,
        y: position.y,
        color,
        size: this.config.dotSize,
      });
      if (i < 3) {
        // Log first few points for debugging
        console.log(`🦊 PhyllotacticSpiralLogic: Point ${i}`, {
          x: position.x,
          y: position.y,
          color,
        });
      }
    }
    console.log("🦊 PhyllotacticSpiralLogic: Spiral initialized", {
      totalPoints: points.length,
    });
    return points;
  }

  /**
   * Update spiral points with new rotation
   */
  updateSpiralPoints(
    points: SpiralPoint[],
    rotationAngle: number,
  ): SpiralPoint[] {
    return points.map((point, index) => {
      const newPosition = this.calculateSpiralPointPosition(
        index,
        rotationAngle,
      );
      return {
        ...point,
        x: newPosition.x,
        y: newPosition.y,
      };
    });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GameConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Check if any parameters that affect spiral generation have changed
    const needsRegeneration =
      newConfig.pointCount !== undefined ||
      newConfig.spiralGrowth !== undefined ||
      newConfig.baseRadius !== undefined ||
      newConfig.dotSize !== undefined ||
      newConfig.colorSaturation !== undefined ||
      newConfig.colorLightness !== undefined ||
      newConfig.angleFraction !== undefined ||
      newConfig.step !== undefined;

    if (needsRegeneration) {
      console.log(
        "🦊 PhyllotacticSpiralLogic: Config changed, regenerating spiral",
        {
          oldConfig,
          newConfig: this.config,
          changedParams: Object.keys(newConfig),
        },
      );
      // The spiral will be regenerated when initializeSpiral is called
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): GameConfig {
    return { ...this.config };
  }
}
