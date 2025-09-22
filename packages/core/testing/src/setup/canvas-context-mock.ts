/**
 * Canvas Context Mock - Mock implementation of HTML5 Canvas 2D context
 */

import { vi } from "vitest";

// Type definitions for better compatibility
type PredefinedColorSpace = "srgb" | "display-p3" | "rec2020";

/**
 * Creates drawing methods for canvas context mock
 */
function createDrawingMethods() {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1, colorSpace: "srgb" as PredefinedColorSpace })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1, colorSpace: "srgb" as PredefinedColorSpace })),
    drawImage: vi.fn(),
  };
}

/**
 * Creates path methods for canvas context mock
 */
function createPathMethods() {
  return {
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
  };
}

/**
 * Creates drawing operations for canvas context mock
 */
function createDrawingOperations() {
  return {
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    isPointInPath: vi.fn(() => false),
    isPointInStroke: vi.fn(() => false),
  };
}

/**
 * Creates text methods for canvas context mock
 */
function createTextMethods() {
  return {
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ 
      width: 0, 
      actualBoundingBoxAscent: 0, 
      actualBoundingBoxDescent: 0, 
      actualBoundingBoxLeft: 0, 
      actualBoundingBoxRight: 0, 
      fontBoundingBoxAscent: 0, 
      fontBoundingBoxDescent: 0 
    })),
  };
}

/**
 * Creates transform methods for canvas context mock
 */
function createTransformMethods() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
  };
}

/**
 * Creates gradient and pattern methods for canvas context mock
 */
function createGradientMethods() {
  return {
    createLinearGradient: vi.fn(),
    createRadialGradient: vi.fn(),
    createConicGradient: vi.fn(),
    createPattern: vi.fn(),
  };
}

/**
 * Creates additional required methods for canvas context mock
 */
function createAdditionalMethods() {
  return {
    getLineDash: vi.fn(() => []),
    setLineDash: vi.fn(),
    getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
    drawFocusIfNeeded: vi.fn(),
    ellipse: vi.fn(),
    reset: vi.fn(),
  };
}

/**
 * Creates context attributes for canvas context mock
 */
function createContextAttributes() {
  return {
    getContextAttributes: vi.fn(() => ({})),
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "low",
    lineCap: "butt",
    lineDashOffset: 0,
    lineJoin: "miter",
    lineWidth: 1,
    miterLimit: 10,
    shadowBlur: 0,
    shadowColor: "rgba(0, 0, 0, 0)",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    strokeStyle: "#000000",
    fillStyle: "#000000",
    font: "10px sans-serif",
    fontKerning: "auto",
    textAlign: "start",
    textBaseline: "alphabetic",
    direction: "inherit",
    filter: "none",
  };
}

/**
 * Creates a comprehensive mock of HTML5 Canvas 2D context
 * Includes all drawing methods, path operations, text rendering, and transforms
 */
export function createMockCanvasContext(): CanvasRenderingContext2D {
  return {
    // Canvas properties
    canvas: {} as HTMLCanvasElement,
    
    // Combine all method groups
    ...createDrawingMethods(),
    ...createPathMethods(),
    ...createDrawingOperations(),
    ...createTextMethods(),
    ...createTransformMethods(),
    ...createGradientMethods(),
    ...createAdditionalMethods(),
    ...createContextAttributes(),
  };
}

/**
 * Sets up HTML5 Canvas element mock with getContext method
 */
export function setupCanvasElementMock(): CanvasRenderingContext2D {
  const mockContext = createMockCanvasContext();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as CanvasRenderingContext2D);
  return mockContext;
}
