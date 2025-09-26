/**
 * 🦊 TESLA Architecture Types
 * ===========================
 *
 * Type definitions for the TESLA (Transformative Engineering System for Limited Assistance)
 * architecture analysis system. Provides comprehensive interfaces for semantic pattern
 * detection, autonomy analysis, and architectural assessment.
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

/**
 * Semantic architecture patterns detected in the codebase
 */
export interface SemanticArchitecturePattern {
  /** Pattern identifier */
  id: string;
  /** Pattern name */
  name: string;
  /** Pattern type */
  type: "structural" | "behavioral" | "creational" | "architectural" | "autonomous";
  /** Pattern category */
  category: string;
  /** Pattern description */
  description: string;
  /** Components involved in the pattern */
  components: string[];
  /** Pattern benefits */
  benefits: string[];
  /** Pattern drawbacks */
  drawbacks: string[];
  /** Implementation quality */
  quality: {
    correctness: number; // 0-10
    completeness: number; // 0-10
    consistency: number; // 0-10
  };
  /** Pattern metadata */
  metadata: {
    source: string;
    confidence: number; // 0-1
    lastDetected: string;
    teslaLevel: number; // 1-4 (TESLA autonomy levels)
    [key: string]: any;
  };
}

/**
 * TESLA architecture analysis results
 */
export interface TeslaArchitectureAnalysis {
  /** Current autonomy level (1-4) */
  currentAutonomyLevel: number;
  /** Total points achieved */
  pointsAchieved: number;
  /** Maximum possible points */
  maxPoints: number;
  /** Autonomy percentage */
  autonomyPercentage: number;
  /** Detected patterns */
  patterns: SemanticArchitecturePattern[];
  /** Architecture strengths */
  strengths: string[];
  /** Architecture weaknesses */
  weaknesses: string[];
  /** Recommendations for improvement */
  recommendations: string[];
  /** Next autonomy level requirements */
  nextLevelRequirements: string[];
}

/**
 * TESLA autonomy levels
 */
export enum TeslaAutonomyLevel {
  BASIC_AUTOMATION = 1,
  SMART_AUTOMATION = 2,
  FULL_AUTONOMY = 3,
  PREDICTIVE_AUTONOMY = 4,
}

/**
 * TESLA system categories for point calculation
 */
export enum TeslaSystemCategory {
  FOUNDATION = "foundation",
  INTELLIGENCE = "intelligence",
  AUTOMATION = "automation",
  ADVANCED = "advanced",
}

/**
 * Point allocation for TESLA system categories
 */
export const TESLA_POINT_ALLOCATION = {
  [TeslaSystemCategory.FOUNDATION]: 2000,
  [TeslaSystemCategory.INTELLIGENCE]: 3000,
  [TeslaSystemCategory.AUTOMATION]: 3000,
  [TeslaSystemCategory.ADVANCED]: 2000,
  MAX_TOTAL: 10000,
} as const;

/**
 * Autonomy level thresholds
 */
export const TESLA_AUTONOMY_THRESHOLDS = {
  [TeslaAutonomyLevel.BASIC_AUTOMATION]: 0,
  [TeslaAutonomyLevel.SMART_AUTOMATION]: 2000,
  [TeslaAutonomyLevel.FULL_AUTONOMY]: 4000,
  [TeslaAutonomyLevel.PREDICTIVE_AUTONOMY]: 7000,
} as const;
