import { Component } from "solid-js";
import { FloatingPanelAdvanced } from "reynard-floating-panel";
import { ColorPicker } from "../ColorPicker";
import type { OKLCHColor } from "reynard-colors";

interface ColorPickerPanelProps {
  color: OKLCHColor;
  onColorChange: (color: OKLCHColor) => void;
  isVisible: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

export const ColorPickerPanel: Component<ColorPickerPanelProps> = (props) => {
  return (
    <FloatingPanelAdvanced
      id="color-picker-panel"
      position={{ top: 20, left: 20 }}
      size={{ width: 320, height: 480 }}
      config={{
        draggable: true,
        resizable: true,
        closable: true,
        backdrop: false,
        animationDelay: 0,
        theme: "accent"
      }}
      onShow={props.onShow}
      onHide={props.onHide}
      style={{ display: props.isVisible ? 'block' : 'none' }}
    >
      <div class="floating-panel-body">
        <h3>Color Picker</h3>
        <p>Choose your base color using OKLCH values</p>
        <ColorPicker
          color={props.color}
          onColorChange={props.onColorChange}
        />
      </div>
    </FloatingPanelAdvanced>
  );
};
