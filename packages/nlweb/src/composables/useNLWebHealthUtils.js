/**
 * NLWeb Health Utilities
 *
 * Health utility functions for the NLWeb composable.
 */
/**
 * Create NLWeb health utilities
 */
export function createNLWebHealthUtils(state) {
    const isHealthy = () => {
        const healthStatus = state.health();
        return healthStatus?.status === "healthy" || false;
    };
    const isAvailable = () => {
        const healthStatus = state.health();
        return healthStatus?.status !== "unavailable" || false;
    };
    const getPerformanceStats = () => {
        const healthStatus = state.health();
        return healthStatus?.performance || null;
    };
    return {
        isHealthy,
        isAvailable,
        getPerformanceStats,
    };
}
