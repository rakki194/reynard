/**
 * Panel CSS Variables
 *
 * CSS variable generation for panel styles.
 */
import type { PanelConfig } from "../../types.js";
/**
 * Generate CSS custom properties for theming
 */
export declare function getCSSVariables(config: Required<PanelConfig>): {
    "--panel-theme-color": string;
    "--panel-transition-duration": string;
    "--panel-transition-easing": string;
    "--panel-transition-delay": string;
    "--panel-backdrop-blur": string;
    "--panel-backdrop-color": string;
    "--panel-backdrop-opacity": string;
};
