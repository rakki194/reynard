/**
 * 🦊 TESLA Architecture Scanner
 * =============================
 *
 * Main orchestrator for the TESLA (Transformative Engineering System for Limited Assistance)
 * architecture analysis system. Coordinates pattern extraction, point calculation,
 * and autonomy analysis to provide comprehensive architectural insights.
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { TeslaArchitectureAnalysis } from "./TeslaTypes";
import { TeslaPatternExtractor, PatternExtractionConfig } from "./TeslaPatternExtractor";
import { TeslaPointCalculator, PointCalculationConfig } from "./TeslaPointCalculator";
import { TeslaAutonomyAnalyzer, AutonomyAnalysisConfig } from "./TeslaAutonomyAnalyzer";
import { ReynardLogger } from "reynard-dev-tools-catalyst";

/**
 * TESLA scanner configuration
 */
export interface TeslaScannerConfig {
  /** Pattern extraction configuration */
  patternExtraction: Partial<PatternExtractionConfig>;
  /** Point calculation configuration */
  pointCalculation: Partial<PointCalculationConfig>;
  /** Autonomy analysis configuration */
  autonomyAnalysis: Partial<AutonomyAnalysisConfig>;
  /** Enable detailed logging */
  enableLogging: boolean;
}

/**
 * Default TESLA scanner configuration
 */
export const DEFAULT_SCANNER_CONFIG: TeslaScannerConfig = {
  patternExtraction: {},
  pointCalculation: {},
  autonomyAnalysis: {},
  enableLogging: true,
};

/**
 * TESLA Architecture Scanner
 *
 * Main orchestrator for TESLA architecture analysis. Coordinates all components
 * to provide comprehensive architectural insights and autonomy assessment.
 */
export class TeslaArchitectureScanner {
  private patternExtractor: TeslaPatternExtractor;
  private pointCalculator: TeslaPointCalculator;
  private autonomyAnalyzer: TeslaAutonomyAnalyzer;
  private config: TeslaScannerConfig;
  private logger: ReynardLogger;

  constructor(config: Partial<TeslaScannerConfig> = {}) {
    this.config = { ...DEFAULT_SCANNER_CONFIG, ...config };
    this.logger = new ReynardLogger({ verbose: this.config.enableLogging });

    this.patternExtractor = new TeslaPatternExtractor(this.config.patternExtraction);
    this.pointCalculator = new TeslaPointCalculator(this.config.pointCalculation);
    this.autonomyAnalyzer = new TeslaAutonomyAnalyzer(this.config.autonomyAnalysis);
  }

  /**
   * Scan the entire codebase for semantic architecture patterns
   */
  async scanCodebase(): Promise<TeslaArchitectureAnalysis> {
    this.logger.header("🦊 TESLA Architecture Scan");
    this.logger.info("Starting comprehensive architecture analysis...");

    try {
      // Extract semantic patterns
      const patterns = await this.patternExtractor.extractSemanticPatterns();
      this.logger.info(`📊 Extracted ${patterns.length} semantic patterns`);

      // Calculate TESLA points
      const pointsAchieved = this.pointCalculator.calculateTeslaPoints(patterns);
      this.logger.info(`🎯 Calculated ${pointsAchieved} TESLA points`);

      // Analyze autonomy level
      const analysis = this.autonomyAnalyzer.analyzeTeslaArchitecture(patterns, pointsAchieved);

      this.logger.section("Scan Results");
      this.logger.info(`Current autonomy level: ${analysis.currentAutonomyLevel}`);
      this.logger.info(`Autonomy percentage: ${analysis.autonomyPercentage.toFixed(1)}%`);
      this.logger.info(`Points achieved: ${analysis.pointsAchieved}/${analysis.maxPoints}`);

      this.logger.success("✅ TESLA architecture scan completed successfully");

      return analysis;
    } catch (error) {
      this.logger.error(`❌ TESLA architecture scan failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get detailed point breakdown
   */
  getPointBreakdown(): Record<string, number> {
    // This would need patterns to calculate, so we return empty for now
    // In a real implementation, you'd store the last scan results
    return {
      foundation: 0,
      intelligence: 0,
      automation: 0,
      advanced: 0,
      total: 0,
    };
  }

  /**
   * Update scanner configuration
   */
  updateConfig(config: Partial<TeslaScannerConfig>): void {
    this.config = { ...this.config, ...config };

    // Update component configurations
    this.patternExtractor.updateConfig(this.config.patternExtraction);
    this.pointCalculator.updateConfig(this.config.pointCalculation);
    this.autonomyAnalyzer.updateConfig(this.config.autonomyAnalysis);
  }

  /**
   * Get current scanner configuration
   */
  getConfig(): TeslaScannerConfig {
    return { ...this.config };
  }

  /**
   * Get component configurations
   */
  getComponentConfigs() {
    return {
      patternExtraction: this.patternExtractor.getConfig(),
      pointCalculation: this.pointCalculator.getConfig(),
      autonomyAnalysis: this.autonomyAnalyzer.getConfig(),
    };
  }
}
