/**
 * Media Test Setup - For packages that need File, Image, Audio, Video, and media processing APIs
 */

import { vi } from "vitest";
import { setupBrowserTest } from "./browser-setup";

/**
 * Setup for media processing packages (reynard-file-processing, etc.)
 * Includes File, Image, Audio, Video, Canvas, and media processing mocks
 */
export function setupMediaTest() {
  setupBrowserTest();

  // Mock File API
  global.File = class MockFile {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    webkitRelativePath: string = "";

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

    static fromString(content: string, name: string, type?: string) {
      return new File([content], name, { type });
    }

    arrayBuffer(): Promise<ArrayBuffer> {
      return Promise.resolve(new ArrayBuffer(0));
    }

    bytes(): Promise<Uint8Array> {
      return Promise.resolve(new Uint8Array(0));
    }

    slice(start?: number, end?: number, contentType?: string): Blob {
      return new Blob();
    }

    stream(): ReadableStream<Uint8Array> {
      return new ReadableStream();
    }

    text(): Promise<string> {
      return Promise.resolve("");
    }
  } as any;

  // Mock FileReader
  global.FileReader = class MockFileReader {
    result: string | ArrayBuffer | null = null;
    error: DOMException | null = null;
    readyState: number = 0;
    onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
    onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
    onloadend: ((event: ProgressEvent<FileReader>) => void) | null = null;
    onabort: ((event: ProgressEvent<FileReader>) => void) | null = null;
    onloadstart: ((event: ProgressEvent<FileReader>) => void) | null = null;
    onprogress: ((event: ProgressEvent<FileReader>) => void) | null = null;

    static readonly EMPTY = 0;
    static readonly LOADING = 1;
    static readonly DONE = 2;

    readAsText() {
      setTimeout(() => {
        this.result = "mock file content";
        this.readyState = 2;
        this.onload?.(new ProgressEvent("load") as any);
        this.onloadend?.(new ProgressEvent("loadend") as any);
      }, 0);
    }

    readAsDataURL() {
      setTimeout(() => {
        this.result = "data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=";
        this.readyState = 2;
        this.onload?.(new ProgressEvent("load") as any);
        this.onloadend?.(new ProgressEvent("loadend") as any);
      }, 0);
    }

    readAsArrayBuffer() {
      setTimeout(() => {
        this.result = new ArrayBuffer(8);
        this.readyState = 2;
        this.onload?.(new ProgressEvent("load") as any);
        this.onloadend?.(new ProgressEvent("loadend") as any);
      }, 0);
    }

    abort() {
      this.readyState = 2;
    }
  } as any;

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
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        translate: vi.fn(),
        transform: vi.fn(),
        setTransform: vi.fn(),
        resetTransform: vi.fn(),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        clip: vi.fn(),
        isPointInPath: vi.fn(() => false),
        isPointInStroke: vi.fn(() => false),
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
      }) as unknown as CanvasRenderingContext2D,
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
    const blob = new Blob(["mock-image"], { type: "image/png" });
    callback(blob);
  });

  global.HTMLCanvasElement.prototype.toDataURL = vi.fn(
    () => "data:image/png;base64,mock",
  );

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
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          strokeRect: vi.fn(),
          beginPath: vi.fn(),
          closePath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          scale: vi.fn(),
          rotate: vi.fn(),
          translate: vi.fn(),
          transform: vi.fn(),
          setTransform: vi.fn(),
          resetTransform: vi.fn(),
          fillText: vi.fn(),
          strokeText: vi.fn(),
          measureText: vi.fn(() => ({ width: 0 })),
          clip: vi.fn(),
          isPointInPath: vi.fn(() => false),
          isPointInStroke: vi.fn(() => false),
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
        } as unknown as OffscreenCanvasRenderingContext2D;
      }

      convertToBlob() {
        return Promise.resolve(new Blob(["mock"], { type: "image/png" }));
      }
    } as unknown as typeof OffscreenCanvas;
  }
}
