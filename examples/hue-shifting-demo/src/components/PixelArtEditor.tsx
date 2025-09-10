import { Component, createSignal, createMemo, onMount } from "solid-js";
import { ColorPicker } from "./ColorPicker";
import type { OKLCHColor } from "reynard-colors";
import { basicHueShift, materialHueShift } from "../utils/hueShiftingAlgorithms";
import "./PixelArtEditor.css";

type PixelData = OKLCHColor | null;

export const PixelArtEditor: Component = () => {
  const [canvasWidth, setCanvasWidth] = createSignal(16);
  const [canvasHeight, setCanvasHeight] = createSignal(16);
  const [pixels, setPixels] = createSignal<PixelData[][]>([]);
  const [selectedColor, setSelectedColor] = createSignal<OKLCHColor>({
    l: 60,
    c: 0.2,
    h: 120
  });
  const [selectedMaterial, setSelectedMaterial] = createSignal<keyof typeof MATERIAL_PATTERNS>("fabric");
  const [shiftIntensity, setShiftIntensity] = createSignal(0.3);
  const [tool, setTool] = createSignal<'pencil' | 'eraser' | 'fill'>('pencil');
  const [isDrawing, setIsDrawing] = createSignal(false);
  
  const MATERIAL_PATTERNS = {
    metal: { shadowShift: 30, highlightShift: 15, chromaBoost: 0.15, lightnessRange: 50 },
    skin: { shadowShift: 20, highlightShift: 25, chromaBoost: 0.08, lightnessRange: 35 },
    fabric: { shadowShift: 15, highlightShift: 10, chromaBoost: 0.05, lightnessRange: 40 },
    plastic: { shadowShift: 10, highlightShift: 20, chromaBoost: 0.12, lightnessRange: 45 }
  } as const;
  
  // Initialize canvas
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
  
  // Resize canvas
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
  
  // Get color with material effects
  const getEffectiveColor = (color: OKLCHColor): OKLCHColor => {
    // For drawing, we want to use the base color directly
    // Material effects are applied when creating variations, not the base color
    return color;
  };
  
  // Draw pixel
  const drawPixel = (x: number, y: number, color: OKLCHColor | null) => {
    setPixels(prev => {
      const newPixels = prev.map(row => [...row]);
      if (y >= 0 && y < newPixels.length && x >= 0 && x < newPixels[y].length) {
        newPixels[y][x] = color;
      }
      return newPixels;
    });
  };
  
  // Handle mouse events
  const handleMouseDown = (x: number, y: number) => {
    setIsDrawing(true);
    if (tool() === 'pencil') {
      drawPixel(x, y, getEffectiveColor(selectedColor()));
    } else if (tool() === 'eraser') {
      drawPixel(x, y, null);
    }
  };
  
  const handleMouseMove = (x: number, y: number) => {
    if (isDrawing()) {
      if (tool() === 'pencil') {
        drawPixel(x, y, getEffectiveColor(selectedColor()));
      } else if (tool() === 'eraser') {
        drawPixel(x, y, null);
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
  };
  
  // Fill tool
  const floodFill = (startX: number, startY: number, targetColor: OKLCHColor | null, newColor: OKLCHColor | null) => {
    const currentPixels = pixels();
    if (startY < 0 || startY >= currentPixels.length || startX < 0 || startX >= currentPixels[startY].length) {
      return;
    }
    
    const target = currentPixels[startY][startX];
    if (target === newColor) return;
    
    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (y < 0 || y >= currentPixels.length || x < 0 || x >= currentPixels[y].length) continue;
      if (currentPixels[y][x] !== target) continue;
      
      drawPixel(x, y, newColor);
      
      // Add neighbors
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  };
  
  const handleFill = (x: number, y: number) => {
    const currentPixels = pixels();
    const targetColor = currentPixels[y]?.[x];
    const newColor = getEffectiveColor(selectedColor());
    floodFill(x, y, targetColor, newColor);
  };
  
  // Clear canvas
  const clearCanvas = () => {
    initializeCanvas();
  };
  
  // Initialize on mount
  onMount(() => {
    initializeCanvas();
  });
  
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
          <section class="control-section">
            <h3>Canvas Size</h3>
            <div class="canvas-size-controls">
              <div class="size-input">
                <label>Width:</label>
                <input
                  type="number"
                  min="4"
                  max="64"
                  value={canvasWidth()}
                  onInput={(e) => resizeCanvas(parseInt(e.target.value), canvasHeight())}
                />
              </div>
              <div class="size-input">
                <label>Height:</label>
                <input
                  type="number"
                  min="4"
                  max="64"
                  value={canvasHeight()}
                  onInput={(e) => resizeCanvas(canvasWidth(), parseInt(e.target.value))}
                />
              </div>
            </div>
            <div class="preset-sizes">
              <button onClick={() => resizeCanvas(8, 8)}>8×8</button>
              <button onClick={() => resizeCanvas(16, 16)}>16×16</button>
              <button onClick={() => resizeCanvas(32, 32)}>32×32</button>
            </div>
          </section>
          
          <section class="control-section">
            <h3>Tools</h3>
            <div class="tool-buttons">
              <button
                class={`tool-button ${tool() === 'pencil' ? 'selected' : ''}`}
                onClick={() => setTool('pencil')}
              >
                ✏️ Pencil
              </button>
              <button
                class={`tool-button ${tool() === 'eraser' ? 'selected' : ''}`}
                onClick={() => setTool('eraser')}
              >
                🧹 Eraser
              </button>
              <button
                class={`tool-button ${tool() === 'fill' ? 'selected' : ''}`}
                onClick={() => setTool('fill')}
              >
                🪣 Fill
              </button>
            </div>
          </section>
          
          <section class="control-section">
            <h3>Color</h3>
            <ColorPicker
              color={selectedColor()}
              onColorChange={setSelectedColor}
            />
          </section>
          
          <section class="control-section">
            <h3>Material Type</h3>
            <div class="material-buttons">
              {Object.entries(MATERIAL_PATTERNS).map(([key, pattern]) => (
                <button
                  class={`material-button ${selectedMaterial() === key ? 'selected' : ''}`}
                  onClick={() => setSelectedMaterial(key as keyof typeof MATERIAL_PATTERNS)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </section>
          
          <section class="control-section">
            <h3>Shift Intensity</h3>
            <div class="intensity-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={shiftIntensity()}
                onInput={(e) => setShiftIntensity(parseFloat(e.target.value))}
                class="intensity-slider"
              />
              <span class="intensity-value">{shiftIntensity().toFixed(2)}</span>
            </div>
          </section>
          
          <section class="control-section">
            <button class="clear-button" onClick={clearCanvas}>
              🗑️ Clear Canvas
            </button>
          </section>
        </div>
        
        <div class="editor-canvas">
          <div class="canvas-container">
            <div 
              class="pixel-canvas"
              style={{
                "grid-template-columns": `repeat(${canvasWidth()}, 1fr)`,
                "grid-template-rows": `repeat(${canvasHeight()}, 1fr)`
              }}
            >
              {pixels().map((row, y) => 
                row.map((pixel, x) => (
                  <div
                    class="pixel-cell"
                    style={{
                      "background-color": pixel ? `oklch(${pixel.l}% ${pixel.c} ${pixel.h})` : 'transparent',
                      "border": pixel ? 'none' : '1px solid #333'
                    }}
                    onMouseDown={() => {
                      if (tool() === 'fill') {
                        handleFill(x, y);
                      } else {
                        handleMouseDown(x, y);
                      }
                    }}
                    onMouseMove={() => handleMouseMove(x, y)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                ))
              )}
            </div>
          </div>
          
          <div class="canvas-info">
            <p>Canvas: {canvasWidth()} × {canvasHeight()} pixels</p>
            <p>Tool: {tool().charAt(0).toUpperCase() + tool().slice(1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
