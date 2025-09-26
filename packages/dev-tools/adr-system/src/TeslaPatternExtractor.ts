/**
 * 🦊 TESLA Pattern Extractor
 * ==========================
 *
 * Extracts semantic patterns from architecture mapping tools and converts them
 * to TESLA-compatible semantic architecture patterns. Handles pattern detection,
 * classification, and metadata enrichment for the TESLA architecture analysis.
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { SemanticArchitecturePattern } from "./TeslaTypes";

/**
 * Pattern extraction configuration
 */
export interface PatternExtractionConfig {
  /** Include structural patterns */
  includeStructural: boolean;
  /** Include behavioral patterns */
  includeBehavioral: boolean;
  /** Include creational patterns */
  includeCreational: boolean;
  /** Include architectural patterns */
  includeArchitectural: boolean;
  /** Include autonomous patterns */
  includeAutonomous: boolean;
  /** Minimum confidence threshold */
  minConfidence: number;
  /** Maximum patterns to extract */
  maxPatterns: number;
}

/**
 * Default pattern extraction configuration
 */
export const DEFAULT_PATTERN_CONFIG: PatternExtractionConfig = {
  includeStructural: true,
  includeBehavioral: true,
  includeCreational: true,
  includeArchitectural: true,
  includeAutonomous: true,
  minConfidence: 0.5,
  maxPatterns: 100,
};

/**
 * TESLA Pattern Extractor
 *
 * Extracts semantic patterns from architecture mapping and converts them
 * to TESLA-compatible semantic architecture patterns.
 */
export class TeslaPatternExtractor {
  private config: PatternExtractionConfig;

  constructor(config: Partial<PatternExtractionConfig> = {}) {
    this.config = { ...DEFAULT_PATTERN_CONFIG, ...config };
  }

  /**
   * Extract semantic patterns from architecture mapping
   */
  async extractSemanticPatterns(): Promise<SemanticArchitecturePattern[]> {
    const patterns: SemanticArchitecturePattern[] = [];

    // TODO: Integrate with ArchitectureMappingTools when available
    // const architectureMap = this.architectureMappingTools.getArchitectureMap();

    // For now, return empty array - will be populated when ArchitectureMappingTools is integrated
    // This maintains the interface while allowing for future integration

    return patterns;
  }

  /**
   * Convert architecture pattern to semantic pattern
   */
  private convertToSemanticPattern(pattern: any): SemanticArchitecturePattern {
    return {
      id: pattern.id,
      name: pattern.name,
      type: pattern.type as any,
      category: pattern.category,
      description: pattern.description,
      components: pattern.components || [],
      benefits: pattern.benefits || [],
      drawbacks: pattern.drawbacks || [],
      quality: {
        correctness: pattern.quality?.correctness || 5,
        completeness: pattern.quality?.completeness || 5,
        consistency: pattern.quality?.consistency || 5,
      },
      metadata: {
        ...pattern.metadata,
        teslaLevel: this.calculateTeslaLevel(pattern),
        lastDetected: new Date().toISOString(),
      },
    };
  }

  /**
   * Calculate TESLA level for a pattern
   */
  private calculateTeslaLevel(pattern: any): number {
    // Simple heuristic based on pattern characteristics
    if (pattern.category === "autonomous" || pattern.name.includes("autonomous")) return 4;
    if (pattern.category === "predictive" || pattern.name.includes("predict")) return 4;
    if (pattern.category === "ai" || pattern.name.includes("ai")) return 3;
    if (pattern.category === "automation" || pattern.name.includes("automate")) return 2;
    return 1;
  }

  /**
   * Filter patterns based on configuration
   */
  private filterPatterns(patterns: SemanticArchitecturePattern[]): SemanticArchitecturePattern[] {
    return patterns
      .filter(pattern => {
        // Filter by type inclusion
        if (!this.config.includeStructural && pattern.type === "structural") return false;
        if (!this.config.includeBehavioral && pattern.type === "behavioral") return false;
        if (!this.config.includeCreational && pattern.type === "creational") return false;
        if (!this.config.includeArchitectural && pattern.type === "architectural") return false;
        if (!this.config.includeAutonomous && pattern.type === "autonomous") return false;

        // Filter by confidence
        if (pattern.metadata.confidence < this.config.minConfidence) return false;

        return true;
      })
      .slice(0, this.config.maxPatterns);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PatternExtractionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PatternExtractionConfig {
    return { ...this.config };
  }
}
