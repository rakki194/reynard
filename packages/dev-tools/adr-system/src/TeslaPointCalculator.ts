/**
 * 🦊 TESLA Point Calculator
 * =========================
 *
 * Calculates TESLA points based on detected patterns across different system categories.
 * Implements the point allocation system for Foundation, Intelligence, Automation,
 * and Advanced systems as defined in the TESLA architecture.
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { SemanticArchitecturePattern, TeslaSystemCategory, TESLA_POINT_ALLOCATION } from "./TeslaTypes";

/**
 * Point calculation configuration
 */
export interface PointCalculationConfig {
  /** Enable foundation system points */
  enableFoundation: boolean;
  /** Enable intelligence system points */
  enableIntelligence: boolean;
  /** Enable automation system points */
  enableAutomation: boolean;
  /** Enable advanced system points */
  enableAdvanced: boolean;
  /** Custom point multipliers */
  multipliers: {
    foundation: number;
    intelligence: number;
    automation: number;
    advanced: number;
  };
}

/**
 * Default point calculation configuration
 */
export const DEFAULT_POINT_CONFIG: PointCalculationConfig = {
  enableFoundation: true,
  enableIntelligence: true,
  enableAutomation: true,
  enableAdvanced: true,
  multipliers: {
    foundation: 1.0,
    intelligence: 1.0,
    automation: 1.0,
    advanced: 1.0,
  },
};

/**
 * TESLA Point Calculator
 *
 * Calculates TESLA points based on detected patterns across different system categories.
 */
export class TeslaPointCalculator {
  private config: PointCalculationConfig;

  constructor(config: Partial<PointCalculationConfig> = {}) {
    this.config = { ...DEFAULT_POINT_CONFIG, ...config };
  }

  /**
   * Calculate total TESLA points based on detected patterns
   */
  calculateTeslaPoints(patterns: SemanticArchitecturePattern[]): number {
    let points = 0;

    if (this.config.enableFoundation) {
      points += this.calculateFoundationPoints(patterns) * this.config.multipliers.foundation;
    }

    if (this.config.enableIntelligence) {
      points += this.calculateIntelligencePoints(patterns) * this.config.multipliers.intelligence;
    }

    if (this.config.enableAutomation) {
      points += this.calculateAutomationPoints(patterns) * this.config.multipliers.automation;
    }

    if (this.config.enableAdvanced) {
      points += this.calculateAdvancedPoints(patterns) * this.config.multipliers.advanced;
    }

    return Math.min(points, TESLA_POINT_ALLOCATION.MAX_TOTAL);
  }

  /**
   * Calculate foundation system points
   */
  private calculateFoundationPoints(patterns: SemanticArchitecturePattern[]): number {
    let points = 0;

    // Monorepo Architecture (300 points)
    if (patterns.some(p => p.category === "monorepo" || p.name.includes("monorepo"))) {
      points += 300;
    }

    // Testing Framework (300 points)
    if (patterns.some(p => p.category === "testing" || p.name.includes("test"))) {
      points += 300;
    }

    // Code Quality System (300 points)
    if (patterns.some(p => p.category === "quality" || p.name.includes("lint"))) {
      points += 300;
    }

    // API Autonomy (300 points)
    if (patterns.some(p => p.category === "api" || p.name.includes("api"))) {
      points += 300;
    }

    // Package Management (200 points)
    if (patterns.some(p => p.category === "package" || p.name.includes("package"))) {
      points += 200;
    }

    // Documentation System (200 points)
    if (patterns.some(p => p.category === "documentation" || p.name.includes("docs"))) {
      points += 200;
    }

    // Security System (200 points)
    if (patterns.some(p => p.category === "security" || p.name.includes("auth"))) {
      points += 200;
    }

    return points;
  }

  /**
   * Calculate intelligence system points
   */
  private calculateIntelligencePoints(patterns: SemanticArchitecturePattern[]): number {
    let points = 0;

    // AI Integration (500 points)
    if (patterns.some(p => p.category === "ai" || p.name.includes("ai"))) {
      points += 500;
    }

    // Semantic Analysis (400 points)
    if (patterns.some(p => p.category === "semantic" || p.name.includes("semantic"))) {
      points += 400;
    }

    // Pattern Recognition (400 points)
    if (patterns.some(p => p.category === "pattern" || p.name.includes("pattern"))) {
      points += 400;
    }

    // Architecture Mapping (400 points)
    if (patterns.some(p => p.category === "architecture" || p.name.includes("architecture"))) {
      points += 400;
    }

    // Code Analysis (300 points)
    if (patterns.some(p => p.category === "analysis" || p.name.includes("analysis"))) {
      points += 300;
    }

    // Dependency Analysis (300 points)
    if (patterns.some(p => p.category === "dependency" || p.name.includes("dependency"))) {
      points += 300;
    }

    // Relationship Mapping (300 points)
    if (patterns.some(p => p.category === "relationship" || p.name.includes("relationship"))) {
      points += 300;
    }

    return points;
  }

  /**
   * Calculate automation system points
   */
  private calculateAutomationPoints(patterns: SemanticArchitecturePattern[]): number {
    let points = 0;

    // Build Automation (500 points)
    if (patterns.some(p => p.category === "build" || p.name.includes("build"))) {
      points += 500;
    }

    // Test Automation (500 points)
    if (patterns.some(p => p.category === "test-automation" || p.name.includes("test"))) {
      points += 500;
    }

    // Deployment Automation (400 points)
    if (patterns.some(p => p.category === "deployment" || p.name.includes("deploy"))) {
      points += 400;
    }

    // Code Generation (400 points)
    if (patterns.some(p => p.category === "generation" || p.name.includes("generate"))) {
      points += 400;
    }

    // Workflow Automation (400 points)
    if (patterns.some(p => p.category === "workflow" || p.name.includes("workflow"))) {
      points += 400;
    }

    // Monitoring Automation (400 points)
    if (patterns.some(p => p.category === "monitoring" || p.name.includes("monitor"))) {
      points += 400;
    }

    // Self-Healing (400 points)
    if (patterns.some(p => p.category === "self-healing" || p.name.includes("heal"))) {
      points += 400;
    }

    return points;
  }

  /**
   * Calculate advanced system points
   */
  private calculateAdvancedPoints(patterns: SemanticArchitecturePattern[]): number {
    let points = 0;

    // Predictive Analytics (500 points)
    if (patterns.some(p => p.category === "predictive" || p.name.includes("predict"))) {
      points += 500;
    }

    // Autonomous Decision Making (500 points)
    if (patterns.some(p => p.category === "autonomous" || p.name.includes("autonomous"))) {
      points += 500;
    }

    // Self-Optimization (400 points)
    if (patterns.some(p => p.category === "optimization" || p.name.includes("optimize"))) {
      points += 400;
    }

    // Adaptive Learning (400 points)
    if (patterns.some(p => p.category === "learning" || p.name.includes("learn"))) {
      points += 400;
    }

    // Proactive Maintenance (200 points)
    if (patterns.some(p => p.category === "maintenance" || p.name.includes("maintain"))) {
      points += 200;
    }

    return points;
  }

  /**
   * Get detailed point breakdown by category
   */
  getPointBreakdown(patterns: SemanticArchitecturePattern[]): Record<string, number> {
    return {
      foundation: this.calculateFoundationPoints(patterns),
      intelligence: this.calculateIntelligencePoints(patterns),
      automation: this.calculateAutomationPoints(patterns),
      advanced: this.calculateAdvancedPoints(patterns),
      total: this.calculateTeslaPoints(patterns),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PointCalculationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PointCalculationConfig {
    return { ...this.config };
  }
}
