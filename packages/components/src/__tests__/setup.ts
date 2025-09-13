/**
 * Test setup for Reynard Components
 * Uses reynard-testing package for consistent testing setup
 */

import { vi, afterEach } from "vitest";
import { cleanup } from "@solidjs/testing-library";
import { extendExpect } from "./test-utils";

// Mock CSS modules
vi.mock("*.module.css", () => ({}));

// Mock CSS files
vi.mock("*.css", () => ({}));

// Mock fluent-icons package
vi.mock("reynard-fluent-icons", () => ({
  getIcon: vi.fn((name: string) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("data-testid", `icon-${name}`);
    svg.textContent = name;
    return svg;
  }),
  iconRegistry: {
    getIcon: vi.fn((name: string) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("data-testid", `icon-${name}`);
      svg.textContent = name;
      return svg;
    }),
  },
  searchIcons: vi.fn(() => []),
  getAllIconNames: vi.fn(() => []),
  getIconPackages: vi.fn(() => []),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock getComputedStyle
Object.defineProperty(window, "getComputedStyle", {
  value: () => ({
    getPropertyValue: () => "",
  }),
});

// Extend expect with custom matchers
extendExpect();

// Clean up SolidJS components after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
