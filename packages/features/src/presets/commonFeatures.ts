/**
 * Common Features
 *
 * Common feature definitions for typical applications.
 * Updated to align with actual Reynard service implementations.
 */

import type { FeatureDefinition } from "../core/types.js";
import { CORE_FEATURES } from "./coreFeatures.js";
import { UI_FEATURES } from "./uiFeatures.js";
import { AI_FEATURES } from "./aiFeatures.js";

/**
 * All common features combined
 */
export const COMMON_FEATURES: FeatureDefinition[] = [
  ...CORE_FEATURES,
  ...UI_FEATURES,
  ...AI_FEATURES,
];

/**
 * Available feature categories
 */
export const FEATURE_CATEGORIES = [
  "core",
  "ml", 
  "integration",
  "utility",
  "ui",
  "data"
] as const;

/**
 * Available feature priorities
 */
export const FEATURE_PRIORITIES = [
  "critical",
  "high",
  "medium", 
  "low"
] as const;

// Re-export individual feature categories
export { CORE_FEATURES } from "./coreFeatures.js";
export { UI_FEATURES } from "./uiFeatures.js";
export { AI_FEATURES } from "./aiFeatures.js";