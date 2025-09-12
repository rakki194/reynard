/**
 * Floating Panel Component Test Suite
 *
 * Tests for the FloatingPanel component including positioning,
 * animations, and interaction handling.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { FloatingPanel } from "../FloatingPanel";

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

describe("FloatingPanel", () => {
  const mockContent = <div data-testid="panel-content">Panel Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
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
  });

  describe("Configuration", () => {
    it("should apply default configuration", () => {
      render(() => <FloatingPanel>{mockContent}</FloatingPanel>);

      const panel = screen.getByRole("generic");
      expect(panel).toHaveClass("floating-panel");
    });

    it("should apply custom configuration", () => {
      const customConfig = {
        draggable: true,
        resizable: true,
        closable: true,
        backdrop: true,
        backdropBlur: true,
        backdropColor: "rgba(0, 0, 0, 0.5)",
        animationDelay: 100,
        animationDuration: 500,
        animationEasing: "ease-in-out",
        showOnHover: true,
        hoverDelay: 300,
        persistent: false,
        theme: "dark",
      };

      render(() => (
        <FloatingPanel config={customConfig}>{mockContent}</FloatingPanel>
      ));

      const panel = screen.getByRole("generic");
      expect(panel).toHaveClass("floating-panel");
    });

    it("should show close button when closable", () => {
      render(() => (
        <FloatingPanel config={{ closable: true }}>{mockContent}</FloatingPanel>
      ));

      expect(
        screen.getByRole("button", { name: /close/i }),
      ).toBeInTheDocument();
    });

    it("should not show close button when not closable", () => {
      render(() => (
        <FloatingPanel config={{ closable: false }}>
          {mockContent}
        </FloatingPanel>
      ));

      expect(
        screen.queryByRole("button", { name: /close/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Event Handling", () => {
    it("should call onShow when panel is shown", () => {
      const onShow = vi.fn();
      render(() => (
        <FloatingPanel onShow={onShow}>{mockContent}</FloatingPanel>
      ));

      // Simulate panel show event
      const panel = screen.getByRole("generic");
      fireEvent.animationStart(panel);

      expect(onShow).toHaveBeenCalled();
    });

    it("should call onHide when panel is hidden", () => {
      const onHide = vi.fn();
      render(() => (
        <FloatingPanel onHide={onHide}>{mockContent}</FloatingPanel>
      ));

      // Simulate panel hide event
      const panel = screen.getByRole("generic");
      fireEvent.animationEnd(panel);

      expect(onHide).toHaveBeenCalled();
    });

    it("should call onDrag when panel is dragged", () => {
      const onDrag = vi.fn();
      render(() => (
        <FloatingPanel onDrag={onDrag}>{mockContent}</FloatingPanel>
      ));

      // Simulate drag event
      const panel = screen.getByRole("generic");
      fireEvent.pointerDown(panel);
      fireEvent.pointerMove(panel);

      expect(onDrag).toHaveBeenCalled();
    });

    it("should call onClose when close button is clicked", () => {
      const onClose = vi.fn();
      render(() => (
        <FloatingPanel config={{ closable: true }} onClose={onClose}>
          {mockContent}
        </FloatingPanel>
      ));

      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("Hover Behavior", () => {
    it("should show panel on hover when enabled", () => {
      render(() => (
        <FloatingPanel config={{ showOnHover: true }}>
          {mockContent}
        </FloatingPanel>
      ));

      const panel = screen.getByRole("generic");
      fireEvent.mouseEnter(panel);

      expect(panel).toHaveClass("floating-panel--visible");
    });

    it("should hide panel on mouse leave when hover is enabled", () => {
      render(() => (
        <FloatingPanel config={{ showOnHover: true }}>
          {mockContent}
        </FloatingPanel>
      ));

      const panel = screen.getByRole("generic");
      fireEvent.mouseEnter(panel);
      fireEvent.mouseLeave(panel);

      expect(panel).toHaveClass("floating-panel--hidden");
    });

    it("should respect hover delay", async () => {
      render(() => (
        <FloatingPanel
          config={{
            showOnHover: true,
            hoverDelay: 100,
          }}
        >
          {mockContent}
        </FloatingPanel>
      ));

      const panel = screen.getByRole("generic");
      fireEvent.mouseEnter(panel);

      // Should not show immediately
      expect(panel).not.toHaveClass("floating-panel--visible");

      // Should show after delay
      await waitFor(
        () => {
          expect(panel).toHaveClass("floating-panel--visible");
        },
        { timeout: 200 },
      );
    });
  });

  describe("Backdrop", () => {
    it("should show backdrop when enabled", () => {
      render(() => (
        <FloatingPanel config={{ backdrop: true }}>{mockContent}</FloatingPanel>
      ));

      expect(screen.getByTestId("panel-backdrop")).toBeInTheDocument();
    });

    it("should not show backdrop when disabled", () => {
      render(() => (
        <FloatingPanel config={{ backdrop: false }}>
          {mockContent}
        </FloatingPanel>
      ));

      expect(screen.queryByTestId("panel-backdrop")).not.toBeInTheDocument();
    });

    it("should apply backdrop blur when enabled", () => {
      render(() => (
        <FloatingPanel config={{ backdrop: true, backdropBlur: true }}>
          {mockContent}
        </FloatingPanel>
      ));

      const backdrop = screen.getByTestId("panel-backdrop");
      expect(backdrop).toHaveClass("floating-panel-backdrop--blur");
    });

    it("should apply custom backdrop color", () => {
      render(() => (
        <FloatingPanel
          config={{
            backdrop: true,
            backdropColor: "rgba(255, 0, 0, 0.5)",
          }}
        >
          {mockContent}
        </FloatingPanel>
      ));

      const backdrop = screen.getByTestId("panel-backdrop");
      expect(backdrop).toHaveStyle("background-color: rgba(255, 0, 0, 0.5)");
    });
  });

  describe("Themes", () => {
    it("should apply default theme", () => {
      render(() => <FloatingPanel>{mockContent}</FloatingPanel>);

      const panel = screen.getByRole("generic");
      expect(panel).toHaveClass("floating-panel--theme-default");
    });

    it("should apply dark theme", () => {
      render(() => (
        <FloatingPanel config={{ theme: "dark" }}>{mockContent}</FloatingPanel>
      ));

      const panel = screen.getByRole("generic");
      expect(panel).toHaveClass("floating-panel--theme-dark");
    });

    it("should apply light theme", () => {
      render(() => (
        <FloatingPanel config={{ theme: "light" }}>{mockContent}</FloatingPanel>
      ));

      const panel = screen.getByRole("generic");
      expect(panel).toHaveClass("floating-panel--theme-light");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(() => <FloatingPanel>{mockContent}</FloatingPanel>);

      const panel = screen.getByRole("generic");
      expect(panel).toHaveAttribute("aria-label", "Floating panel");
      expect(panel).toHaveAttribute("role", "dialog");
    });

    it("should support keyboard navigation", () => {
      render(() => <FloatingPanel>{mockContent}</FloatingPanel>);

      const panel = screen.getByRole("generic");
      expect(panel).toHaveAttribute("tabindex", "0");
    });

    it("should handle escape key", () => {
      const onClose = vi.fn();
      render(() => (
        <FloatingPanel config={{ closable: true }} onClose={onClose}>
          {mockContent}
        </FloatingPanel>
      ));

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalled();
    });

    it("should announce panel state changes", () => {
      render(() => <FloatingPanel>{mockContent}</FloatingPanel>);

      const panel = screen.getByRole("generic");
      expect(panel).toHaveAttribute("aria-hidden", "false");
    });
  });

  describe("Animation", () => {
    it("should apply animation duration", () => {
      render(() => (
        <FloatingPanel config={{ animationDuration: 500 }}>
          {mockContent}
        </FloatingPanel>
      ));

      const panel = screen.getByRole("generic");
      expect(panel).toHaveStyle("transition-duration: 500ms");
    });

    it("should apply animation easing", () => {
      render(() => (
        <FloatingPanel config={{ animationEasing: "ease-in-out" }}>
          {mockContent}
        </FloatingPanel>
      ));

      const panel = screen.getByRole("generic");
      expect(panel).toHaveStyle("transition-timing-function: ease-in-out");
    });

    it("should apply animation delay", () => {
      render(() => (
        <FloatingPanel config={{ animationDelay: 100 }}>
          {mockContent}
        </FloatingPanel>
      ));

      const panel = screen.getByRole("generic");
      expect(panel).toHaveStyle("transition-delay: 100ms");
    });
  });
});
