/**
 * Feature Manager Core
 *
 * Core functionality for the feature manager.
 */
import { createSignal } from "solid-js";
import type { FeatureStatus, FeatureConfig, FeatureRegistry } from "./types.js";
export interface FeatureManagerCore {
    registry: FeatureRegistry;
    config: FeatureConfig;
    featureStatusesSignal: ReturnType<typeof createSignal<Record<string, FeatureStatus>>>;
    featureConfigsSignal: ReturnType<typeof createSignal<Record<string, Record<string, unknown>>>>;
    refreshTimer: ReturnType<typeof setInterval> | undefined;
}
/**
 * Create feature manager core
 */
export declare function createFeatureManagerCore(config: FeatureConfig): FeatureManagerCore;
