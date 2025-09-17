/**
 * Panel Storage
 *
 * Storage management for draggable/resizable panels.
 */
/**
 * Save panel state to storage
 */
export function savePanelState(key, state) {
    try {
        localStorage.setItem(key, JSON.stringify(state));
    }
    catch (error) {
        console.warn("Failed to save panel state:", error);
    }
}
/**
 * Load panel state from storage
 */
export function loadPanelState(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return { ...fallback, ...JSON.parse(stored) };
        }
    }
    catch (error) {
        console.warn("Failed to load panel state:", error);
    }
    return fallback;
}
