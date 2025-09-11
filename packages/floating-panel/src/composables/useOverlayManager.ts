/**
 * Overlay Manager Composable
 * 
 * Manages the state and transitions of the floating panel overlay system.
 * Based on Yipyap's sophisticated state management patterns.
 */

import { createSignal, createEffect, onCleanup, batch } from "solid-js";
import type {
  OverlayState,
  TransitionPhase,
  FloatingPanel,
  OverlayConfig,
  PanelEventHandlers,
  UseOverlayManagerReturn
} from "../types";

export interface UseOverlayManagerOptions {
  config?: OverlayConfig;
  eventHandlers?: PanelEventHandlers;
  initialPanels?: FloatingPanel[];
  autoHideDelay?: number;
}

const DEFAULT_OVERLAY_CONFIG: Required<OverlayConfig> = {
  backdropBlur: 4,
  backdropColor: "rgb(0 0 0 / 0.2)",
  backdropOpacity: 0.8,
  outlineColor: "#3b82f6",
  outlineStyle: "dashed",
  outlineWidth: 2,
  transitionDuration: 300,
  transitionEasing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  zIndex: 1000
};

export function useOverlayManager(options: UseOverlayManagerOptions = {}): UseOverlayManagerReturn {
  const config = { ...DEFAULT_OVERLAY_CONFIG, ...options.config };
  const eventHandlers = options.eventHandlers || {};
  const autoHideDelay = options.autoHideDelay || 0;

  // Core state
  const [overlayState, setOverlayState] = createSignal<OverlayState>({
    isActive: false,
    transitionPhase: "idle",
    backdropVisible: false,
    panels: options.initialPanels || [],
    activePanelId: undefined
  });

  const [panels, setPanels] = createSignal<Map<string, FloatingPanel>>(
    new Map(options.initialPanels?.map(p => [p.id, p]) || [])
  );

  // Transition management
  let transitionTimeoutId: number | undefined;
  let autoHideTimeoutId: number | undefined;

  // Cleanup timeouts on unmount
  onCleanup(() => {
    if (transitionTimeoutId) clearTimeout(transitionTimeoutId);
    if (autoHideTimeoutId) clearTimeout(autoHideTimeoutId);
  });

  // Transition phase management
  const setTransitionPhase = (phase: TransitionPhase) => {
    batch(() => {
      setOverlayState(prev => ({
        ...prev,
        transitionPhase: phase
      }));
      
      eventHandlers.onTransitionStart?.(phase);
      
      // Handle phase-specific logic
      switch (phase) {
        case "entering":
          setOverlayState(prev => ({
            ...prev,
            isActive: true,
            backdropVisible: true
          }));
          break;
          
        case "entering-active":
          setOverlayState(prev => ({
            ...prev,
            isActive: true,
            backdropVisible: true
          }));
          break;
          
        case "active":
          setOverlayState(prev => ({
            ...prev,
            isActive: true,
            backdropVisible: true
          }));
          break;
          
        case "exiting":
          setOverlayState(prev => ({
            ...prev,
            backdropVisible: false
          }));
          break;
          
        case "exiting-active":
          setOverlayState(prev => ({
            ...prev,
            isActive: false,
            backdropVisible: false
          }));
          break;
          
        case "idle":
          setOverlayState(prev => ({
            ...prev,
            isActive: false,
            backdropVisible: false
          }));
          break;
      }
      
      // Set up next phase transition
      transitionTimeoutId = window.setTimeout(() => {
        eventHandlers.onTransitionEnd?.(phase);
        
        // Auto-advance certain phases
        switch (phase) {
          case "entering":
            setTransitionPhase("entering-active");
            break;
          case "entering-active":
            setTransitionPhase("active");
            break;
          case "exiting":
            setTransitionPhase("exiting-active");
            break;
          case "exiting-active":
            setTransitionPhase("idle");
            break;
        }
      }, config.transitionDuration);
    });
  };

  // Show overlay with transition
  const showOverlay = () => {
    if (autoHideTimeoutId) {
      clearTimeout(autoHideTimeoutId);
      autoHideTimeoutId = undefined;
    }
    
    const currentState = overlayState();
    if (currentState.isActive) return;
    
    eventHandlers.onOverlayShow?.();
    setTransitionPhase("entering");
  };

  // Hide overlay with transition
  const hideOverlay = () => {
    const currentState = overlayState();
    if (!currentState.isActive) return;
    
    eventHandlers.onOverlayHide?.();
    setTransitionPhase("exiting");
  };

  // Toggle overlay state
  const toggleOverlay = () => {
    const currentState = overlayState();
    if (currentState.isActive) {
      hideOverlay();
    } else {
      showOverlay();
    }
  };

  // Panel management
  const addPanel = (panel: FloatingPanel) => {
    setPanels(prev => new Map(prev.set(panel.id, panel)));
    setOverlayState(prev => ({
      ...prev,
      panels: [...prev.panels, panel]
    }));
  };

  const removePanel = (panelId: string) => {
    setPanels(prev => {
      const newMap = new Map(prev);
      newMap.delete(panelId);
      return newMap;
    });
    
    setOverlayState(prev => ({
      ...prev,
      panels: prev.panels.filter(p => p.id !== panelId),
      activePanelId: prev.activePanelId === panelId ? undefined : prev.activePanelId
    }));
  };

  const updatePanel = (panelId: string, updates: Partial<FloatingPanel>) => {
    setPanels(prev => {
      const newMap = new Map(prev);
      const existingPanel = newMap.get(panelId);
      if (existingPanel) {
        newMap.set(panelId, { ...existingPanel, ...updates });
      }
      return newMap;
    });
    
    setOverlayState(prev => ({
      ...prev,
      panels: prev.panels.map(p => 
        p.id === panelId ? { ...p, ...updates } : p
      )
    }));
  };

  // Auto-hide functionality
  const scheduleAutoHide = () => {
    if (autoHideDelay > 0) {
      autoHideTimeoutId = window.setTimeout(() => {
        hideOverlay();
      }, autoHideDelay);
    }
  };

  // Cancel auto-hide
  const cancelAutoHide = () => {
    if (autoHideTimeoutId) {
      clearTimeout(autoHideTimeoutId);
      autoHideTimeoutId = undefined;
    }
  };

  // Effect to handle auto-hide when overlay becomes active
  createEffect(() => {
    const state = overlayState();
    if (state.isActive && state.transitionPhase === "active") {
      scheduleAutoHide();
    } else {
      cancelAutoHide();
    }
  });

  return {
    overlayState,
    showOverlay,
    hideOverlay,
    toggleOverlay,
    addPanel,
    removePanel,
    updatePanel,
    setTransitionPhase,
    isActive: () => overlayState().isActive,
    getPanel: (panelId: string) => panels().get(panelId),
    getAllPanels: () => Array.from(panels().values())
  };
}
