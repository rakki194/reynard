/**
 * Feature Manager Status
 *
 * Status management for the feature manager.
 */
/**
 * Get feature status
 */
export function getFeatureStatus(core, featureId) {
    const [statuses] = core.featureStatusesSignal;
    return statuses()[featureId] || "unknown";
}
/**
 * Set feature status
 */
export function setFeatureStatus(core, featureId, status) {
    const [, setStatuses] = core.featureStatusesSignal;
    setStatuses((prev) => ({
        ...prev,
        [featureId]: status,
    }));
}
/**
 * Get all feature statuses
 */
export function getAllFeatureStatuses(core) {
    const [statuses] = core.featureStatusesSignal;
    return statuses();
}
/**
 * Refresh feature statuses
 */
export function refreshFeatureStatuses(core) {
    const features = core.registry.getAll();
    for (const feature of features) {
        const isEnabled = core.registry.isEnabled(feature.id);
        const status = {
            id: feature.id,
            name: feature.name,
            available: isEnabled,
            degraded: false,
            message: isEnabled ? "Feature is available" : "Feature is disabled",
            missingServices: [],
            degradedServices: [],
            config: {},
            lastUpdated: Date.now(),
            healthScore: isEnabled ? 100 : 0,
        };
        setFeatureStatus(core, feature.id, status);
    }
}
