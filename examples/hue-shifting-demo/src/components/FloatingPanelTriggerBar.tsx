import { Component } from "solid-js";
import { allIcons } from "reynard-fluent-icons";

interface FloatingPanelTriggerBarProps {
  panelStates: {
    colorPicker: boolean;
    toolControls: boolean;
    canvasSize: boolean;
    materialControls: boolean;
  };
  onTogglePanel: (panelName: keyof FloatingPanelTriggerBarProps['panelStates']) => void;
  onShowAllPanels: () => void;
  onHideAllPanels: () => void;
  isAnyPanelVisible: boolean;
}

export const FloatingPanelTriggerBar: Component<FloatingPanelTriggerBarProps> = (props) => {
  return (
    <div class="floating-panel-trigger-bar">
      <div class="trigger-buttons">
        <button
          class={`trigger-button ${props.panelStates.toolControls ? 'active' : ''}`}
          onClick={() => props.onTogglePanel('toolControls')}
          title="Toggle Drawing Tools"
        >
          <span innerHTML={allIcons.edit.svg}></span>
        </button>
        
        <button
          class={`trigger-button ${props.panelStates.colorPicker ? 'active' : ''}`}
          onClick={() => props.onTogglePanel('colorPicker')}
          title="Toggle Color Picker"
        >
          <span innerHTML={allIcons["heart-color"].svg}></span>
        </button>
        
        <button
          class={`trigger-button ${props.panelStates.canvasSize ? 'active' : ''}`}
          onClick={() => props.onTogglePanel('canvasSize')}
          title="Toggle Canvas Size Controls"
        >
          <span innerHTML={allIcons.edit.svg}></span>
        </button>
        
        <button
          class={`trigger-button ${props.panelStates.materialControls ? 'active' : ''}`}
          onClick={() => props.onTogglePanel('materialControls')}
          title="Toggle Material Controls"
        >
          <span innerHTML={allIcons.edit.svg}></span>
        </button>
      </div>
      
      <div class="panel-actions">
        <button
          class="action-button"
          onClick={props.isAnyPanelVisible ? props.onHideAllPanels : props.onShowAllPanels}
          title={props.isAnyPanelVisible ? "Hide All Panels" : "Show All Panels"}
        >
          <span innerHTML={props.isAnyPanelVisible ? allIcons["eye-off"].svg : allIcons.eye.svg}></span>
        </button>
      </div>
    </div>
  );
};
