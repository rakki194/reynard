/**
 * Canvas Context Mock - Mock implementation of HTML5 Canvas 2D context
 */

import { vi } from "vitest";

/**
 * Creates a comprehensive mock of HTML5 Canvas 2D context
 * Includes all drawing methods, path operations, text rendering, and transforms
 */
export function createMockCanvasContext() {
  return {
    // Canvas properties
    canvas: {} as HTMLCanvasElement,

    // Drawing methods
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    drawImage: vi.fn(),

    // Path methods
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

    // Drawing operations
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    isPointInPath: vi.fn(() => false),
    isPointInStroke: vi.fn(() => false),

    // Text methods
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),

    // Transform methods
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),

    // Context attributes
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
    textAlign: "start",
    textBaseline: "alphabetic",
    direction: "inherit",
    filter: "none",
  };
}

/**
 * Sets up HTML5 Canvas element mock with getContext method
 */
export function setupCanvasElementMock() {
  const mockContext = createMockCanvasContext();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as any);
  return mockContext;
}
