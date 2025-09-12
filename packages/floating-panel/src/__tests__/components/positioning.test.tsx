/**
 * Floating Panel Positioning Tests
 *
 * Tests for positioning and layout functionality.
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

describe("FloatingPanel - Positioning", () => {
  const mockContent = <div data-testid="panel-content">Panel Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should apply absolute positioning", () => {
    render(() => <FloatingPanel>{mockContent}</FloatingPanel>);

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("position: absolute");
  });

  it("should handle position updates", () => {
    render(() => (
      <FloatingPanel position={{ top: 150, left: 250 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("top: 150px; left: 250px");
  });

  it("should handle size updates", () => {
    render(() => (
      <FloatingPanel size={{ width: 500, height: 400 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("width: 500px; height: 400px");
  });

  it("should handle z-index updates", () => {
    render(() => (
      <FloatingPanel zIndex={2000}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("z-index: 2000");
  });

  it("should handle transform positioning", () => {
    render(() => (
      <FloatingPanel position={{ top: 0, left: 0 }} useTransform>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("transform: translate(0px, 0px)");
  });

  it("should handle negative positions", () => {
    render(() => (
      <FloatingPanel position={{ top: -50, left: -100 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("top: -50px; left: -100px");
  });

  it("should handle zero positions", () => {
    render(() => (
      <FloatingPanel position={{ top: 0, left: 0 }}>
        {mockContent}
      </FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveStyle("top: 0px; left: 0px");
  });
});
