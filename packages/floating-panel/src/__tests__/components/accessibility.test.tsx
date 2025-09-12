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

describe("FloatingPanel - Accessibility", () => {
  const mockContent = <div data-testid="panel-content">Panel Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have proper ARIA role", () => {
    render(() => <FloatingPanel>{mockContent}</FloatingPanel>);

    const panel = screen.getByRole("generic");
    expect(panel).toBeInTheDocument();
  });

  it("should support custom ARIA label", () => {
    render(() => (
      <FloatingPanel aria-label="Custom Panel">{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByLabelText("Custom Panel");
    expect(panel).toBeInTheDocument();
  });

  it("should support ARIA described by", () => {
    render(() => (
      <FloatingPanel aria-describedby="panel-description">
        {mockContent}
      </FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveAttribute("aria-describedby", "panel-description");
  });

  it("should support ARIA expanded state", () => {
    render(() => (
      <FloatingPanel aria-expanded="true">{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveAttribute("aria-expanded", "true");
  });

  it("should support ARIA hidden state", () => {
    render(() => (
      <FloatingPanel aria-hidden="true">{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveAttribute("aria-hidden", "true");
  });

  it("should support tab index", () => {
    render(() => (
      <FloatingPanel tabIndex={0}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    expect(panel).toHaveAttribute("tabindex", "0");
  });

  it("should support custom data attributes", () => {
    render(() => (
      <FloatingPanel data-testid="custom-panel">{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByTestId("custom-panel");
    expect(panel).toBeInTheDocument();
  });
});
