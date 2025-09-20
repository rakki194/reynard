/**
 * Panel Constraints
 *
 * Constraint management for draggable/resizable panels.
 */

import type { PanelState } from "./PanelState.js";

export interface PanelConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  bounds?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

/**
 * Apply constraints to panel state
 */
export function applyConstraints(state: PanelState, constraints: PanelConstraints): PanelState {
  const { minWidth = 180, minHeight = 120, maxWidth = 800, maxHeight = 600, bounds } = constraints;

  let { x, y, width, height } = state;

  // Apply size constraints
  width = Math.max(minWidth, Math.min(maxWidth, width));
  height = Math.max(minHeight, Math.min(maxHeight, height));

  // Apply position constraints
  if (bounds) {
    const { top = 0, right = window.innerWidth, bottom = window.innerHeight, left = 0 } = bounds;
    x = Math.max(left, Math.min(right - width, x));
    y = Math.max(top, Math.min(bottom - height, y));
  }

  return { ...state, x, y, width, height };
}
