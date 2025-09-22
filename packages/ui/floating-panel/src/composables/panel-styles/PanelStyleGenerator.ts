/**
 * Panel Style Generator
 *
 * Style generation utilities for panels.
 */

import type { JSX } from "solid-js";
import type { PanelPosition, PanelSize, PanelConfig } from "../../types.js";
import { getCSSVariables } from "./PanelCSSVariables.js";

/**
 * Generate panel styles
 */
export function generatePanelStyles(
  position: PanelPosition,
  size?: PanelSize,
  config?: PanelConfig
): JSX.CSSProperties {
  const cssVariables = config ? getCSSVariables(config as Required<PanelConfig>) : {};

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
