/**
 * 🦊 Phyllotactic Game Configuration
 * Configuration management for phyllotactic game logic
 */

import type { GameConfig } from "./PhyllotacticSpiralLogic";

export function createDefaultConfig(): GameConfig {
  return {
    pointCount: 200,
    rotationSpeed: 1.0,
    spiralGrowth: 2.5,
    baseRadius: 20,
    colorSaturation: 0.3,
    colorLightness: 0.7,
    // Additional phyllotactic parameters
    angleFraction: 0.382, // Golden angle fraction
    step: 0.5,
    dotSize: 2.0,
    rotationFraction: 0.382,
    lockRotation: false,
    // Line controls
    enableLine1: false,
    showLines1: false,
    lineStep1: 5,
    fillGaps1: false,
    enableLine2: false,
    showLines2: false,
    lineStep2: 8,
    fillGaps2: false,
  };
}

export function createDefaultAnimationConfig() {
  return {
    frameRate: 60,
    maxFPS: 160,
    enableVSync: true,
    enablePerformanceMonitoring: true,
  };
}
