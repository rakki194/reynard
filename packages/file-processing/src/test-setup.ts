import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock File and FileReader for browser environment
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;

  constructor(
    _parts: (string | Blob | ArrayBuffer | ArrayBufferView)[],
    filename: string,
    options?: { size?: number; type?: string; lastModified?: number },
  ) {
    this.name = filename;
    this.size = options?.size || 0;
    this.type = options?.type || "";
    this.lastModified = options?.lastModified || Date.now();
  }
} as typeof File;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = vi.fn();

// Mock canvas for image processing
global.HTMLCanvasElement.prototype.getContext = vi.fn(
  () =>
    ({
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(100),
        width: 10,
        height: 10,
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(100),
        width: 10,
        height: 10,
      })),
    }) as unknown as CanvasRenderingContext2D,
) as unknown as typeof HTMLCanvasElement.prototype.getContext;

global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  const blob = new Blob(["mock-image"], { type: "image/png" });
  callback(blob);
});

global.HTMLCanvasElement.prototype.toDataURL = vi.fn(
  () => "data:image/png;base64,mock",
);

// Mock Image for image processing
global.Image = class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = "";
  width: number = 0;
  height: number = 0;
  naturalWidth: number = 0;
  naturalHeight: number = 0;
  complete: boolean = false;

  constructor() {
    setTimeout(() => {
      this.width = 100;
      this.height = 100;
      this.naturalWidth = 100;
      this.naturalHeight = 100;
      this.complete = true;
      this.onload?.();
    }, 0);
  }
} as typeof Image;

// Mock Audio for audio processing
global.Audio = class MockAudio {
  onloadedmetadata: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = "";
  duration: number = 0;
  currentTime: number = 0;
  volume: number = 1;
  muted: boolean = false;
  paused: boolean = true;
  ended: boolean = false;

  constructor() {
    setTimeout(() => {
      this.duration = 120;
      this.onloadedmetadata?.();
    }, 0);
  }

  play(): Promise<void> {
    this.paused = false;
    return Promise.resolve();
  }

  pause(): void {
    this.paused = true;
  }

  load(): void {
    // Mock implementation
  }
} as typeof Audio;

// Mock Video for video processing
global.HTMLVideoElement.prototype.load = vi.fn();
global.HTMLVideoElement.prototype.play = vi.fn(() => Promise.resolve());
global.HTMLVideoElement.prototype.pause = vi.fn();
global.HTMLVideoElement.prototype.addEventListener = vi.fn();
global.HTMLVideoElement.prototype.removeEventListener = vi.fn();

// Mock createImageBitmap
global.createImageBitmap = vi.fn(() =>
  Promise.resolve({
    width: 100,
    height: 100,
    close: vi.fn(),
  } as ImageBitmap),
);

// Mock OffscreenCanvas if not available
if (!global.OffscreenCanvas) {
  global.OffscreenCanvas = class MockOffscreenCanvas {
    width: number;
    height: number;

    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }

    getContext() {
      return {
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(100),
          width: 10,
          height: 10,
        })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(100),
          width: 10,
          height: 10,
        })),
      } as unknown as OffscreenCanvasRenderingContext2D;
    }

    convertToBlob() {
      return Promise.resolve(new Blob(["mock"], { type: "image/png" }));
    }
  } as unknown as typeof OffscreenCanvas;
}
