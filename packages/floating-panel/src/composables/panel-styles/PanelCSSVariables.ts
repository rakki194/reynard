/**
 * Panel CSS Variables
 *
 * CSS variable generation for panel styles.
 */

import type { PanelConfig } from "../../types.js";
import { getThemeColors } from "./PanelThemeColors.js";

/**
 * Generate CSS custom properties for theming
 */
export function getCSSVariables(config: Required<PanelConfig>) {
  const themeColors = getThemeColors();

  return {
    "--panel-theme-color": themeColors[config.theme],
    "--panel-transition-duration": `${config.animationDuration}ms`,
    "--panel-transition-easing": config.animationEasing,
    "--panel-transition-delay": `${config.animationDelay}ms`,
    "--panel-backdrop-blur": config.backdropBlur
      ? `${config.backdropBlur}px`
      : "none",
    "--panel-backdrop-color": config.backdropColor,
    "--panel-backdrop-opacity": config.backdropOpacity?.toString() || "0.8",
  };
}
