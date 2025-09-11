import { Component } from "solid-js";
import { ColorPicker } from "./ColorPicker";
import { CanvasSizeControls } from "./CanvasSizeControls";
import { ToolControls } from "./ToolControls";
import { MaterialControls } from "./MaterialControls";
import { PixelCanvas } from "./PixelCanvas";
import { allIcons } from "reynard-fluent-icons";
import type { OKLCHColor } from "reynard-colors";

type DrawingTool = 'pencil' | 'eraser' | 'fill';
type MaterialType = keyof typeof import("../composables/useMaterialEffects").MATERIAL_PATTERNS;

interface EditorLayoutProps {
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

export const EditorLayout: Component<EditorLayoutProps> = (props) => {
  return (
    <div class="pixel-art-editor">
      <header class="editor-header">
        <h2>Interactive Pixel Art Editor</h2>
        <p>
          Create pixel art with real-time OKLCH hue shifting. 
          Click and drag to draw, use different tools and materials.
        </p>
      </header>
      
      <div class="editor-grid">
        <div class="editor-controls">
          <CanvasSizeControls
            canvasWidth={props.canvasWidth}
            canvasHeight={props.canvasHeight}
            onResizeCanvas={props.onResizeCanvas}
          />
          
          <ToolControls
            selectedTool={props.selectedTool}
            onToolChange={props.onToolChange}
          />
          
          <section class="control-section">
            <h3>Color</h3>
            <ColorPicker
              color={props.selectedColor}
              onColorChange={props.onColorChange}
            />
          </section>
          
          <MaterialControls
            selectedMaterial={props.selectedMaterial}
            shiftIntensity={props.shiftIntensity}
            onMaterialChange={props.onMaterialChange}
            onIntensityChange={props.onIntensityChange}
          />
          
          <section class="control-section">
            <button class="clear-button" onClick={props.onClearCanvas}>
              <span innerHTML={allIcons.delete.svg}></span> Clear Canvas
            </button>
          </section>
        </div>
        
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
    </div>
  );
};
