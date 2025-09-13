/**
 * Overlay Configuration
 *
 * Configuration utilities for overlay manager.
 */

import type { OverlayConfig } from "../../types.js";

export const DEFAULT_OVERLAY_CONFIG: Required<OverlayConfig> = {
  backdropBlur: 4,
  backdropColor: "rgb(0 0 0 / 0.2)",
  backdropOpacity: 0.8,
  outlineColor: "#3b82f6",
  outlineStyle: "dashed",
  outlineWidth: 2,
  transitionDuration: 300,
  transitionEasing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  zIndex: 1000,
};

/**
 * Create overlay configuration
 */
export function createOverlayConfig(
  config?: OverlayConfig,
): Required<OverlayConfig> {
  return { ...DEFAULT_OVERLAY_CONFIG, ...config };
}
