/**
 * Debug Panel Configuration
 *
 * Configuration utilities for debug panels.
 */
/**
 * Create default debug configuration
 */
export function createDebugConfig(config) {
    return {
        draggable: true,
        resizable: false,
        closable: false,
        backdrop: false,
        backdropBlur: false,
        backdropColor: "transparent",
        animationDelay: 0,
        animationDuration: 300,
        animationEasing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        showOnHover: false,
        hoverDelay: 500,
        persistent: true,
        theme: "default",
        ...config,
    };
}
