/**
 * Create Feature Context
 *
 * Creates a feature context with proper manager integration and reactive signals.
 */
import { createMemo } from "solid-js";
import { FeatureManager } from "../core/FeatureManager";
/**
 * Create available features memo
 */
function createAvailableFeaturesMemo(manager) {
    return createMemo(() => {
        const statuses = manager.getAllFeatureStatuses();
        const allFeatures = manager.registry.getAll();
        return allFeatures.filter((feature) => {
            const status = statuses[feature.id];
            return status?.available ?? false;
        });
    });
}
/**
 * Create degraded features memo
 */
function createDegradedFeaturesMemo(manager) {
    return createMemo(() => {
        const statuses = manager.getAllFeatureStatuses();
        const allFeatures = manager.registry.getAll();
        return allFeatures.filter((feature) => {
            const status = statuses[feature.id];
            return status?.degraded ?? false;
        });
    });
}
/**
 * Create feature summary memo
 */
function createFeatureSummaryMemo(manager) {
    return createMemo(() => {
        const statuses = manager.getAllFeatureStatuses();
        const total = Object.keys(statuses).length;
        const available = Object.values(statuses).filter((s) => s.available).length;
        const degraded = Object.values(statuses).filter((s) => s.degraded).length;
        const unavailable = total - available - degraded;
        return {
            total,
            available,
            degraded,
            unavailable,
            criticalUnavailable: 0, // TODO: implement critical feature detection
            successRate: total > 0 ? (available / total) * 100 : 0,
        };
    });
}
/**
 * Create a feature context from configuration
 */
export function createFeatureContext(config) {
    const manager = new FeatureManager(config);
    return {
        manager,
        featureStatuses: () => manager.getAllFeatureStatuses(),
        availableFeatures: createAvailableFeaturesMemo(manager),
        degradedFeatures: createDegradedFeaturesMemo(manager),
        featureSummary: createFeatureSummaryMemo(manager),
        isFeatureAvailable: (featureId) => {
            const status = manager.getFeatureStatus(featureId);
            return status?.available ?? false;
        },
        isFeatureDegraded: (featureId) => {
            const status = manager.getFeatureStatus(featureId);
            return status?.degraded ?? false;
        },
        getFeatureStatus: (featureId) => manager.getFeatureStatus(featureId),
        configureFeature: (featureId, config) => manager.setFeatureConfig(featureId, config),
        getFeatureConfig: (featureId) => manager.getFeatureConfig(featureId),
        refreshFeatureStatuses: () => manager.refreshFeatureStatuses(),
    };
}
