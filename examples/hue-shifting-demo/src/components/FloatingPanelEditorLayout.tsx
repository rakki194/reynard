import { Component } from "solid-js";
import { FloatingPanelOverlay } from "reynard-floating-panel";
import { PixelCanvas } from "./PixelCanvas";
import { FloatingPanelTriggerBar } from "./FloatingPanelTriggerBar";
import { FloatingPanelDebugger } from "./FloatingPanelDebugger";
import {
  ColorPickerPanel,
  ToolControlsPanel,
  CanvasSizePanel,
  MaterialControlsPanel,
} from "./floating-panels";
import { useFloatingPanels } from "../composables/useFloatingPanels";
import { allIcons } from "reynard-fluent-icons";
import type { OKLCHColor } from "reynard-colors";
import type { MaterialType } from "../composables/useMaterialEffects";
import "./floating-panels/FloatingPanels.css";

type DrawingTool = "pencil" | "eraser" | "fill";

interface FloatingPanelEditorLayoutProps {
  selectedColor: OKLCHColor;
  onColorChange: (color: OKLCHColor) => void;
  canvasWidth: number;
  canvasHeight: number;
  onResizeCanvas: (width: number, height: number) => void;
  selectedTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  selectedMaterial: MaterialType;
  shiftIntensity: number;
  onMaterialChange: (material: MaterialType) => void;
  onIntensityChange: (intensity: number) => void;
  pixels: (OKLCHColor | null)[][];
  onMouseDown: (x: number, y: number) => void;
  onMouseMove: (x: number, y: number) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onClearCanvas: () => void;
}

export const FloatingPanelEditorLayout: Component<
  FloatingPanelEditorLayoutProps
> = (props) => {
  const floatingPanels = useFloatingPanels();

  return (
    <div class="floating-panel-editor">
      <FloatingPanelDebugger />

      <header class="editor-header">
        <h2>Interactive Pixel Art Editor</h2>
        <p>
          Create pixel art with real-time OKLCH hue shifting. Use the floating
          panels to access tools and controls.
        </p>

        <div class="editor-actions">
          <button class="clear-button" onClick={props.onClearCanvas}>
            <span innerHTML={allIcons.delete.svg}></span> Clear Canvas
          </button>
        </div>
      </header>

      <div class="editor-canvas-container">
        <PixelCanvas
          canvasWidth={props.canvasWidth}
          canvasHeight={props.canvasHeight}
          pixels={props.pixels}
          tool={props.selectedTool}
          onMouseDown={props.onMouseDown}
          onMouseMove={props.onMouseMove}
          onMouseUp={props.onMouseUp}
          onMouseLeave={props.onMouseLeave}
        />
      </div>

      <FloatingPanelTriggerBar
        panelStates={floatingPanels.panelStates()}
        onTogglePanel={floatingPanels.togglePanel}
        onShowAllPanels={floatingPanels.showAllPanels}
        onHideAllPanels={floatingPanels.hideAllPanels}
        isAnyPanelVisible={floatingPanels.isAnyPanelVisible()}
      />

      <FloatingPanelOverlay
        isActive={true}
        config={{
          backdropBlur: 2,
          backdropColor: "rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        <ToolControlsPanel
          selectedTool={props.selectedTool}
          onToolChange={props.onToolChange}
          isVisible={floatingPanels.panelStates().toolControls}
          onShow={() => floatingPanels.showPanel("toolControls")}
          onHide={() => floatingPanels.hidePanel("toolControls")}
        />

        <ColorPickerPanel
          color={props.selectedColor}
          onColorChange={props.onColorChange}
          isVisible={floatingPanels.panelStates().colorPicker}
          onShow={() => floatingPanels.showPanel("colorPicker")}
          onHide={() => floatingPanels.hidePanel("colorPicker")}
        />

        <CanvasSizePanel
          canvasWidth={props.canvasWidth}
          canvasHeight={props.canvasHeight}
          onResizeCanvas={props.onResizeCanvas}
          isVisible={floatingPanels.panelStates().canvasSize}
          onShow={() => floatingPanels.showPanel("canvasSize")}
          onHide={() => floatingPanels.hidePanel("canvasSize")}
        />

        <MaterialControlsPanel
          selectedMaterial={props.selectedMaterial}
          shiftIntensity={props.shiftIntensity}
          onMaterialChange={props.onMaterialChange}
          onIntensityChange={props.onIntensityChange}
          isVisible={floatingPanels.panelStates().materialControls}
          onShow={() => floatingPanels.showPanel("materialControls")}
          onHide={() => floatingPanels.hidePanel("materialControls")}
        />
      </FloatingPanelOverlay>
    </div>
  );
};
