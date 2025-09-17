/**
 * Common Features
 *
 * Common feature definitions for typical applications.
 * Updated to align with actual Reynard service implementations.
 */
import type { FeatureDefinition } from "../core/types.js";
/**
 * All common features combined
 */
export declare const COMMON_FEATURES: FeatureDefinition[];
/**
 * Available feature categories
 */
export declare const FEATURE_CATEGORIES: readonly ["core", "ml", "integration", "utility", "ui", "data"];
/**
 * Available feature priorities
 */
export declare const FEATURE_PRIORITIES: readonly ["critical", "high", "medium", "low"];
export { CORE_FEATURES } from "./coreFeatures.js";
export { UI_FEATURES } from "./uiFeatures.js";
export { AI_FEATURES } from "./aiFeatures.js";
