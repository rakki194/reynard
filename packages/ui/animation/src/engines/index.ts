/**
 * 🦊 Animation Engines
 * Advanced animation engine exports
 */

export { createAdaptiveAnimationEngine } from "./AdaptiveAnimation";
export { createThrottledAnimationEngine } from "./ThrottledAnimation";
export { StroboscopicEngine } from "./StroboscopicEngine";
export { createQualityManager } from "./QualityManager";
export { createAdaptiveCallbacks } from "./AdaptiveCallbacks";
export { DEFAULT_ADAPTIVE_CONFIG } from "./AdaptiveConfig";
export { 
  SmartAnimationCore, 
  getSmartAnimationCore, 
  createSmartAnimationCore,
  cleanupSmartAnimationCore 
} from "./SmartAnimationCore";
export { 
  NoOpAnimationEngine, 
  getNoOpAnimationEngine, 
  createNoOpAnimationEngine, 
  cleanupNoOpAnimationEngine 
} from "./NoOpAnimationEngine";
export { 
  NoOpTestingUtilities, 
  createNoOpTestingUtilities 
} from "./NoOpTestingUtilities";

// Re-export types
export type { StroboscopicConfig, StroboscopicState } from "../types";
export type { AdaptiveConfig } from "./AdaptiveConfig";
export type { QualityManager } from "./QualityManager";
export type { NoOpAnimationConfig, NoOpPerformanceMetrics, NoOpAnimationState } from "./NoOpAnimationEngine";
export type { NoOpTestConfig, NoOpTestResult, NoOpTestSuite } from "./NoOpTestingUtilities";
