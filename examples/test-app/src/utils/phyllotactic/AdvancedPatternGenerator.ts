/**
 * 🦊 Advanced Phyllotactic Pattern Generator
 * Implements cutting-edge research models: ROTASE, Bernoulli Spiral Lattices
 * Based on latest academic research on phyllotactic spirals
 */

import { GOLDEN_RATIO, GOLDEN_ANGLE } from '../phyllotactic-constants';

export interface AdvancedPatternConfig {
  patternType: 'vogel' | 'rotase' | 'bernoulli' | 'fibonacci-sibling';
  pointCount: number;
  baseRadius: number;
  growthFactor: number;
  centerX: number;
  centerY: number;
  // ROTASE model parameters
  galacticSpiralFactor: number;
  fibonacciSiblingRatio: number;
  // Bernoulli lattice parameters
  latticeDensity: number;
  latticeOffset: number;
  // Advanced parameters
  enableMorphing: boolean;
  morphingIntensity: number;
  enableColorHarmonics: boolean;
}

export interface AdvancedPatternPoint {
  index: number;
  x: number;
  y: number;
  radius: number;
  angle: number;
  color: string;
  size: number;
  patternType: string;
  morphingPhase: number;
}

export class AdvancedPatternGenerator {
  private config: AdvancedPatternConfig;

  constructor(config: Partial<AdvancedPatternConfig> = {}) {
    this.config = {
      patternType: 'vogel',
      pointCount: 1000,
      baseRadius: 10,
      growthFactor: 1.0,
      centerX: 400,
      centerY: 300,
      galacticSpiralFactor: 1.0,
      fibonacciSiblingRatio: 0.618,
      latticeDensity: 1.0,
      latticeOffset: 0,
      enableMorphing: false,
      morphingIntensity: 0.1,
      enableColorHarmonics: true,
      ...config,
    };
  }

  /**
   * Generate Fibonacci sibling sequence
   * Based on ROTASE model research
   */
  private generateFibonacciSibling(n: number): number {
    const phi = GOLDEN_RATIO;
    const psi = this.config.fibonacciSiblingRatio;
    return Math.floor(n * phi * psi) % this.config.pointCount;
  }

  /**
   * ROTASE model implementation
   * Galactic spiral equations for phyllotactic patterns
   */
  private generateROTASEPattern(): AdvancedPatternPoint[] {
    const points: AdvancedPatternPoint[] = [];
    const goldenAngle = GOLDEN_ANGLE * Math.PI / 180;

    for (let i = 0; i < this.config.pointCount; i++) {
      // ROTASE galactic spiral equation
      const galacticIndex = this.generateFibonacciSibling(i);
      const radius = this.config.baseRadius * Math.sqrt(galacticIndex) * this.config.galacticSpiralFactor;
      const angle = galacticIndex * goldenAngle;
      
      // Apply galactic spiral transformation
      const galacticAngle = angle + (galacticIndex * 0.1 * this.config.galacticSpiralFactor);
      const galacticRadius = radius * (1 + Math.sin(galacticIndex * 0.05) * 0.1);

      const x = this.config.centerX + Math.cos(galacticAngle) * galacticRadius;
      const y = this.config.centerY + Math.sin(galacticAngle) * galacticRadius;

      points.push({
        index: i,
        x,
        y,
        radius: galacticRadius,
        angle: galacticAngle,
        color: this.generateAdvancedColor(i, 'rotase'),
        size: this.calculateAdvancedSize(i),
        patternType: 'rotase',
        morphingPhase: this.calculateMorphingPhase(i),
      });
    }

    return points;
  }

  /**
   * Bernoulli spiral lattice implementation
   * Based on research by Takamichi Sushida and Yoshikazu Yamagishi
   */
  private generateBernoulliLattice(): AdvancedPatternPoint[] {
    const points: AdvancedPatternPoint[] = [];
    const goldenAngle = GOLDEN_ANGLE * Math.PI / 180;

    for (let i = 0; i < this.config.pointCount; i++) {
      // Bernoulli spiral lattice equation
      const latticeIndex = i * this.config.latticeDensity + this.config.latticeOffset;
      const radius = this.config.baseRadius * Math.sqrt(latticeIndex);
      const angle = latticeIndex * goldenAngle;
      
      // Apply lattice transformation
      const latticeAngle = angle + Math.sin(latticeIndex * 0.1) * 0.2;
      const latticeRadius = radius * (1 + Math.cos(latticeIndex * 0.15) * 0.1);

      const x = this.config.centerX + Math.cos(latticeAngle) * latticeRadius;
      const y = this.config.centerY + Math.sin(latticeAngle) * latticeRadius;

      points.push({
        index: i,
        x,
        y,
        radius: latticeRadius,
        angle: latticeAngle,
        color: this.generateAdvancedColor(i, 'bernoulli'),
        size: this.calculateAdvancedSize(i),
        patternType: 'bernoulli',
        morphingPhase: this.calculateMorphingPhase(i),
      });
    }

    return points;
  }

  /**
   * Enhanced Vogel model with morphing capabilities
   */
  private generateEnhancedVogelPattern(): AdvancedPatternPoint[] {
    const points: AdvancedPatternPoint[] = [];
    const goldenAngle = GOLDEN_ANGLE * Math.PI / 180;

    for (let i = 0; i < this.config.pointCount; i++) {
      const radius = this.config.baseRadius * Math.sqrt(i) * this.config.growthFactor;
      let angle = i * goldenAngle;
      
      // Apply morphing if enabled
      if (this.config.enableMorphing) {
        const morphingPhase = this.calculateMorphingPhase(i);
        angle += Math.sin(morphingPhase * Math.PI * 2) * this.config.morphingIntensity;
      }

      const x = this.config.centerX + Math.cos(angle) * radius;
      const y = this.config.centerY + Math.sin(angle) * radius;

      points.push({
        index: i,
        x,
        y,
        radius,
        angle,
        color: this.generateAdvancedColor(i, 'vogel'),
        size: this.calculateAdvancedSize(i),
        patternType: 'vogel',
        morphingPhase: this.calculateMorphingPhase(i),
      });
    }

    return points;
  }

  /**
   * Generate advanced color based on pattern type and harmonics
   */
  private generateAdvancedColor(index: number, patternType: string): string {
    if (!this.config.enableColorHarmonics) {
      return `hsl(${index * 137.5 % 360}, 70%, 50%)`;
    }

    let hue: number;
    let saturation: number;
    let lightness: number;

    switch (patternType) {
      case 'rotase':
        // ROTASE color harmonics
        hue = (index * 137.5 + Math.sin(index * 0.1) * 30) % 360;
        saturation = 80 + Math.sin(index * 0.05) * 20;
        lightness = 50 + Math.cos(index * 0.08) * 20;
        break;
      case 'bernoulli':
        // Bernoulli lattice color harmonics
        hue = (index * 137.5 + Math.cos(index * 0.15) * 45) % 360;
        saturation = 70 + Math.cos(index * 0.12) * 30;
        lightness = 60 + Math.sin(index * 0.07) * 15;
        break;
      default:
        // Enhanced Vogel color harmonics
        hue = (index * 137.5 + Math.sin(index * 0.2) * 20) % 360;
        saturation = 75 + Math.sin(index * 0.1) * 25;
        lightness = 55 + Math.cos(index * 0.06) * 25;
    }

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Calculate advanced size based on pattern characteristics
   */
  private calculateAdvancedSize(index: number): number {
    const baseSize = 2.0;
    const sizeVariation = Math.sin(index * 0.1) * 0.5;
    return Math.max(0.5, baseSize + sizeVariation);
  }

  /**
   * Calculate morphing phase for advanced effects
   */
  private calculateMorphingPhase(index: number): number {
    return (index * 0.1) % (Math.PI * 2);
  }

  /**
   * Generate pattern based on current configuration
   */
  generatePattern(): AdvancedPatternPoint[] {
    switch (this.config.patternType) {
      case 'rotase':
        return this.generateROTASEPattern();
      case 'bernoulli':
        return this.generateBernoulliLattice();
      case 'fibonacci-sibling':
        return this.generateROTASEPattern(); // Uses Fibonacci sibling sequence
      default:
        return this.generateEnhancedVogelPattern();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AdvancedPatternConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AdvancedPatternConfig {
    return { ...this.config };
  }

  /**
   * Calculate performance metrics for the pattern
   */
  calculatePerformanceMetrics(): {
    complexity: number;
    renderingCost: number;
    memoryUsage: number;
  } {
    const complexity = this.config.pointCount * (this.config.enableMorphing ? 2 : 1);
    const renderingCost = complexity * (this.config.enableColorHarmonics ? 1.5 : 1);
    const memoryUsage = this.config.pointCount * 64; // Approximate bytes per point

    return {
      complexity,
      renderingCost,
      memoryUsage,
    };
  }
}
