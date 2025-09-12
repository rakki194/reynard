/**
 * App Layout Component Test Suite
 *
 * Tests for the AppLayout component including sidebar management,
 * responsive behavior, and layout structure.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { AppLayout } from "../../AppLayout";

describe("AppLayout", () => {
  const mockHeader = <div data-testid="header">Header Content</div>;
  const mockSidebar = <div data-testid="sidebar">Sidebar Content</div>;
  const mockContent = <div data-testid="content">Main Content</div>;
  const mockFooter = <div data-testid="footer">Footer Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with all sections", () => {
      render(() => (
        <AppLayout
          header={mockHeader}
          sidebar={mockSidebar}
          footer={mockFooter}
        >
          {mockContent}
        </AppLayout>
      ));

      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("should render with minimal props", () => {
      render(() => <AppLayout>{mockContent}</AppLayout>);

      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("should apply custom class name", () => {
      render(() => <AppLayout class="custom-layout">{mockContent}</AppLayout>);

      const layout = screen.getByRole("generic");
      expect(layout).toHaveClass("app-layout", "custom-layout");
    });
  });

  describe("Sidebar Management", () => {
    it("should show sidebar by default", () => {
      render(() => <AppLayout sidebar={mockSidebar}>{mockContent}</AppLayout>);

      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    it("should hide sidebar when defaultSidebarOpen is false", () => {
      render(() => (
        <AppLayout sidebar={mockSidebar} defaultSidebarOpen={false}>
          {mockContent}
        </AppLayout>
      ));

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveClass("sidebar--collapsed");
    });

    it("should toggle sidebar when collapsible", () => {
      render(() => (
        <AppLayout sidebar={mockSidebar} collapsible={true}>
          {mockContent}
        </AppLayout>
      ));

      const toggleButton = screen.getByRole("button", {
        name: /toggle sidebar/i,
      });
      fireEvent.click(toggleButton);

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveClass("sidebar--collapsed");
    });

    it("should not show toggle button when not collapsible", () => {
      render(() => (
        <AppLayout sidebar={mockSidebar} collapsible={false}>
          {mockContent}
        </AppLayout>
      ));

      expect(
        screen.queryByRole("button", { name: /toggle sidebar/i }),
      ).not.toBeInTheDocument();
    });

    it("should apply custom sidebar width", () => {
      render(() => (
        <AppLayout sidebar={mockSidebar} sidebarWidth={400}>
          {mockContent}
        </AppLayout>
      ));

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveStyle("width: 400px");
    });

    it("should apply collapsed width when collapsed", () => {
      render(() => (
        <AppLayout
          sidebar={mockSidebar}
          collapsedWidth={80}
          defaultSidebarOpen={false}
        >
          {mockContent}
        </AppLayout>
      ));

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveStyle("width: 80px");
    });
  });

  describe("Responsive Behavior", () => {
    it("should handle mobile breakpoint", () => {
      // Mock window.innerWidth
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 600,
      });

      render(() => (
        <AppLayout sidebar={mockSidebar} mobileBreakpoint={768}>
          {mockContent}
        </AppLayout>
      ));

      const layout = screen.getByRole("generic");
      expect(layout).toHaveClass("app-layout--mobile");
    });

    it("should show overlay on mobile when enabled", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 600,
      });

      render(() => (
        <AppLayout
          sidebar={mockSidebar}
          mobileBreakpoint={768}
          overlayOnMobile={true}
        >
          {mockContent}
        </AppLayout>
      ));

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveClass("sidebar--overlay");
    });

    it("should handle window resize", async () => {
      const { rerender } = render(() => (
        <AppLayout sidebar={mockSidebar} mobileBreakpoint={768}>
          {mockContent}
        </AppLayout>
      ));

      // Simulate window resize
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 900,
      });

      window.dispatchEvent(new Event("resize"));

      await waitFor(() => {
        const layout = screen.getByRole("generic");
        expect(layout).not.toHaveClass("app-layout--mobile");
      });
    });
  });

  describe("State Persistence", () => {
    it("should persist sidebar state when enabled", () => {
      const localStorageSpy = vi.spyOn(Storage.prototype, "setItem");

      render(() => (
        <AppLayout sidebar={mockSidebar} persistSidebarState={true}>
          {mockContent}
        </AppLayout>
      ));

      const toggleButton = screen.getByRole("button", {
        name: /toggle sidebar/i,
      });
      fireEvent.click(toggleButton);

      expect(localStorageSpy).toHaveBeenCalledWith(
        "app-layout-sidebar-open",
        "false",
      );
    });

    it("should restore sidebar state from localStorage", () => {
      const localStorageSpy = vi.spyOn(Storage.prototype, "getItem");
      localStorageSpy.mockReturnValue("false");

      render(() => (
        <AppLayout sidebar={mockSidebar} persistSidebarState={true}>
          {mockContent}
        </AppLayout>
      ));

      expect(localStorageSpy).toHaveBeenCalledWith("app-layout-sidebar-open");

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveClass("sidebar--collapsed");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(() => (
        <AppLayout header={mockHeader} sidebar={mockSidebar}>
          {mockContent}
        </AppLayout>
      ));

      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("complementary")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should support keyboard navigation", () => {
      render(() => (
        <AppLayout sidebar={mockSidebar} collapsible={true}>
          {mockContent}
        </AppLayout>
      ));

      const toggleButton = screen.getByRole("button", {
        name: /toggle sidebar/i,
      });
      expect(toggleButton).toHaveAttribute("tabindex", "0");
    });

    it("should announce sidebar state changes", () => {
      render(() => (
        <AppLayout sidebar={mockSidebar} collapsible={true}>
          {mockContent}
        </AppLayout>
      ));

      const toggleButton = screen.getByRole("button", {
        name: /toggle sidebar/i,
      });
      expect(toggleButton).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Layout Structure", () => {
    it("should maintain proper layout hierarchy", () => {
      render(() => (
        <AppLayout
          header={mockHeader}
          sidebar={mockSidebar}
          footer={mockFooter}
        >
          {mockContent}
        </AppLayout>
      ));

      const layout = screen.getByRole("generic");
      expect(layout).toHaveClass("app-layout");

      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("complementary")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("should handle missing sections gracefully", () => {
      render(() => <AppLayout>{mockContent}</AppLayout>);

      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(screen.queryByRole("banner")).not.toBeInTheDocument();
      expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
      expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    });
  });
});
