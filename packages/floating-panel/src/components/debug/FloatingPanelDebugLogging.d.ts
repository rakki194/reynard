/**
 * Debug Panel Logging
 *
 * Logging utilities for debug panels.
 */
import type { FloatingPanelProps } from "../../types.js";
/**
 * Create debug logging effects
 */
export declare function createDebugLogging(props: FloatingPanelProps, panelRef: () => HTMLElement | undefined, isVisible: () => boolean, isDragging: () => boolean): void;
