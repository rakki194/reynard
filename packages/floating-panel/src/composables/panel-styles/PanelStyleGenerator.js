/**
 * Panel Style Generator
 *
 * Style generation utilities for panels.
 */
import { getCSSVariables } from "./PanelCSSVariables.js";
/**
 * Generate panel styles
 */
export function generatePanelStyles(position, size, config) {
    const cssVariables = config ? getCSSVariables(config) : {};
    return {
        position: "absolute",
        top: `${position.top || 0}px`,
        left: `${position.left || 0}px`,
        width: `${size?.width || 300}px`,
        height: `${size?.height || 200}px`,
        "min-width": `${size?.minWidth || 200}px`,
        "min-height": `${size?.minHeight || 100}px`,
        "max-width": `${size?.maxWidth || 800}px`,
        "max-height": `${size?.maxHeight || 600}px`,
        "z-index": position.zIndex || 1000,
        "transition-delay": `${config?.animationDelay || 0}ms`,
        ...cssVariables,
    };
}
