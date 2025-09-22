/**
 * Overlay Manager Composable
 *
 * Manages the state and transitions of the floating panel overlay system.
 * Based on Yipyap's sophisticated state management patterns.
 */

import { createEffect, onCleanup, batch } from "solid-js";
import type { UseOverlayManagerOptions, UseOverlayManagerReturn, FloatingPanel, PanelPosition } from "../types.js";
import { createOverlayConfig } from "./overlay-manager/OverlayConfig.js";
import { createOverlayState } from "./overlay-manager/OverlayState.js";
import { createOverlayHandlers } from "./overlay-manager/OverlayHandlers.js";

export function useOverlayManager(options: UseOverlayManagerOptions = {}): UseOverlayManagerReturn {
  const config = createOverlayConfig(options.config);
  const eventHandlers = createOverlayHandlers(options.eventHandlers);
  const autoHideDelay = options.autoHideDelay || 0;

  // Core state
  const [overlayState, setOverlayState] = createOverlayState(options.initialPanels);

  // Auto-hide effect
  createEffect(() => {
    if (autoHideDelay > 0 && overlayState().isActive) {
      const timer = setTimeout(() => {
        batch(() =>
          setOverlayState(prev => ({
            ...prev,
            isActive: false,
            transitionPhase: "hiding",
            backdropVisible: false,
          }))
        );
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  });

  // Transition effect
  createEffect(() => {
    const state = overlayState();
    if (state.transitionPhase === "hiding") {
      const timer = setTimeout(
        () => setOverlayState(prev => ({ ...prev, transitionPhase: "idle" })),
        config.transitionDuration
      );
      return () => clearTimeout(timer);
    }
  });

  // Cleanup
  onCleanup(() => {
    // Cleanup logic here
  });

  return {
    overlayState,
    setOverlayState,
    config,
    eventHandlers,
    showPanel: (panelId: string) => {
      batch(() =>
        setOverlayState(prev => ({
          ...prev,
          isActive: true,
          activePanelId: panelId,
          transitionPhase: "showing",
          backdropVisible: true,
        }))
      );
    },
    hidePanel: (_panelId: string) => {
      batch(() =>
        setOverlayState(prev => ({
          ...prev,
          isActive: false,
          activePanelId: undefined,
          transitionPhase: "hiding",
          backdropVisible: false,
        }))
      );
    },
    togglePanel: (panelId: string) => {
      const state = overlayState();
      if (state.activePanelId === panelId) {
        batch(() =>
          setOverlayState(prev => ({
            ...prev,
            isActive: false,
            activePanelId: undefined,
            transitionPhase: "hiding",
            backdropVisible: false,
          }))
        );
      } else {
        batch(() =>
          setOverlayState(prev => ({
            ...prev,
            isActive: true,
            activePanelId: panelId,
            transitionPhase: "showing",
            backdropVisible: true,
          }))
        );
      }
    },
    handlePanelShow: (panel: FloatingPanel) => {
      options.onPanelShow?.(panel);
    },
    handlePanelHide: (panel: FloatingPanel) => {
      options.onPanelHide?.(panel);
    },
    handlePanelDrag: (panel: FloatingPanel, position: PanelPosition) => {
      options.onPanelDrag?.(panel, position);
    },
    handlePanelResize: (panel: FloatingPanel, size: { width: number; height: number }) => {
      options.onPanelResize?.(panel, size);
    },
  };
}
