/**
 * Security Testing Module - Barrel Export
 *
 * 🐺 *snarls with security testing ferocity* Clean exports for all
 * security and penetration testing utilities in the Reynard e2e testing framework.
 */

// Core security utilities
export { PenetrationTestHelper } from "./penetration-helpers";
export { createDefaultConfig } from "./penetration-test-config";
export type {
  ExploitOptions,
  ExploitResult,
  PenetrationConfig,
  PenetrationResult,
  SecurityAssessment,
  SeverityLevel,
  VulnerabilityDetail,
} from "./penetration-types";
export { SecurityAssessor } from "./security-assessor";

// Exploit testing utilities
export { getExploitClassName } from "./exploit-class-mapper";
export { determineSeverity, generateExploitRecommendations } from "./exploit-recommendations";
export { ExploitRunner } from "./exploit-runner";

// Fenrir integration utilities
export { getExploitClassName as getFenrirExploitClassName } from "./fenrir-class-mapper";
export { runFenrirExploit } from "./fenrir-runner";
export { runCompleteFenrirSuite } from "./fenrir-suite-runner";
