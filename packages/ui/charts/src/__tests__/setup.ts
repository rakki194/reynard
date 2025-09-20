/**
 * Test Setup for reynard-charts
 *
 * Basic test setup with necessary mocks for charts testing.
 */

import { vi, beforeEach, afterEach } from "vitest";

// Mock global objects
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance API
Object.defineProperty(global, "performance", {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  },
  writable: true,
});

// Mock DOM environment for SolidJS testing
const mockElement = {
  tagName: "DIV",
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  innerHTML: "",
  textContent: "",
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
  },
  style: {},
  getBoundingClientRect: vi.fn(() => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  })),
};

Object.defineProperty(global, "document", {
  value: {
    body: {
      innerHTML: "",
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
    createElement: vi.fn(tagName => ({
      ...mockElement,
      tagName: tagName.toUpperCase(),
    })),
    createElementNS: vi.fn((namespace, tagName) => ({
      ...mockElement,
      tagName: tagName.toUpperCase(),
    })),
    getElementById: vi.fn(() => mockElement),
    querySelector: vi.fn(() => mockElement),
    querySelectorAll: vi.fn(() => [mockElement]),
  },
  writable: true,
});

Object.defineProperty(global, "window", {
  value: {
    document: global.document,
    getComputedStyle: vi.fn(() => ({
      getPropertyValue: vi.fn(() => ""),
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

// Mock SolidJS client-only APIs
Object.defineProperty(global, "onMount", {
  value: vi.fn(callback => {
    // In test environment, execute immediately
    callback();
  }),
  writable: true,
});

Object.defineProperty(global, "onCleanup", {
  value: vi.fn(callback => {
    // In test environment, store cleanup for later
    return callback;
  }),
  writable: true,
});

Object.defineProperty(global, "createEffect", {
  value: vi.fn(callback => {
    // In test environment, execute immediately
    callback();
  }),
  writable: true,
});

Object.defineProperty(global, "createSignal", {
  value: vi.fn(initialValue => {
    let value = initialValue;
    return [
      () => value,
      newValue => {
        value = newValue;
      },
    ];
  }),
  writable: true,
});

Object.defineProperty(global, "createMemo", {
  value: vi.fn(callback => {
    // In test environment, execute immediately and return the result
    return callback();
  }),
  writable: true,
});

Object.defineProperty(global, "splitProps", {
  value: vi.fn((props, keys) => {
    // Simple implementation for testing
    const split = keys.map((key: string) => props[key]);
    const rest = { ...props };
    keys.forEach((key: string) => delete rest[key]);
    return [split, rest];
  }),
  writable: true,
});

// Mock Chart.js
const mockChart = {
  destroy: vi.fn(),
  update: vi.fn(),
  render: vi.fn(),
  resize: vi.fn(),
};

Object.defineProperty(global, "Chart", {
  value: vi.fn(() => mockChart),
  writable: true,
});

// Mock Chart.js static methods
Object.defineProperty(global.Chart, "register", {
  value: vi.fn(),
  writable: true,
});

// Mock HTMLCanvasElement
Object.defineProperty(global, "HTMLCanvasElement", {
  value: class MockHTMLCanvasElement {
    getContext() {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Array(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Array(4) })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        transform: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        arc: vi.fn(),
        arcTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        rect: vi.fn(),
      };
    }
  },
  writable: true,
});

// Mock window object to simulate client-side environment
Object.defineProperty(global, "window", {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    requestAnimationFrame: vi.fn(callback => setTimeout(callback, 16)),
    cancelAnimationFrame: vi.fn(),
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
  },
  writable: true,
});

// Mock global to simulate server-side environment for SolidJS
Object.defineProperty(global, "global", {
  value: global,
  writable: true,
});

// Mock process to simulate Node.js environment
Object.defineProperty(global, "process", {
  value: {
    env: { NODE_ENV: "test" },
    browser: false,
  },
  writable: true,
});

// Mock SolidJS environment detection
Object.defineProperty(global, "DEV", {
  value: false,
  writable: true,
});

Object.defineProperty(global, "SSR", {
  value: true,
  writable: true,
});

// Mock SolidJS hydration
Object.defineProperty(global, "hydrate", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(global, "render", {
  value: vi.fn(),
  writable: true,
});

// Mock SolidJS client-only detection
Object.defineProperty(global, "isServer", {
  value: true,
  writable: true,
});

// Mock SolidJS client-only API
Object.defineProperty(global, "isClient", {
  value: false,
  writable: true,
});

// Mock SolidJS hydration detection
Object.defineProperty(global, "isHydrating", {
  value: false,
  writable: true,
});

// Mock document.createElement to return proper canvas elements
const originalCreateElement = global.document.createElement;
global.document.createElement = vi.fn((tagName: string) => {
  if (tagName.toLowerCase() === "canvas") {
    return {
      tagName: "CANVAS",
      getContext: vi.fn(() => ({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Array(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Array(4) })),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        transform: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        arc: vi.fn(),
        arcTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        rect: vi.fn(),
      })),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      innerHTML: "",
      textContent: "",
    };
  }
  return originalCreateElement(tagName);
});

// Setup test environment
beforeEach(() => {
  vi.clearAllMocks();
  // Reset document body
  if (global.document && global.document.body) {
    global.document.body.innerHTML = "";
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});
