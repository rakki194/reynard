import { Component, Show } from "solid-js";
import { FloatingPanelAdvanced } from "reynard-floating-panel";
import { ToolControls } from "../ToolControls";

type DrawingTool = 'pencil' | 'eraser' | 'fill';

interface ToolControlsPanelProps {
  selectedTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  isVisible: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

export const ToolControlsPanel: Component<ToolControlsPanelProps> = (props) => {
  return (
    <Show when={props.isVisible}>
      {() => (
    <FloatingPanelAdvanced
      id="tool-controls-panel"
      position={{ top: 20, left: 360 }}
      size={{ width: 200, height: 180 }}
      config={{
        draggable: true,
        resizable: false,
        closable: true,
        backdrop: false,
        animationDelay: 100,
        theme: "default"
      }}
      onShow={props.onShow}
      onHide={props.onHide}
    >
      <div class="floating-panel-body">
        <h3>Drawing Tools</h3>
        <p>Select your drawing tool</p>
        <ToolControls
          selectedTool={props.selectedTool}
          onToolChange={props.onToolChange}
        />
      </div>
    </FloatingPanelAdvanced>
      )}
    </Show>
  );
};
