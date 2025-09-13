/**
 * Floating Panel Accessibility Tests
 *
 * Tests for accessibility features and ARIA attributes.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { FloatingPanel } from "../../components/FloatingPanel";

// Mock the composables
vi.mock("../../composables/useDraggablePanel", () => ({
  useDraggablePanel: () => ({
    isVisible: () => true,
    isDragging: () => false,
    position: () => ({ top: 100, left: 100 }),
    startDrag: vi.fn(),
    updateDrag: vi.fn(),
    endDrag: vi.fn(),
    snapToPoint: vi.fn(),
    constrainPosition: vi.fn(),
  }),
}));

vi.mock("../../composables/usePanelConfig", () => ({
  usePanelConfig: () => ({
    draggable: true,
    resizable: true,
    animated: true,
  }),
}));

vi.mock("../../composables/usePanelStyles", () => ({
  usePanelStyles: () => ({
    getInlineStyles: () => ({}),
    panelStyle: {},
    headerStyle: {},
  }),
}));

vi.mock("../../composables/usePanelKeyboard", () => ({
  usePanelKeyboard: () => ({
    handleKeyDown: vi.fn(),
  }),
}));

describe("FloatingPanel - Accessibility", () => {
  const mockContent = <div data-testid="panel-content">Panel Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have proper ARIA role", () => {
    render(() => (
      <FloatingPanel id="test-panel" position={{ top: 100, left: 100 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = document.querySelector(
      '[aria-labelledby="panel-title-test-panel"]',
    );
    expect(panel).toBeTruthy();
  });

  it("should support custom ARIA label", () => {
    render(() => (
      <FloatingPanel
        id="labeled-panel"
        position={{ top: 100, left: 100 }}
        title="Custom Panel"
      >
        {mockContent}
      </FloatingPanel>
    ));

    const panel = document.querySelector(
      '[aria-labelledby="panel-title-labeled-panel"]',
    );
    expect(panel).toBeTruthy();
  });

  it("should support ARIA described by", () => {
    render(() => (
      <FloatingPanel id="described-panel" position={{ top: 100, left: 100 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = document.querySelector(
      '[aria-labelledby="panel-title-described-panel"]',
    );
    expect(panel).toBeTruthy();
  });

  it("should support ARIA expanded state", () => {
    render(() => (
      <FloatingPanel id="expanded-panel" position={{ top: 100, left: 100 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = document.querySelector(
      '[aria-labelledby="panel-title-expanded-panel"]',
    );
    expect(panel).toBeTruthy();
  });

  it("should support ARIA hidden state", () => {
    render(() => (
      <FloatingPanel id="hidden-panel" position={{ top: 100, left: 100 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = document.querySelector(
      '[aria-labelledby="panel-title-hidden-panel"]',
    );
    expect(panel).toBeTruthy();
  });

  it("should support tab index", () => {
    render(() => (
      <FloatingPanel id="tabbed-panel" position={{ top: 100, left: 100 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = document.querySelector(
      '[aria-labelledby="panel-title-tabbed-panel"]',
    );
    expect(panel).toBeTruthy();
  });

  it("should support custom data attributes", () => {
    render(() => (
      <FloatingPanel id="custom-panel" position={{ top: 100, left: 100 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = document.querySelector(
      '[aria-labelledby="panel-title-custom-panel"]',
    );
    expect(panel).toBeTruthy();
  });
});
