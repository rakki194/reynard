/**
 * Feature Manager Config
 *
 * Configuration management for the feature manager.
 */
/**
 * Get feature config
 */
export function getFeatureConfig(core, featureId) {
    const [configs] = core.featureConfigsSignal;
    return configs()[featureId] || {};
}
/**
 * Set feature config
 */
export function setFeatureConfig(core, featureId, config) {
    const [, setConfigs] = core.featureConfigsSignal;
    setConfigs((prev) => ({
        ...prev,
        [featureId]: config,
    }));
}
/**
 * Get all feature configs
 */
export function getAllFeatureConfigs(core) {
    const [configs] = core.featureConfigsSignal;
    return configs();
}
