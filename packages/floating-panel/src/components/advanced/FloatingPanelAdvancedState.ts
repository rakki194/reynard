/**
 * Advanced Panel State
 *
 * State management for advanced panels.
 */

import type { FloatingPanelProps } from "../../types.js";

/**
 * Create initial state for advanced panel
 */
export function createAdvancedState(props: FloatingPanelProps) {
  return {
    x: typeof props.position.left === "number" ? props.position.left : 20,
    y: typeof props.position.top === "number" ? props.position.top : 20,
    width: typeof props.size?.width === "number" ? props.size.width : 300,
    height: typeof props.size?.height === "number" ? props.size.height : 200,
    minimized: false,
  };
}

/**
 * Create constraints for advanced panel
 */
export function createAdvancedConstraints(props: FloatingPanelProps) {
  return {
    minWidth:
      typeof props.size?.minWidth === "number" ? props.size.minWidth : 180,
    minHeight:
      typeof props.size?.minHeight === "number" ? props.size.minHeight : 120,
    maxWidth:
      typeof props.size?.maxWidth === "number" ? props.size.maxWidth : 800,
    maxHeight:
      typeof props.size?.maxHeight === "number" ? props.size.maxHeight : 600,
  };
}
