/**
 * Feature Manager Status
 *
 * Status management for the feature manager.
 */
import type { FeatureStatus } from "./types.js";
import type { FeatureManagerCore } from "./FeatureManagerCore.js";
/**
 * Get feature status
 */
export declare function getFeatureStatus(core: FeatureManagerCore, featureId: string): FeatureStatus;
/**
 * Set feature status
 */
export declare function setFeatureStatus(core: FeatureManagerCore, featureId: string, status: FeatureStatus): void;
/**
 * Get all feature statuses
 */
export declare function getAllFeatureStatuses(core: FeatureManagerCore): Record<string, FeatureStatus>;
/**
 * Refresh feature statuses
 */
export declare function refreshFeatureStatuses(core: FeatureManagerCore): void;
