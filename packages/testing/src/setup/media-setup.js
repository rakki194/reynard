/**
 * Media Test Setup - For packages that need File, Image, Audio, Video, and media processing APIs
 */
import { vi } from "vitest";
import { setupBrowserTest } from "./browser-setup.js";
/**
 * Setup for media processing packages (reynard-file-processing, etc.)
 * Includes File, Image, Audio, Video, Canvas, and media processing mocks
 */
export function setupMediaTest() {
    var _a;
    setupBrowserTest();
    // Mock File API
    global.File = class MockFile {
        constructor(_parts, filename, options) {
            Object.defineProperty(this, "name", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "size", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "type", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "lastModified", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "webkitRelativePath", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: ""
            });
            this.name = filename;
            this.size = options?.size || 0;
            this.type = options?.type || "";
            this.lastModified = options?.lastModified || Date.now();
        }
        static fromString(content, name, type) {
            return new File([content], name, { type });
        }
        arrayBuffer() {
            return Promise.resolve(new ArrayBuffer(0));
        }
        bytes() {
            return Promise.resolve(new Uint8Array(0));
        }
        slice(start, end, contentType) {
            return new Blob();
        }
        stream() {
            return new ReadableStream();
        }
        text() {
            return Promise.resolve("");
        }
    };
    // Mock FileReader
    global.FileReader = (_a = class MockFileReader {
            constructor() {
                Object.defineProperty(this, "result", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: null
                });
                Object.defineProperty(this, "error", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: null
                });
                Object.defineProperty(this, "readyState", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: 0
                });
                Object.defineProperty(this, "onload", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: null
                });
                Object.defineProperty(this, "onerror", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: null
                });
                Object.defineProperty(this, "onloadend", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: null
                });
                Object.defineProperty(this, "onabort", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: null
                });
                Object.defineProperty(this, "onloadstart", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: null
                });
                Object.defineProperty(this, "onprogress", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: null
                });
            }
            readAsText() {
                setTimeout(() => {
                    this.result = "mock file content";
                    this.readyState = 2;
                    this.onload?.(new ProgressEvent("load"));
                    this.onloadend?.(new ProgressEvent("loadend"));
                }, 0);
            }
            readAsDataURL() {
                setTimeout(() => {
                    this.result = "data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=";
                    this.readyState = 2;
                    this.onload?.(new ProgressEvent("load"));
                    this.onloadend?.(new ProgressEvent("loadend"));
                }, 0);
            }
            readAsArrayBuffer() {
                setTimeout(() => {
                    this.result = new ArrayBuffer(8);
                    this.readyState = 2;
                    this.onload?.(new ProgressEvent("load"));
                    this.onloadend?.(new ProgressEvent("loadend"));
                }, 0);
            }
            abort() {
                this.readyState = 2;
            }
        },
        Object.defineProperty(_a, "EMPTY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        }),
        Object.defineProperty(_a, "LOADING", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        }),
        Object.defineProperty(_a, "DONE", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2
        }),
        _a);
    // Mock Image for image processing
    global.Image = class MockImage {
        constructor() {
            Object.defineProperty(this, "onload", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            Object.defineProperty(this, "onerror", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            Object.defineProperty(this, "src", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: ""
            });
            Object.defineProperty(this, "width", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "height", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "naturalWidth", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "naturalHeight", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "complete", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: false
            });
            setTimeout(() => {
                this.width = 100;
                this.height = 100;
                this.naturalWidth = 100;
                this.naturalHeight = 100;
                this.complete = true;
                this.onload?.();
            }, 0);
        }
    };
    // Mock Audio for audio processing
    global.Audio = class MockAudio {
        constructor() {
            Object.defineProperty(this, "onloadedmetadata", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            Object.defineProperty(this, "onerror", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            Object.defineProperty(this, "src", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: ""
            });
            Object.defineProperty(this, "duration", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "currentTime", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "volume", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 1
            });
            Object.defineProperty(this, "muted", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: false
            });
            Object.defineProperty(this, "paused", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: true
            });
            Object.defineProperty(this, "ended", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: false
            });
            setTimeout(() => {
                this.duration = 120;
                this.onloadedmetadata?.();
            }, 0);
        }
        play() {
            this.paused = false;
            return Promise.resolve();
        }
        pause() {
            this.paused = true;
        }
        load() {
            // Mock implementation
        }
    };
    // Mock Video for video processing
    global.HTMLVideoElement.prototype.load = vi.fn();
    global.HTMLVideoElement.prototype.play = vi.fn(() => Promise.resolve());
    global.HTMLVideoElement.prototype.pause = vi.fn();
    global.HTMLVideoElement.prototype.addEventListener = vi.fn();
    global.HTMLVideoElement.prototype.removeEventListener = vi.fn();
    // Mock canvas for image processing
    global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
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
    }));
    global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
        const blob = new Blob(["mock-image"], { type: "image/png" });
        callback(blob);
    });
    global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,mock");
    // Mock createImageBitmap
    global.createImageBitmap = vi.fn(() => Promise.resolve({
        width: 100,
        height: 100,
        close: vi.fn(),
    }));
    // Mock OffscreenCanvas if not available
    if (!global.OffscreenCanvas) {
        global.OffscreenCanvas = class MockOffscreenCanvas {
            constructor(width, height) {
                Object.defineProperty(this, "width", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: void 0
                });
                Object.defineProperty(this, "height", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: void 0
                });
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
                };
            }
            convertToBlob() {
                return Promise.resolve(new Blob(["mock"], { type: "image/png" }));
            }
        };
    }
}
