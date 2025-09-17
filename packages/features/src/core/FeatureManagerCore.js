/**
 * Feature Manager Core
 *
 * Core functionality for the feature manager.
 */
import { createSignal } from "solid-js";
import { FeatureRegistry as FeatureRegistryImpl } from "./FeatureRegistry.js";
/**
 * Create feature manager core
 */
export function createFeatureManagerCore(config) {
    const featureStatusesSignal = createSignal({});
    const featureConfigsSignal = createSignal({});
    const registry = new FeatureRegistryImpl();
    // Register features from config
    if (config.features) {
        for (const feature of config.features) {
            registry.register(feature);
        }
    }
    return {
        registry,
        config,
        featureStatusesSignal,
        featureConfigsSignal,
        refreshTimer: undefined,
    };
}
