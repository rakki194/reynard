/**
 * Advanced Panel Configuration
 *
 * Configuration utilities for advanced panels.
 */

import type { PanelConfig } from "../../types.js";

/**
 * Create default advanced configuration
 */
export function createAdvancedConfig(
  config?: PanelConfig,
): Required<PanelConfig> {
  return {
    draggable: true,
    resizable: true,
    closable: true,
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
