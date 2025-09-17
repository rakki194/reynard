import { Component, createSignal, onMount } from "solid-js";
import { FloatingPanelEditorLayout } from "./FloatingPanelEditorLayout";
import { useCanvas } from "../composables/useCanvas";
import { useDrawingTools } from "../composables/useDrawingTools";
import { useMaterialEffects } from "../composables/useMaterialEffects";
import { useEditorEvents } from "../composables/useEditorEvents";
import type { OKLCHColor } from "reynard-colors";
import "./PixelArtEditor.css";
import "./FloatingPanelEditorLayout.css";

export const PixelArtEditor: Component = () => {
  const [selectedColor, setSelectedColor] = createSignal<OKLCHColor>({
    l: 60,
    c: 0.2,
    h: 120,
  });

  // Composables
  const canvas = useCanvas(16, 16);
  const drawingTools = useDrawingTools();
  const materialEffects = useMaterialEffects();
  const events = useEditorEvents(selectedColor, canvas, drawingTools, materialEffects);

  // Initialize on mount
  onMount(() => {
    canvas.initializeCanvas();
  });

  return (
    <FloatingPanelEditorLayout
      selectedColor={selectedColor()}
      onColorChange={setSelectedColor}
      canvasWidth={canvas.canvasWidth()}
      canvasHeight={canvas.canvasHeight()}
      onResizeCanvas={canvas.resizeCanvas}
      selectedTool={drawingTools.tool()}
      onToolChange={drawingTools.setTool}
      selectedMaterial={materialEffects.selectedMaterial()}
      shiftIntensity={materialEffects.shiftIntensity()}
      onMaterialChange={materialEffects.setSelectedMaterial}
      onIntensityChange={materialEffects.setShiftIntensity}
      pixels={canvas.pixels()}
      onMouseDown={events.handleMouseDown}
      onMouseMove={events.handleMouseMove}
      onMouseUp={events.handleMouseUp}
      onMouseLeave={events.handleMouseLeave}
      onClearCanvas={canvas.clearCanvas}
    />
  );
};
