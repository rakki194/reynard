/**
 * Feature Manager Config
 *
 * Configuration management for the feature manager.
 */
import type { FeatureManagerCore } from "./FeatureManagerCore.js";
/**
 * Get feature config
 */
export declare function getFeatureConfig(core: FeatureManagerCore, featureId: string): Record<string, unknown>;
/**
 * Set feature config
 */
export declare function setFeatureConfig(core: FeatureManagerCore, featureId: string, config: Record<string, unknown>): void;
/**
 * Get all feature configs
 */
export declare function getAllFeatureConfigs(core: FeatureManagerCore): Record<string, Record<string, unknown>>;
