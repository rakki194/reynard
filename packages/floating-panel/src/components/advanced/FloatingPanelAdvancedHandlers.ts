/**
 * Advanced Panel Handlers
 *
 * Event handlers for advanced panels.
 */

import type { FloatingPanelProps } from "../../types.js";

/**
 * Create advanced panel handlers
 */
export function createAdvancedHandlers(props: FloatingPanelProps) {
  const handleShow = () => {
    console.log("🦦> Advanced panel shown:", props.id);
    props.onShow?.();
  };

  const handleHide = () => {
    console.log("🦦> Advanced panel hidden:", props.id);
    props.onHide?.();
  };

  const handleDrag = (position: { top: number; left: number }) => {
    console.log("🦦> Advanced panel dragged:", props.id, position);
    props.onDrag?.(position);
  };

  const handleResize = (size: { width: number; height: number }) => {
    console.log("🦦> Advanced panel resized:", props.id, size);
    props.onResize?.(size);
  };

  return {
    handleShow,
    handleHide,
    handleDrag,
    handleResize,
  };
}

