/**
 * Simple tests for Enhanced Icon Component
 * Basic functionality tests that work with happy-dom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Icon } from "../Icon";

describe("Enhanced Icon Component - Simple Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render icon with correct name", () => {
      render(() => <Icon name="settings" />);
      const icon = screen.getByTestId("icon-settings");
      expect(icon).toBeDefined();
      expect(icon.textContent).toBe("settings");
    });

    it("should apply correct size classes", () => {
      const { container } = render(() => <Icon name="settings" size="lg" />);
      const icon = container.querySelector(".reynard-icon--lg");
      expect(icon).toBeDefined();
    });

    it("should apply correct variant classes", () => {
      const { container } = render(() => (
        <Icon name="settings" variant="primary" />
      ));
      const icon = container.querySelector(".reynard-icon--primary");
      expect(icon).toBeDefined();
    });

    it("should apply custom class", () => {
      const { container } = render(() => (
        <Icon name="settings" class="custom-class" />
      ));
      const icon = container.querySelector(".custom-class");
      expect(icon).toBeDefined();
    });
  });

  describe("Interactive Features", () => {
    it("should render as button when interactive is true", () => {
      const { container } = render(() => <Icon name="settings" interactive />);
      const button = container.querySelector("button");
      expect(button).toBeDefined();
      expect(button?.classList.contains("reynard-icon--interactive")).toBe(
        true,
      );
    });

    it("should render as span when interactive is false", () => {
      const { container } = render(() => (
        <Icon name="settings" interactive={false} />
      ));
      const span = container.querySelector("span");
      expect(span).toBeDefined();
      expect(span?.classList.contains("reynard-icon--interactive")).toBe(false);
    });

    it("should handle click events when interactive", () => {
      const handleClick = vi.fn();
      render(() => <Icon name="settings" interactive onClick={handleClick} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not be clickable when not interactive", () => {
      const handleClick = vi.fn();
      const { container } = render(() => (
        <Icon name="settings" onClick={handleClick} />
      ));

      const span = container.querySelector("span");
      fireEvent.click(span!);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading is true", () => {
      render(() => <Icon name="settings" loading />);
      const spinner = screen.getByTestId("icon-spinner");
      expect(spinner).toBeDefined();
      expect(spinner.textContent).toBe("spinner");
    });

    it("should apply loading class when loading", () => {
      const { container } = render(() => <Icon name="settings" loading />);
      const icon = container.querySelector(".reynard-icon--loading");
      expect(icon).toBeDefined();
    });

    it("should be disabled when loading and interactive", () => {
      render(() => <Icon name="settings" interactive loading />);
      const button = screen.getByRole("button");
      expect(button.hasAttribute("disabled")).toBe(true);
    });
  });

  describe("Active State", () => {
    it("should apply active class when active is true", () => {
      const { container } = render(() => <Icon name="settings" active />);
      const icon = container.querySelector(".reynard-icon--active");
      expect(icon).toBeDefined();
    });

    it("should not apply active class when active is false", () => {
      const { container } = render(() => (
        <Icon name="settings" active={false} />
      ));
      const icon = container.querySelector(".reynard-icon--active");
      expect(icon).toBeNull();
    });
  });

  describe("Progress Bar", () => {
    it("should show progress bar when progress is provided", () => {
      const { container } = render(() => (
        <Icon name="settings" progress={50} />
      ));
      const progressBar = container.querySelector(
        ".reynard-icon__progress-bar",
      );
      expect(progressBar).toBeDefined();
    });

    it("should apply with-progress class when progress is provided", () => {
      const { container } = render(() => (
        <Icon name="settings" progress={50} />
      ));
      const icon = container.querySelector(".reynard-icon--with-progress");
      expect(icon).toBeDefined();
    });

    it("should set correct progress width", () => {
      const { container } = render(() => (
        <Icon name="settings" progress={75} />
      ));
      const progressBar = container.querySelector(
        ".reynard-icon__progress-bar",
      );
      expect(progressBar?.getAttribute("style")).toContain(
        "--progress-width: 75%",
      );
    });

    it("should clamp progress values between 0 and 100", () => {
      // Test negative progress - should not render progress bar (0% progress)
      const { container: container1 } = render(() => (
        <Icon name="settings" progress={-10} />
      ));
      const progressBar1 = container1.querySelector(
        ".reynard-icon__progress-bar",
      );
      expect(progressBar1).toBeNull(); // No progress bar when clamped to 0

      // Test progress over 100 - should render with 100%
      const { container: container2 } = render(() => (
        <Icon name="settings" progress={150} />
      ));
      const progressBar2 = container2.querySelector(
        ".reynard-icon__progress-bar",
      );
      expect(progressBar2?.getAttribute("style")).toContain(
        "--progress-width: 100%",
      );
    });

    it("should not show progress bar when progress is 0", () => {
      const { container } = render(() => <Icon name="settings" progress={0} />);
      const progressBar = container.querySelector(
        ".reynard-icon__progress-bar",
      );
      expect(progressBar).toBeNull();
    });
  });

  describe("Glow Effect", () => {
    it("should apply glow class when glow is true", () => {
      const { container } = render(() => <Icon name="settings" glow />);
      const icon = container.querySelector(".reynard-icon--glow");
      expect(icon).toBeDefined();
    });

    it("should set custom glow color", () => {
      const { container } = render(() => (
        <Icon name="settings" glow glowColor="red" />
      ));
      const icon = container.querySelector(".reynard-icon--glow");
      expect(icon?.getAttribute("style")).toContain("--glow-color: red");
    });

    it("should use default glow color when not specified", () => {
      const { container } = render(() => <Icon name="settings" glow />);
      const icon = container.querySelector(".reynard-icon--glow");
      expect(icon?.getAttribute("style")).toContain(
        "--glow-color: var(--accent)",
      );
    });
  });

  describe("Tooltip and Accessibility", () => {
    it("should set title attribute from tooltip prop", () => {
      render(() => <Icon name="settings" tooltip="Settings icon" />);
      const icon = screen.getByTitle("Settings icon");
      expect(icon).toBeDefined();
    });

    it("should set title attribute from title prop", () => {
      render(() => <Icon name="settings" title="Settings" />);
      const icon = screen.getByTitle("Settings");
      expect(icon).toBeDefined();
    });

    it("should prefer tooltip over title", () => {
      render(() => <Icon name="settings" tooltip="Tooltip" title="Title" />);
      const icon = screen.getByTitle("Tooltip");
      expect(icon).toBeDefined();
    });

    it("should set aria-label from aria-label prop", () => {
      render(() => <Icon name="settings" aria-label="Settings button" />);
      const icon = screen.getByLabelText("Settings button");
      expect(icon).toBeDefined();
    });

    it("should set aria-label from tooltip when aria-label not provided", () => {
      render(() => <Icon name="settings" tooltip="Settings tooltip" />);
      const icon = screen.getByLabelText("Settings tooltip");
      expect(icon).toBeDefined();
    });

    it("should set aria-hidden when specified", () => {
      render(() => <Icon name="settings" aria-hidden />);
      const icon = screen.getByTestId("reynard-icon");
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    });
  });

  describe("Combined Features", () => {
    it("should handle multiple features simultaneously", () => {
      const { container } = render(() => (
        <Icon
          name="settings"
          interactive
          active
          loading
          progress={50}
          glow
          glowColor="blue"
          tooltip="Advanced settings"
        />
      ));

      const button = container.querySelector("button");
      expect(button?.classList.contains("reynard-icon--interactive")).toBe(
        true,
      );
      expect(button?.classList.contains("reynard-icon--active")).toBe(true);
      expect(button?.classList.contains("reynard-icon--loading")).toBe(true);
      expect(button?.classList.contains("reynard-icon--with-progress")).toBe(
        true,
      );
      expect(button?.classList.contains("reynard-icon--glow")).toBe(true);
      expect(button?.getAttribute("title")).toBe("Advanced settings");
    });
  });
});
