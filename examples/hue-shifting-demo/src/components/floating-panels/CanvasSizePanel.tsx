import { Component } from "solid-js";
import { FloatingPanelAdvanced } from "reynard-floating-panel";
import { CanvasSizeControls } from "../CanvasSizeControls";

interface CanvasSizePanelProps {
  canvasWidth: number;
  canvasHeight: number;
  onResizeCanvas: (width: number, height: number) => void;
  isVisible: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

export const CanvasSizePanel: Component<CanvasSizePanelProps> = props => {
  return (
    <FloatingPanelAdvanced
      id="canvas-size-panel"
      position={{ top: 220, left: 20 }}
      size={{ width: 200, height: 200 }}
      config={{
        draggable: true,
        resizable: false,
        closable: true,
        backdrop: false,
        animationDelay: 200,
        theme: "info",
      }}
      onShow={props.onShow}
      onHide={props.onHide}
      style={{ display: props.isVisible ? "block" : "none" }}
    >
      <div class="floating-panel-body">
        <h3>Canvas Size</h3>
        <p>Adjust your canvas dimensions</p>
        <CanvasSizeControls
          canvasWidth={props.canvasWidth}
          canvasHeight={props.canvasHeight}
          onResizeCanvas={props.onResizeCanvas}
        />
      </div>
    </FloatingPanelAdvanced>
  );
};
