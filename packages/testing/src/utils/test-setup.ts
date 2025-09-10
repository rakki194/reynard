/**
 * Shared test setup utilities for Reynard packages
 */

import { vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@solidjs/testing-library";
import { setupBrowserMocks, resetBrowserMocks } from "../mocks/browser-mocks";

/**
 * Standard test setup for SolidJS components
 * Includes browser mocks, SolidJS cleanup, and console warning suppression
 */
export function setupStandardTestEnvironment() {
  // Setup browser mocks
  setupBrowserMocks();

  // Suppress SolidJS lifecycle warnings in tests
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "computations created outside a `createRoot` or `render` will never be disposed",
      )
    ) {
      return; // Suppress this specific warning
    }
    originalWarn(...args);
  };

  // Reset mocks before each test
  beforeEach(() => {
    resetBrowserMocks();
  });

  // Clean up after each test
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
}

/**
 * Minimal test setup for utility functions
 * Only includes basic cleanup without browser mocks
 */
export function setupMinimalTestEnvironment() {
  // Clean up after each test
  afterEach(() => {
    vi.clearAllMocks();
  });
}

/**
 * Canvas-specific test setup
 * Includes canvas context mocking for graphics testing
 */
export function setupCanvasTestEnvironment() {
  setupStandardTestEnvironment();

  // Mock canvas context
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 100 }),
    getImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    }),
    putImageData: vi.fn(),
    createImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    }),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    isPointInPath: vi.fn().mockReturnValue(false),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createPattern: vi.fn(),
  }) as any);
}

/**
 * WebGL-specific test setup
 * Includes WebGL context mocking for 3D graphics testing
 */
export function setupWebGLTestEnvironment() {
  setupStandardTestEnvironment();

  // Mock WebGL context
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
    if (contextType === "webgl" || contextType === "webgl2") {
      return {
        // Basic WebGL methods
        createShader: vi.fn().mockReturnValue({}),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        createProgram: vi.fn().mockReturnValue({}),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        useProgram: vi.fn(),
        createBuffer: vi.fn().mockReturnValue({}),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        createTexture: vi.fn().mockReturnValue({}),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        createFramebuffer: vi.fn().mockReturnValue({}),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        createRenderbuffer: vi.fn().mockReturnValue({}),
        bindRenderbuffer: vi.fn(),
        renderbufferStorage: vi.fn(),
        framebufferRenderbuffer: vi.fn(),
        viewport: vi.fn(),
        clear: vi.fn(),
        clearColor: vi.fn(),
        clearDepth: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        drawArrays: vi.fn(),
        drawElements: vi.fn(),
        getParameter: vi.fn().mockReturnValue(0),
        getShaderParameter: vi.fn().mockReturnValue(true),
        getProgramParameter: vi.fn().mockReturnValue(true),
        getAttribLocation: vi.fn().mockReturnValue(0),
        getUniformLocation: vi.fn().mockReturnValue({}),
        uniform1f: vi.fn(),
        uniform2f: vi.fn(),
        uniform3f: vi.fn(),
        uniform4f: vi.fn(),
        uniform1i: vi.fn(),
        uniform2i: vi.fn(),
        uniform3i: vi.fn(),
        uniform4i: vi.fn(),
        uniformMatrix2fv: vi.fn(),
        uniformMatrix3fv: vi.fn(),
        uniformMatrix4fv: vi.fn(),
        vertexAttribPointer: vi.fn(),
        enableVertexAttribArray: vi.fn(),
        disableVertexAttribArray: vi.fn(),
        deleteShader: vi.fn(),
        deleteProgram: vi.fn(),
        deleteBuffer: vi.fn(),
        deleteTexture: vi.fn(),
        deleteFramebuffer: vi.fn(),
        deleteRenderbuffer: vi.fn(),
        isContextLost: vi.fn().mockReturnValue(false),
        getExtension: vi.fn(),
        getSupportedExtensions: vi.fn().mockReturnValue([]),
      } as any;
    }
    return null;
  });
}
