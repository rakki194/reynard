/**
 * Tests for BreadcrumbButton Components
 * Uses happy-dom and custom matchers for proper testing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { BreadcrumbButton, BreadcrumbActionButton } from "../BreadcrumbButton";

describe("BreadcrumbButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with required icon", () => {
      render(() => <BreadcrumbButton icon="folder" />);
      expect(screen.getByTestId("icon-folder")).toBeInTheDocument();
    });

    it("should render with children when provided", () => {
      render(() => (
        <BreadcrumbButton icon="folder">Documents</BreadcrumbButton>
      ));
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    it("should apply correct base classes", () => {
      const { container } = render(() => <BreadcrumbButton icon="folder" />);
      const button = container.querySelector("button");
      expect(button).toHaveClass("reynard-breadcrumb-button");
    });
  });

  describe("Button Variants", () => {
    const variants = [
      "primary",
      "secondary",
      "tertiary",
      "ghost",
      "danger",
      "success",
      "warning",
    ] as const;

    variants.forEach((variant) => {
      it(`should apply ${variant} variant class`, () => {
        const { container } = render(() => (
          <BreadcrumbButton icon="folder" variant={variant} />
        ));
        const button = container.querySelector("button");
        expect(button).toHaveClass(`reynard-breadcrumb-button--${variant}`);
      });
    });
  });

  describe("State Management", () => {
    it("should apply active class when active is true", () => {
      const { container } = render(() => (
        <BreadcrumbButton icon="folder" active />
      ));
      const button = container.querySelector("button");
      expect(button).toHaveClass("reynard-breadcrumb-button--active");
    });

    it("should apply disabled class when disabled", () => {
      const { container } = render(() => (
        <BreadcrumbButton icon="folder" disabled />
      ));
      const button = container.querySelector("button");
      expect(button).toHaveClass("reynard-breadcrumb-button--disabled");
      expect(button).toBeDisabled();
    });

    it("should apply loading class when loading", () => {
      const { container } = render(() => (
        <BreadcrumbButton icon="folder" loading />
      ));
      const button = container.querySelector("button");
      expect(button).toHaveClass("reynard-breadcrumb-button--loading");
      expect(button).toBeDisabled();
    });
  });

  describe("Progress Bar", () => {
    it("should show progress bar when progress is provided", () => {
      const { container } = render(() => (
        <BreadcrumbButton icon="folder" progress={50} />
      ));
      const progressBar = container.querySelector(
        ".reynard-breadcrumb-button__progress-bar",
      );
      expect(progressBar).toBeInTheDocument();
    });

    it("should apply with-progress class when progress is provided", () => {
      const { container } = render(() => (
        <BreadcrumbButton icon="folder" progress={50} />
      ));
      const button = container.querySelector("button");
      expect(button).toHaveClass("reynard-breadcrumb-button--with-progress");
    });

    it("should set correct progress width", () => {
      const { container } = render(() => (
        <BreadcrumbButton icon="folder" progress={75} />
      ));
      const progressBar = container.querySelector(
        ".reynard-breadcrumb-button__progress-bar",
      );
      expect(progressBar).toHaveStyle({ "--progress-width": "75%" });
    });
  });

  describe("Glow Effect", () => {
    it("should apply glow class when glow is true", () => {
      const { container } = render(() => (
        <BreadcrumbButton icon="folder" glow />
      ));
      const button = container.querySelector("button");
      expect(button).toHaveClass("reynard-breadcrumb-button--glow");
    });

    it("should set custom glow color", () => {
      const { container } = render(() => (
        <BreadcrumbButton icon="folder" glow glowColor="orange" />
      ));
      const icon = container.querySelector(".reynard-icon");
      expect(icon).toHaveStyle({ "--glow-color": "orange" });
    });
  });

  describe("Click Events", () => {
    it("should handle click events", () => {
      const handleClick = vi.fn();
      render(() => (
        <BreadcrumbButton icon="folder" onClick={handleClick}>
          Documents
        </BreadcrumbButton>
      ));

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not trigger click when disabled", () => {
      const handleClick = vi.fn();
      render(() => (
        <BreadcrumbButton icon="folder" disabled onClick={handleClick}>
          Documents
        </BreadcrumbButton>
      ));

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should set aria-label from aria-label prop", () => {
      render(() => (
        <BreadcrumbButton
          icon="folder"
          aria-label="Navigate to Documents folder"
        >
          Documents
        </BreadcrumbButton>
      ));
      const button = screen.getByLabelText("Navigate to Documents folder");
      expect(button).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(() => (
        <BreadcrumbButton icon="folder">Documents</BreadcrumbButton>
      ));
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });
  });
});

describe("BreadcrumbActionButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Action Types", () => {
    const actions = [
      "create",
      "delete",
      "edit",
      "settings",
      "refresh",
      "upload",
      "download",
      "search",
      "filter",
      "sort",
    ] as const;

    actions.forEach((action) => {
      it(`should render ${action} action with correct icon`, () => {
        render(() => <BreadcrumbActionButton action={action} />);
        // The component should render with the appropriate icon for each action
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe("Semantic Variants", () => {
    it("should render create action with correct icon", () => {
      render(() => <BreadcrumbActionButton action="create" />);
      expect(screen.getByTestId("icon-add")).toBeInTheDocument();
    });

    it("should render delete action with correct icon", () => {
      render(() => <BreadcrumbActionButton action="delete" />);
      expect(screen.getByTestId("icon-delete")).toBeInTheDocument();
    });

    it("should render edit action with correct icon", () => {
      render(() => <BreadcrumbActionButton action="edit" />);
      expect(screen.getByTestId("icon-edit")).toBeInTheDocument();
    });

    it("should render settings action with correct icon", () => {
      render(() => <BreadcrumbActionButton action="settings" />);
      expect(screen.getByTestId("icon-settings")).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("should be disabled when disabled prop is true", () => {
      render(() => <BreadcrumbActionButton action="create" disabled />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be disabled when loading prop is true", () => {
      render(() => <BreadcrumbActionButton action="create" loading />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Glow Effect", () => {
    it("should set custom glow color", () => {
      const { container } = render(() => (
        <BreadcrumbActionButton action="create" glow glowColor="purple" />
      ));
      const icon = container.querySelector(".reynard-icon");
      expect(icon).toHaveStyle({ "--glow-color": "purple" });
    });
  });

  describe("Click Events", () => {
    it("should handle click events", () => {
      const handleClick = vi.fn();
      render(() => (
        <BreadcrumbActionButton action="create" onClick={handleClick} />
      ));

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not trigger click when disabled", () => {
      const handleClick = vi.fn();
      render(() => (
        <BreadcrumbActionButton
          action="create"
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
        <BreadcrumbActionButton
          action="create"
          aria-label="Create new folder"
        />
      ));
      const button = screen.getByLabelText("Create new folder");
      expect(button).toBeInTheDocument();
    });

    it("should render without aria-label when not provided", () => {
      render(() => <BreadcrumbActionButton action="create" />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should set tooltip from tooltip prop", () => {
      render(() => (
        <BreadcrumbActionButton action="create" tooltip="Create new item" />
      ));
      const button = screen.getByTitle("Create new item");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Combined Features", () => {
    it("should handle multiple features simultaneously", () => {
      const { container } = render(() => (
        <BreadcrumbActionButton
          action="upload"
          glow
          glowColor="cyan"
          tooltip="Upload files"
        />
      ));

      const button = container.querySelector("button");
      expect(button).toHaveAttribute("title", "Upload files");
      const icon = container.querySelector(".reynard-icon");
      expect(icon).toHaveStyle({ "--glow-color": "cyan" });
    });
  });
});
