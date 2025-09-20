/**
 * Debug Panel Logging
 *
 * Logging utilities for debug panels.
 */

import { createEffect } from "solid-js";
import type { FloatingPanelProps } from "../../types.js";

/**
 * Create debug logging effects
 */
export function createDebugLogging(
  props: FloatingPanelProps,
  panelRef: () => HTMLElement | undefined,
  isVisible: () => boolean,
  isDragging: () => boolean
) {
  // Initial debug logging
  console.log("🦦> FloatingPanelDebug created:", {
    id: props.id,
    position: props.position,
    size: props.size,
    config: props.config,
  });

  // Debug effect for visibility changes
  createEffect(() => {
    console.log("🦦> Panel visibility changed:", {
      id: props.id,
      isVisible: isVisible(),
      isDragging: isDragging(),
    });
  });

  // Debug effect for position changes
  createEffect(() => {
    const element = panelRef();
    if (element) {
      const rect = element.getBoundingClientRect();
      console.log("🦦> Panel position:", {
        id: props.id,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        computedStyle: {
          position: globalThis.getComputedStyle(element).position,
          zIndex: globalThis.getComputedStyle(element).zIndex,
          transform: globalThis.getComputedStyle(element).transform,
        },
      });
    }
  });
}
