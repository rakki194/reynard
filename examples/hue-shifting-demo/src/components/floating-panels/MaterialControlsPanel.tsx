import { Component } from "solid-js";
import { FloatingPanelAdvanced } from "reynard-floating-panel";
import { MaterialControls } from "../MaterialControls";
import type { MaterialType } from "../../composables/useMaterialEffects";

interface MaterialControlsPanelProps {
  selectedMaterial: MaterialType;
  shiftIntensity: number;
  onMaterialChange: (material: MaterialType) => void;
  onIntensityChange: (intensity: number) => void;
  isVisible: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

export const MaterialControlsPanel: Component<MaterialControlsPanelProps> = props => {
  return (
    <FloatingPanelAdvanced
      id="material-controls-panel"
      position={{ top: 220, left: 240 }}
      size={{ width: 280, height: 320 }}
      config={{
        draggable: true,
        resizable: true,
        closable: true,
        backdrop: false,
        animationDelay: 300,
        theme: "warning",
      }}
      onShow={props.onShow}
      onHide={props.onHide}
      style={{ display: props.isVisible ? "block" : "none" }}
    >
      <div class="floating-panel-body">
        <h3>Material Effects</h3>
        <p>Configure hue shifting for different materials</p>
        <MaterialControls
          selectedMaterial={props.selectedMaterial}
          shiftIntensity={props.shiftIntensity}
          onMaterialChange={props.onMaterialChange}
          onIntensityChange={props.onIntensityChange}
        />
      </div>
    </FloatingPanelAdvanced>
  );
};
