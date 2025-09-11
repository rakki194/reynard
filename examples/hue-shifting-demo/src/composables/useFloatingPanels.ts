import { createSignal } from "solid-js";
// import { useOverlayManager } from "reynard-floating-panel";

export interface FloatingPanelState {
  colorPicker: boolean;
  toolControls: boolean;
  canvasSize: boolean;
  materialControls: boolean;
}

export function useFloatingPanels() {
  const [panelStates, setPanelStates] = createSignal<FloatingPanelState>({
    colorPicker: false,
    toolControls: false,
    canvasSize: false,
    materialControls: false,
  });

  // const overlayManager = useOverlayManager();

  const togglePanel = (panelName: keyof FloatingPanelState) => {
    setPanelStates(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  const showPanel = (panelName: keyof FloatingPanelState) => {
    setPanelStates(prev => ({
      ...prev,
      [panelName]: true
    }));
  };

  const hidePanel = (panelName: keyof FloatingPanelState) => {
    setPanelStates(prev => ({
      ...prev,
      [panelName]: false
    }));
  };

  const showAllPanels = () => {
    setPanelStates({
      colorPicker: true,
      toolControls: true,
      canvasSize: true,
      materialControls: true,
    });
  };

  const hideAllPanels = () => {
    setPanelStates({
      colorPicker: false,
      toolControls: false,
      canvasSize: false,
      materialControls: false,
    });
  };

  const isAnyPanelVisible = () => {
    const states = panelStates();
    return states.colorPicker || states.toolControls || states.canvasSize || states.materialControls;
  };

  return {
    panelStates,
    togglePanel,
    showPanel,
    hidePanel,
    showAllPanels,
    hideAllPanels,
    isAnyPanelVisible,
    // overlayManager,
  };
}
