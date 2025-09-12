/**
 * Floating Panel Interaction Tests
 *
 * Tests for user interactions and event handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
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

describe("FloatingPanel - Interactions", () => {
  const mockContent = <div data-testid="panel-content">Panel Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle click events", () => {
    const onClick = vi.fn();
    render(() => (
      <FloatingPanel onClick={onClick}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    fireEvent.click(panel);

    expect(onClick).toHaveBeenCalled();
  });

  it("should handle double click events", () => {
    const onDoubleClick = vi.fn();
    render(() => (
      <FloatingPanel onDoubleClick={onDoubleClick}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    fireEvent.doubleClick(panel);

    expect(onDoubleClick).toHaveBeenCalled();
  });

  it("should handle mouse enter events", () => {
    const onMouseEnter = vi.fn();
    render(() => (
      <FloatingPanel onMouseEnter={onMouseEnter}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    fireEvent.mouseEnter(panel);

    expect(onMouseEnter).toHaveBeenCalled();
  });

  it("should handle mouse leave events", () => {
    const onMouseLeave = vi.fn();
    render(() => (
      <FloatingPanel onMouseLeave={onMouseLeave}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    fireEvent.mouseLeave(panel);

    expect(onMouseLeave).toHaveBeenCalled();
  });

  it("should handle focus events", () => {
    const onFocus = vi.fn();
    render(() => (
      <FloatingPanel onFocus={onFocus}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    fireEvent.focus(panel);

    expect(onFocus).toHaveBeenCalled();
  });

  it("should handle blur events", () => {
    const onBlur = vi.fn();
    render(() => (
      <FloatingPanel onBlur={onBlur}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    fireEvent.blur(panel);

    expect(onBlur).toHaveBeenCalled();
  });

  it("should handle key down events", () => {
    const onKeyDown = vi.fn();
    render(() => (
      <FloatingPanel onKeyDown={onKeyDown}>{mockContent}</FloatingPanel>
    ));

    const panel = screen.getByRole("generic");
    fireEvent.keyDown(panel, { key: "Escape" });

    expect(onKeyDown).toHaveBeenCalled();
  });
});
