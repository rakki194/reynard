/**
 * Canvas Test Setup - For packages that need canvas, fabric.js, and 2D graphics APIs
 */
import { vi } from "vitest";
import { setupBrowserTest } from "./browser-setup.js";
/**
 * Setup for canvas packages (reynard-boundingbox, etc.)
 * Includes canvas, fabric.js, and 2D graphics mocks
 */
export function setupCanvasTest() {
    setupBrowserTest();
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
    }));
    // Mock canvas context
    const mockCanvasContext = {
        // Canvas properties
        canvas: {},
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
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext);
    // Mock fabric.js
    vi.mock("fabric", () => ({
        Canvas: vi.fn().mockImplementation((element, options) => {
            const eventHandlers = new Map();
            const canvas = {
                add: vi.fn(),
                remove: vi.fn(),
                clear: vi.fn(),
                renderAll: vi.fn(),
                dispose: vi.fn(),
                getPointer: vi.fn(() => ({ x: 100, y: 100 })),
                findTarget: vi.fn(() => null),
                on: vi.fn((event, handler) => {
                    eventHandlers.set(event, handler);
                }),
                off: vi.fn((event) => {
                    eventHandlers.delete(event);
                }),
                setActiveObject: vi.fn(),
                getActiveObject: vi.fn(() => null),
                getElement: vi.fn(() => element),
                width: options?.width || 800,
                height: options?.height || 600,
                backgroundColor: options?.backgroundColor || "transparent",
                selection: options?.selection !== false,
                preserveObjectStacking: options?.preserveObjectStacking !== false,
                // Add method to trigger events for testing
                triggerEvent: vi.fn((event, data) => {
                    const handler = eventHandlers.get(event);
                    if (handler) {
                        handler(data);
                    }
                }),
            };
            // Store the mock canvas globally for testing
            global.mockFabricCanvas = canvas;
            element.__fabricCanvas = canvas;
            return canvas;
        }),
        Rect: vi.fn().mockImplementation((options) => {
            const rect = {
                set: vi.fn(),
                setControlsVisibility: vi.fn(),
                data: options?.data || {},
                left: options?.left || 0,
                top: options?.top || 0,
                width: options?.width || 100,
                height: options?.height || 100,
                fill: options?.fill || "transparent",
                stroke: options?.stroke || "#000",
                strokeWidth: options?.strokeWidth || 1,
                cornerColor: options?.cornerColor || "#000",
                cornerSize: options?.cornerSize || 8,
                transparentCorners: options?.transparentCorners !== false,
                hasRotatingPoint: options?.hasRotatingPoint !== false,
                lockRotation: options?.lockRotation !== false,
                selectable: options?.selectable !== false,
                evented: options?.evented !== false,
                strokeDashArray: options?.strokeDashArray || null,
            };
            return rect;
        }),
        Circle: vi.fn().mockImplementation((options) => {
            const circle = {
                set: vi.fn(),
                setControlsVisibility: vi.fn(),
                data: options?.data || {},
                left: options?.left || 0,
                top: options?.top || 0,
                radius: options?.radius || 50,
                fill: options?.fill || "transparent",
                stroke: options?.stroke || "#000",
                strokeWidth: options?.strokeWidth || 1,
                cornerColor: options?.cornerColor || "#000",
                cornerSize: options?.cornerSize || 8,
                transparentCorners: options?.transparentCorners !== false,
                hasRotatingPoint: options?.hasRotatingPoint !== false,
                lockRotation: options?.lockRotation !== false,
                selectable: options?.selectable !== false,
                evented: options?.evented !== false,
                strokeDashArray: options?.strokeDashArray || null,
            };
            return circle;
        }),
        Line: vi.fn().mockImplementation((options) => {
            const line = {
                set: vi.fn(),
                setControlsVisibility: vi.fn(),
                data: options?.data || {},
                x1: options?.x1 || 0,
                y1: options?.y1 || 0,
                x2: options?.x2 || 100,
                y2: options?.y2 || 100,
                stroke: options?.stroke || "#000",
                strokeWidth: options?.strokeWidth || 1,
                cornerColor: options?.cornerColor || "#000",
                cornerSize: options?.cornerSize || 8,
                transparentCorners: options?.transparentCorners !== false,
                hasRotatingPoint: options?.hasRotatingPoint !== false,
                lockRotation: options?.lockRotation !== false,
                selectable: options?.selectable !== false,
                evented: options?.evented !== false,
                strokeDashArray: options?.strokeDashArray || null,
            };
            return line;
        }),
    }));
    // Export mock canvas for use in tests
    global.getMockFabricCanvas = () => global.mockFabricCanvas;
}
