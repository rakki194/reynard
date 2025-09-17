/**
 * Panel Style Generator
 *
 * Style generation utilities for panels.
 */
import type { JSX } from "solid-js";
import type { PanelPosition, PanelSize } from "../../types.js";
/**
 * Generate panel styles
 */
export declare function generatePanelStyles(position: PanelPosition, size?: PanelSize, config?: Record<string, unknown>): JSX.CSSProperties;
