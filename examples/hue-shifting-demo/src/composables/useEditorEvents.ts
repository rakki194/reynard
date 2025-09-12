import { useDrawingTools } from "./useDrawingTools";
import { useMaterialEffects } from "./useMaterialEffects";
import { useCanvas } from "./useCanvas";
import type { OKLCHColor } from "reynard-colors";

export interface EditorEventHandlers {
  handleMouseDown: (x: number, y: number) => void;
  handleMouseMove: (x: number, y: number) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
}

export function useEditorEvents(
  selectedColor: () => OKLCHColor,
  canvas: ReturnType<typeof useCanvas>,
  drawingTools: ReturnType<typeof useDrawingTools>,
  materialEffects: ReturnType<typeof useMaterialEffects>,
): EditorEventHandlers {
  const handleMouseDown = (x: number, y: number) => {
    if (drawingTools.tool() === "fill") {
      drawingTools.handleFill(
        x,
        y,
        materialEffects.getEffectiveColor(selectedColor()),
        canvas.pixels(),
        canvas.drawPixel,
      );
    } else {
      drawingTools.handleMouseDown(
        x,
        y,
        materialEffects.getEffectiveColor(selectedColor()),
        canvas.drawPixel,
      );
    }
  };

  const handleMouseMove = (x: number, y: number) => {
    drawingTools.handleMouseMove(
      x,
      y,
      materialEffects.getEffectiveColor(selectedColor()),
      canvas.drawPixel,
    );
  };

  const handleMouseUp = () => {
    drawingTools.handleMouseUp();
  };

  const handleMouseLeave = () => {
    drawingTools.handleMouseUp();
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
}
