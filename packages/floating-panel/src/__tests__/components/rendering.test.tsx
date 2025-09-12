/**
 * Floating Panel Rendering Tests
 *
 * Tests for basic rendering and display functionality.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { FloatingPanel } from "../../components/FloatingPanel";

// Mock the composables
vi.mock("../../composables/useDraggablePanel", () => ({
  useDraggablePanel: () => ({
    isVisible: true,
    isDragging: false,
    position: { top: 100, left: 100 },
    startDrag: vi.fn(),
    updateDrag: vi.fn(),
    endDrag: vi.fn(),
    snapToPoint: vi.fn(),
    constrainPosition: vi.fn(),
  }),
}));

describe("FloatingPanel - Rendering", () => {
  const mockContent = <div data-testid="panel-content">Panel Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with content", () => {
    render(() => <FloatingPanel>{mockContent}</FloatingPanel>);

    expect(screen.getByTestId("panel-content")).toBeInTheDocument();
  });

  it("should render with custom class name", () => {
    render(() => (
      <FloatingPanel class="custom-panel">{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveClass("floating-panel", "custom-panel");
  });

  it("should render with custom position", () => {
    render(() => (
      <FloatingPanel position={{ top: 200, left: 300 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("top: 200px; left: 300px");
  });

  it("should render with custom size", () => {
    render(() => (
      <FloatingPanel size={{ width: 400, height: 300 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("width: 400px; height: 300px");
  });

  it("should render with z-index", () => {
    render(() => (
      <FloatingPanel zIndex={1500}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("z-index: 1500");
  });

  it("should render with visibility state", () => {
    render(() => (
      <FloatingPanel visible={false}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("display: none");
  });
});
