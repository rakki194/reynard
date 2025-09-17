import { createSignal } from "solid-js";
import type { OKLCHColor } from "reynard-colors";

type PixelData = OKLCHColor | null;

export interface CanvasState {
  width: number;
  height: number;
  pixels: PixelData[][];
}

export interface CanvasActions {
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  resizeCanvas: (width: number, height: number) => void;
  initializeCanvas: () => void;
  clearCanvas: () => void;
  drawPixel: (x: number, y: number, color: PixelData) => void;
  getPixel: (x: number, y: number) => PixelData;
}

export function useCanvas(initialWidth = 16, initialHeight = 16) {
  const [canvasWidth, setCanvasWidth] = createSignal(initialWidth);
  const [canvasHeight, setCanvasHeight] = createSignal(initialHeight);
  const [pixels, setPixels] = createSignal<PixelData[][]>([]);

  const initializeCanvas = () => {
    const newPixels: PixelData[][] = [];
    for (let y = 0; y < canvasHeight(); y++) {
      newPixels[y] = [];
      for (let x = 0; x < canvasWidth(); x++) {
        newPixels[y][x] = null;
      }
    }
    setPixels(newPixels);
  };

  const resizeCanvas = (width: number, height: number) => {
    setCanvasWidth(width);
    setCanvasHeight(height);
    const newPixels: PixelData[][] = [];
    const currentPixels = pixels();

    for (let y = 0; y < height; y++) {
      newPixels[y] = [];
      for (let x = 0; x < width; x++) {
        // Preserve existing pixels if they fit in the new dimensions
        if (y < currentPixels.length && x < currentPixels[y].length) {
          newPixels[y][x] = currentPixels[y][x];
        } else {
          newPixels[y][x] = null;
        }
      }
    }
    setPixels(newPixels);
  };

  const drawPixel = (x: number, y: number, color: PixelData) => {
    setPixels(prev => {
      const newPixels = prev.map(row => [...row]);
      if (y >= 0 && y < newPixels.length && x >= 0 && x < newPixels[y].length) {
        newPixels[y][x] = color;
      }
      return newPixels;
    });
  };

  const getPixel = (x: number, y: number): PixelData => {
    const currentPixels = pixels();
    if (y >= 0 && y < currentPixels.length && x >= 0 && x < currentPixels[y].length) {
      return currentPixels[y][x];
    }
    return null;
  };

  const clearCanvas = () => {
    initializeCanvas();
  };

  return {
    // State
    canvasWidth,
    canvasHeight,
    pixels,

    // Actions
    setWidth: setCanvasWidth,
    setHeight: setCanvasHeight,
    resizeCanvas,
    initializeCanvas,
    clearCanvas,
    drawPixel,
    getPixel,
  };
}
