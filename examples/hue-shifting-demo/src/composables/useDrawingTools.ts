import { createSignal } from "solid-js";
import type { OKLCHColor } from "reynard-colors";

type PixelData = OKLCHColor | null;
type DrawingTool = "pencil" | "eraser" | "fill";

export interface DrawingState {
  tool: DrawingTool;
  isDrawing: boolean;
}

export interface DrawingActions {
  setTool: (tool: DrawingTool) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  handleMouseDown: (
    x: number,
    y: number,
    selectedColor: OKLCHColor,
    drawPixel: (x: number, y: number, color: PixelData) => void
  ) => void;
  handleMouseMove: (
    x: number,
    y: number,
    selectedColor: OKLCHColor,
    drawPixel: (x: number, y: number, color: PixelData) => void
  ) => void;
  handleMouseUp: () => void;
  handleFill: (
    x: number,
    y: number,
    selectedColor: OKLCHColor,
    pixels: PixelData[][],
    drawPixel: (x: number, y: number, color: PixelData) => void
  ) => void;
}

export function useDrawingTools() {
  const [tool, setTool] = createSignal<DrawingTool>("pencil");
  const [isDrawing, setIsDrawing] = createSignal(false);

  const handleMouseDown = (
    x: number,
    y: number,
    selectedColor: OKLCHColor,
    drawPixel: (x: number, y: number, color: PixelData) => void
  ) => {
    setIsDrawing(true);
    if (tool() === "pencil") {
      drawPixel(x, y, selectedColor);
    } else if (tool() === "eraser") {
      drawPixel(x, y, null);
    }
  };

  const handleMouseMove = (
    x: number,
    y: number,
    selectedColor: OKLCHColor,
    drawPixel: (x: number, y: number, color: PixelData) => void
  ) => {
    if (isDrawing()) {
      if (tool() === "pencil") {
        drawPixel(x, y, selectedColor);
      } else if (tool() === "eraser") {
        drawPixel(x, y, null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const floodFill = (
    startX: number,
    startY: number,
    targetColor: PixelData,
    newColor: PixelData,
    pixels: PixelData[][],
    drawPixel: (x: number, y: number, color: PixelData) => void
  ) => {
    if (startY < 0 || startY >= pixels.length || startX < 0 || startX >= pixels[startY].length) {
      return;
    }

    const target = pixels[startY][startX];
    if (target === newColor) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (y < 0 || y >= pixels.length || x < 0 || x >= pixels[y].length) continue;
      if (pixels[y][x] !== target) continue;

      drawPixel(x, y, newColor);

      // Add neighbors
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  };

  const handleFill = (
    x: number,
    y: number,
    selectedColor: OKLCHColor,
    pixels: PixelData[][],
    drawPixel: (x: number, y: number, color: PixelData) => void
  ) => {
    const targetColor = pixels[y]?.[x];
    floodFill(x, y, targetColor, selectedColor, pixels, drawPixel);
  };

  return {
    // State
    tool,
    isDrawing,

    // Actions
    setTool,
    setIsDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleFill,
  };
}
