/**
 * Drawer Component Test Suite
 * 
 * Tests for the Drawer component including positioning, animations,
 * backdrop handling, and accessibility features.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { Drawer } from "../Drawer";

describe("Drawer", () => {
  const mockContent = <div data-testid="drawer-content">Drawer Content</div>;
  const mockTitle = <div data-testid="drawer-title">Drawer Title</div>;
  const mockFooter = <div data-testid="drawer-footer">Drawer Footer</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when open", () => {
      render(() => 
        <Drawer open={true}>
          {mockContent}
        </Drawer>
      );
      
      expect(screen.getByTestId("drawer-content")).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(() => 
        <Drawer open={false}>
          {mockContent}
        </Drawer>
      );
      
      expect(screen.queryByTestId("drawer-content")).not.toBeInTheDocument();
    });

    it("should render with title and footer", () => {
      render(() => 
        <Drawer 
          open={true}
          title={mockTitle}
          footer={mockFooter}
        >
          {mockContent}
        </Drawer>
      );
      
      expect(screen.getByTestId("drawer-title")).toBeInTheDocument();
      expect(screen.getByTestId("drawer-content")).toBeInTheDocument();
      expect(screen.getByTestId("drawer-footer")).toBeInTheDocument();
    });

    it("should apply custom class name", () => {
      render(() => 
        <Drawer 
          open={true}
          class="custom-drawer"
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer", "custom-drawer");
    });
  });

  describe("Positioning", () => {
    it("should render on the right by default", () => {
      render(() => 
        <Drawer open={true}>
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--right");
    });

    it("should render on the left when specified", () => {
      render(() => 
        <Drawer 
          open={true}
          position="left"
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--left");
    });

    it("should render on the top when specified", () => {
      render(() => 
        <Drawer 
          open={true}
          position="top"
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--top");
    });

    it("should render on the bottom when specified", () => {
      render(() => 
        <Drawer 
          open={true}
          position="bottom"
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--bottom");
    });
  });

  describe("Sizing", () => {
    it("should apply medium size by default", () => {
      render(() => 
        <Drawer open={true}>
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--md");
    });

    it("should apply small size when specified", () => {
      render(() => 
        <Drawer 
          open={true}
          size="sm"
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--sm");
    });

    it("should apply large size when specified", () => {
      render(() => 
        <Drawer 
          open={true}
          size="lg"
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--lg");
    });

    it("should apply extra large size when specified", () => {
      render(() => 
        <Drawer 
          open={true}
          size="xl"
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--xl");
    });

    it("should apply full size when specified", () => {
      render(() => 
        <Drawer 
          open={true}
          size="full"
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--full");
    });

    it("should apply custom size when specified", () => {
      render(() => 
        <Drawer 
          open={true}
          customSize="500px"
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveStyle("width: 500px");
    });
  });

  describe("Close Button", () => {
    it("should show close button by default", () => {
      render(() => 
        <Drawer open={true}>
          {mockContent}
        </Drawer>
      );
      
      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    });

    it("should hide close button when disabled", () => {
      render(() => 
        <Drawer 
          open={true}
          showCloseButton={false}
        >
          {mockContent}
        </Drawer>
      );
      
      expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", () => {
      const onClose = vi.fn();
      render(() => 
        <Drawer 
          open={true}
          onClose={onClose}
        >
          {mockContent}
        </Drawer>
      );
      
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("Backdrop Handling", () => {
    it("should close on backdrop click by default", () => {
      const onClose = vi.fn();
      render(() => 
        <Drawer 
          open={true}
          onClose={onClose}
        >
          {mockContent}
        </Drawer>
      );
      
      const backdrop = screen.getByTestId("drawer-backdrop");
      fireEvent.click(backdrop);
      
      expect(onClose).toHaveBeenCalled();
    });

    it("should not close on backdrop click when disabled", () => {
      const onClose = vi.fn();
      render(() => 
        <Drawer 
          open={true}
          onClose={onClose}
          closeOnBackdrop={false}
        >
          {mockContent}
        </Drawer>
      );
      
      const backdrop = screen.getByTestId("drawer-backdrop");
      fireEvent.click(backdrop);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not close when clicking drawer content", () => {
      const onClose = vi.fn();
      render(() => 
        <Drawer 
          open={true}
          onClose={onClose}
        >
          {mockContent}
        </Drawer>
      );
      
      const content = screen.getByTestId("drawer-content");
      fireEvent.click(content);
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Handling", () => {
    it("should close on escape key by default", () => {
      const onClose = vi.fn();
      render(() => 
        <Drawer 
          open={true}
          onClose={onClose}
        >
          {mockContent}
        </Drawer>
      );
      
      fireEvent.keyDown(document, { key: "Escape" });
      
      expect(onClose).toHaveBeenCalled();
    });

    it("should not close on escape key when disabled", () => {
      const onClose = vi.fn();
      render(() => 
        <Drawer 
          open={true}
          onClose={onClose}
          closeOnEscape={false}
        >
          {mockContent}
        </Drawer>
      );
      
      fireEvent.keyDown(document, { key: "Escape" });
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should focus close button on open", () => {
      render(() => 
        <Drawer open={true}>
          {mockContent}
        </Drawer>
      );
      
      const closeButton = screen.getByRole("button", { name: /close/i });
      expect(closeButton).toHaveFocus();
    });
  });

  describe("Z-Index", () => {
    it("should apply default z-index", () => {
      render(() => 
        <Drawer open={true}>
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveStyle("z-index: 1000");
    });

    it("should apply custom z-index", () => {
      render(() => 
        <Drawer 
          open={true}
          zIndex={2000}
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveStyle("z-index: 2000");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(() => 
        <Drawer 
          open={true}
          title={mockTitle}
        >
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveAttribute("aria-modal", "true");
      expect(drawer).toHaveAttribute("aria-labelledby");
    });

    it("should trap focus within drawer", () => {
      render(() => 
        <Drawer open={true}>
          <button>First Button</button>
          <button>Second Button</button>
        </Drawer>
      );
      
      const firstButton = screen.getByText("First Button");
      const secondButton = screen.getByText("Second Button");
      
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Tab should cycle within drawer
      fireEvent.keyDown(firstButton, { key: "Tab" });
      expect(secondButton).toHaveFocus();
    });

    it("should restore focus when closed", () => {
      const triggerButton = document.createElement("button");
      triggerButton.textContent = "Open Drawer";
      document.body.appendChild(triggerButton);
      triggerButton.focus();
      
      const { rerender } = render(() => 
        <Drawer open={true}>
          {mockContent}
        </Drawer>
      );
      
      expect(triggerButton).not.toHaveFocus();
      
      rerender(() => 
        <Drawer open={false}>
          {mockContent}
        </Drawer>
      );
      
      expect(triggerButton).toHaveFocus();
      
      document.body.removeChild(triggerButton);
    });
  });

  describe("Animation States", () => {
    it("should apply opening animation class", () => {
      render(() => 
        <Drawer open={true}>
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--open");
    });

    it("should apply closing animation class when closing", () => {
      const { rerender } = render(() => 
        <Drawer open={true}>
          {mockContent}
        </Drawer>
      );
      
      rerender(() => 
        <Drawer open={false}>
          {mockContent}
        </Drawer>
      );
      
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("drawer--closing");
    });
  });
});
