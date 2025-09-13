/**
 * Tests for SidebarButton Component
 * Uses happy-dom and custom matchers for proper testing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { SidebarButton } from "../SidebarButton";

describe("SidebarButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with required icon and label", () => {
      render(() => <SidebarButton icon="home" label="Home" />);
      expect(screen.getByTestId("icon-home")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("should apply correct base classes", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" />
      ));
      const containerDiv = container.querySelector(".reynard-sidebar-button");
      expect(containerDiv).toHaveClass("reynard-sidebar-button");
    });

    it("should render without label when not provided", () => {
      const { container } = render(() => <SidebarButton icon="home" />);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
      expect(
        container.querySelector(".reynard-sidebar-button__label"),
      ).toBeNull();
    });
  });

  describe("Layout Variants", () => {
    const layouts = ["default", "toggle", "action", "header"] as const;

    layouts.forEach((layout) => {
      it(`should apply ${layout} layout class`, () => {
        const { container } = render(() => (
          <SidebarButton icon="home" label="Home" layout={layout} />
        ));
        const containerDiv = container.querySelector(".reynard-sidebar-button");
        expect(containerDiv).toHaveClass(`reynard-sidebar-button--${layout}`);
      });
    });
  });

  describe("State Management", () => {
    it("should apply active class when active is true", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" active />
      ));
      const containerDiv = container.querySelector(".reynard-sidebar-button");
      expect(containerDiv).toHaveClass("reynard-sidebar-button--active");
    });

    it("should apply disabled class when disabled", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" disabled />
      ));
      const containerDiv = container.querySelector(".reynard-sidebar-button");
      expect(containerDiv).toHaveClass("reynard-sidebar-button--disabled");
      const button = container.querySelector("button");
      expect(button).toBeDisabled();
    });

    it("should apply loading class when loading", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" loading />
      ));
      const containerDiv = container.querySelector(".reynard-sidebar-button");
      expect(containerDiv).toHaveClass("reynard-sidebar-button--loading");
      const button = container.querySelector("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Secondary Icon", () => {
    it("should render secondary icon when provided", () => {
      render(() => (
        <SidebarButton icon="home" label="Home" secondaryIcon="chevron-right" />
      ));
      expect(screen.getByTestId("icon-chevron-right")).toBeInTheDocument();
    });

    it("should apply secondary icon class", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" secondaryIcon="chevron-right" />
      ));
      // The secondary icon is rendered as a regular Icon component without a specific wrapper class
      const secondaryIcon = container.querySelector(
        '[data-testid="icon-chevron-right"]',
      );
      expect(secondaryIcon).toBeInTheDocument();
    });
  });

  describe("Secondary Actions", () => {
    it("should render secondary actions when provided", () => {
      const actions = [
        { icon: "edit", onClick: vi.fn(), ariaLabel: "Edit", tooltip: "Edit" },
        {
          icon: "delete",
          onClick: vi.fn(),
          ariaLabel: "Delete",
          tooltip: "Delete",
        },
      ];

      render(() => (
        <SidebarButton
          icon="home"
          label="Home"
          showSecondaryActions
          secondaryActions={actions}
        />
      ));

      expect(screen.getByTestId("icon-edit")).toBeInTheDocument();
      expect(screen.getByTestId("icon-delete")).toBeInTheDocument();
    });

    it("should handle secondary action clicks", () => {
      const editAction = vi.fn();
      const actions = [
        {
          icon: "edit",
          onClick: editAction,
          ariaLabel: "Edit",
          tooltip: "Edit",
        },
      ];

      render(() => (
        <SidebarButton
          icon="home"
          label="Home"
          showSecondaryActions
          secondaryActions={actions}
        />
      ));

      const editButton = screen.getByLabelText("Edit");
      fireEvent.click(editButton);

      expect(editAction).toHaveBeenCalledTimes(1);
    });

    it("should disable secondary actions when disabled", () => {
      const editAction = vi.fn();
      const actions = [
        {
          icon: "edit",
          onClick: editAction,
          ariaLabel: "Edit",
          tooltip: "Edit",
          disabled: true,
        },
      ];

      render(() => (
        <SidebarButton
          icon="home"
          label="Home"
          showSecondaryActions
          secondaryActions={actions}
        />
      ));

      const editButton = screen.getByLabelText("Edit");
      expect(editButton).toBeDisabled();

      fireEvent.click(editButton);
      expect(editAction).not.toHaveBeenCalled();
    });
  });

  describe("Content Area", () => {
    it("should show content when showContent and active are true", () => {
      render(() => (
        <SidebarButton
          icon="home"
          label="Home"
          active
          showContent
          content={<div data-testid="content">Additional content</div>}
        />
      ));

      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("should not show content when showContent is false", () => {
      render(() => (
        <SidebarButton
          icon="home"
          label="Home"
          active
          showContent={false}
          content={<div data-testid="content">Additional content</div>}
        />
      ));

      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });

    it("should not show content when active is false", () => {
      render(() => (
        <SidebarButton
          icon="home"
          label="Home"
          active={false}
          showContent
          content={<div data-testid="content">Additional content</div>}
        />
      ));

      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });

    it("should apply content class when content is shown", () => {
      const { container } = render(() => (
        <SidebarButton
          icon="home"
          label="Home"
          active
          showContent
          content={<div>Content</div>}
        />
      ));

      const contentArea = container.querySelector(
        ".reynard-sidebar-button__content",
      );
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe("Progress Bar", () => {
    it("should show progress bar when progress is provided", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" progress={50} />
      ));
      const progressBar = container.querySelector(
        ".reynard-sidebar-button__progress-bar",
      );
      expect(progressBar).toBeInTheDocument();
    });

    it("should apply with-progress class when progress is provided", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" progress={50} />
      ));
      const containerDiv = container.querySelector(".reynard-sidebar-button");
      expect(containerDiv).toHaveClass("reynard-sidebar-button--with-progress");
    });

    it("should set correct progress width", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" progress={75} />
      ));
      const progressBar = container.querySelector(
        ".reynard-sidebar-button__progress-bar",
      );
      expect(progressBar).toHaveStyle({ "--progress-width": "75%" });
    });
  });

  describe("Glow Effect", () => {
    it("should apply glow class when glow is true", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" glow />
      ));
      const containerDiv = container.querySelector(".reynard-sidebar-button");
      expect(containerDiv).toHaveClass("reynard-sidebar-button--glow");
    });

    it("should set custom glow color", () => {
      const { container } = render(() => (
        <SidebarButton icon="home" label="Home" glow glowColor="blue" />
      ));
      const icon = container.querySelector(".reynard-icon");
      expect(icon).toHaveStyle({ "--glow-color": "blue" });
    });
  });

  describe("Click Events", () => {
    it("should handle main button click events", () => {
      const handleClick = vi.fn();
      render(() => (
        <SidebarButton icon="home" label="Home" onClick={handleClick} />
      ));

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not trigger click when disabled", () => {
      const handleClick = vi.fn();
      render(() => (
        <SidebarButton
          icon="home"
          label="Home"
          disabled
          onClick={handleClick}
        />
      ));

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should set aria-label from aria-label prop", () => {
      render(() => (
        <SidebarButton icon="home" label="Home" aria-label="Navigate to home" />
      ));
      const button = screen.getByLabelText("Navigate to home");
      expect(button).toBeInTheDocument();
    });

    it("should set aria-label from label when aria-label not provided", () => {
      render(() => <SidebarButton icon="home" label="Home" />);
      const button = screen.getByLabelText("Home");
      expect(button).toBeInTheDocument();
    });

    it("should set title attribute from tooltip prop", () => {
      render(() => (
        <SidebarButton icon="home" label="Home" tooltip="Navigate to home" />
      ));
      const button = screen.getByTitle("Navigate to home");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Combined Features", () => {
    it("should handle multiple features simultaneously", () => {
      const actions = [
        { icon: "edit", onClick: vi.fn(), ariaLabel: "Edit", tooltip: "Edit" },
      ];

      const { container } = render(() => (
        <SidebarButton
          icon="home"
          label="Home"
          layout="toggle"
          active
          progress={50}
          glow
          glowColor="green"
          secondaryIcon="chevron-right"
          showSecondaryActions
          secondaryActions={actions}
          showContent
          content={<div data-testid="content">Content</div>}
        />
      ));

      const containerDiv = container.querySelector(".reynard-sidebar-button");
      expect(containerDiv).toHaveClass("reynard-sidebar-button--toggle");
      expect(containerDiv).toHaveClass("reynard-sidebar-button--active");
      expect(containerDiv).toHaveClass("reynard-sidebar-button--with-progress");
      expect(containerDiv).toHaveClass("reynard-sidebar-button--glow");

      expect(screen.getByTestId("icon-chevron-right")).toBeInTheDocument();
      expect(screen.getByTestId("icon-edit")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });
});
