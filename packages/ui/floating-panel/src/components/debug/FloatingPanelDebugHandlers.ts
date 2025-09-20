/**
 * Debug Panel Handlers
 *
 * Event handlers for debug panels.
 */

import type { FloatingPanelProps } from "../../types.js";

/**
 * Create debug panel handlers
 */
export function createDebugHandlers(props: FloatingPanelProps) {
  const handleHide = () => {
    console.log("🦦> Panel hide requested:", props.id);
    props.onHide?.();
  };

  const handleDragStart = () => {
    console.log("🦦> Panel drag started:", props.id);
    props.onShow?.();
  };

  const handleDrag = (position: { top: number; left: number }) => {
    console.log("🦦> Panel dragging:", props.id, position);
    props.onDrag?.(position);
  };

  const handleDragEnd = () => {
    console.log("🦦> Panel drag ended:", props.id);
    props.onHide?.();
  };

  return {
    handleHide,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  };
}
