/**
 * Breadcrumb Component Test Suite
 *
 * Tests for the Breadcrumb component including navigation structure,
 * item collapsing, and accessibility features.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Breadcrumb } from "../Breadcrumb";

describe("Breadcrumb", () => {
  const mockBreadcrumbItems = [
    { id: "home", label: "Home", href: "/" },
    { id: "category", label: "Category", href: "/category" },
    { id: "subcategory", label: "Subcategory", href: "/category/subcategory" },
    { id: "current", label: "Current Page", current: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render breadcrumb items", () => {
      render(() => <Breadcrumb items={mockBreadcrumbItems} />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Subcategory")).toBeInTheDocument();
      expect(screen.getByText("Current Page")).toBeInTheDocument();
    });

    it("should render with custom class name", () => {
      render(() => (
        <Breadcrumb items={mockBreadcrumbItems} class="custom-breadcrumb" />
      ));

      const breadcrumb = screen.getByRole("navigation");
      expect(breadcrumb).toHaveClass("breadcrumb", "custom-breadcrumb");
    });

    it("should render default separator", () => {
      render(() => <Breadcrumb items={mockBreadcrumbItems} />);

      const separators = screen.getAllByText("/");
      expect(separators).toHaveLength(3); // 4 items = 3 separators
    });

    it("should render custom separator", () => {
      render(() => <Breadcrumb items={mockBreadcrumbItems} separator=">" />);

      const separators = screen.getAllByText(">");
      expect(separators).toHaveLength(3);
    });

    it("should render custom separator element", () => {
      const customSeparator = <span data-testid="custom-separator">→</span>;
      render(() => (
        <Breadcrumb items={mockBreadcrumbItems} separator={customSeparator} />
      ));

      const separators = screen.getAllByTestId("custom-separator");
      expect(separators).toHaveLength(3);
    });
  });

  describe("Item Collapsing", () => {
    it("should show all items when under maxItems limit", () => {
      render(() => <Breadcrumb items={mockBreadcrumbItems} maxItems={5} />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Subcategory")).toBeInTheDocument();
      expect(screen.getByText("Current Page")).toBeInTheDocument();
    });

    it("should collapse items when over maxItems limit", () => {
      const manyItems = [
        { id: "1", label: "Level 1", href: "/1" },
        { id: "2", label: "Level 2", href: "/2" },
        { id: "3", label: "Level 3", href: "/3" },
        { id: "4", label: "Level 4", href: "/4" },
        { id: "5", label: "Level 5", href: "/5" },
        { id: "6", label: "Level 6", href: "/6" },
        { id: "7", label: "Current", current: true },
      ];

      render(() => <Breadcrumb items={manyItems} maxItems={3} />);

      // Should show first item, ellipsis, and last two items
      expect(screen.getByText("Level 1")).toBeInTheDocument();
      expect(screen.getByText("...")).toBeInTheDocument();
      expect(screen.getByText("Level 6")).toBeInTheDocument();
      expect(screen.getByText("Current")).toBeInTheDocument();

      // Should not show middle items
      expect(screen.queryByText("Level 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Level 3")).not.toBeInTheDocument();
      expect(screen.queryByText("Level 4")).not.toBeInTheDocument();
      expect(screen.queryByText("Level 5")).not.toBeInTheDocument();
    });

    it("should always show first and last items when collapsing", () => {
      const manyItems = [
        { id: "1", label: "First", href: "/1" },
        { id: "2", label: "Second", href: "/2" },
        { id: "3", label: "Third", href: "/3" },
        { id: "4", label: "Fourth", href: "/4" },
        { id: "5", label: "Last", current: true },
      ];

      render(() => <Breadcrumb items={manyItems} maxItems={3} />);

      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("...")).toBeInTheDocument();
      expect(screen.getByText("Last")).toBeInTheDocument();
    });
  });

  describe("Home Icon", () => {
    it("should show home icon when enabled", () => {
      render(() => (
        <Breadcrumb items={mockBreadcrumbItems} showHomeIcon={true} />
      ));

      const homeIcon = screen.getByText("🏠");
      expect(homeIcon).toBeInTheDocument();
    });

    it("should not show home icon when disabled", () => {
      render(() => (
        <Breadcrumb items={mockBreadcrumbItems} showHomeIcon={false} />
      ));

      expect(screen.queryByText("🏠")).not.toBeInTheDocument();
    });

    it("should replace first item text with home icon", () => {
      render(() => (
        <Breadcrumb items={mockBreadcrumbItems} showHomeIcon={true} />
      ));

      expect(screen.queryByText("Home")).not.toBeInTheDocument();
      expect(screen.getByText("🏠")).toBeInTheDocument();
    });
  });

  describe("Item States", () => {
    it("should mark current item", () => {
      render(() => <Breadcrumb items={mockBreadcrumbItems} />);

      const currentItem = screen.getByText("Current Page");
      expect(currentItem).toHaveClass("breadcrumb-item--current");
    });

    it("should mark disabled items", () => {
      const itemsWithDisabled = [
        { id: "home", label: "Home", href: "/" },
        { id: "disabled", label: "Disabled", disabled: true },
        { id: "current", label: "Current", current: true },
      ];

      render(() => <Breadcrumb items={itemsWithDisabled} />);

      const disabledItem = screen.getByText("Disabled");
      expect(disabledItem).toHaveClass("breadcrumb-item--disabled");
    });

    it("should render items with icons", () => {
      const itemsWithIcons = [
        {
          id: "home",
          label: "Home",
          href: "/",
          icon: <span data-testid="home-icon">🏠</span>,
        },
        { id: "current", label: "Current", current: true },
      ];

      render(() => <Breadcrumb items={itemsWithIcons} />);

      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    });
  });

  describe("Event Handling", () => {
    it("should call onItemClick when item is clicked", () => {
      const onItemClick = vi.fn();
      render(() => (
        <Breadcrumb items={mockBreadcrumbItems} onItemClick={onItemClick} />
      ));

      const homeItem = screen.getByText("Home");
      fireEvent.click(homeItem);

      expect(onItemClick).toHaveBeenCalledWith(
        mockBreadcrumbItems[0],
        expect.any(MouseEvent),
      );
    });

    it("should not call onItemClick for current item", () => {
      const onItemClick = vi.fn();
      render(() => (
        <Breadcrumb items={mockBreadcrumbItems} onItemClick={onItemClick} />
      ));

      const currentItem = screen.getByText("Current Page");
      fireEvent.click(currentItem);

      expect(onItemClick).not.toHaveBeenCalled();
    });

    it("should not call onItemClick for disabled items", () => {
      const onItemClick = vi.fn();
      const itemsWithDisabled = [
        { id: "home", label: "Home", href: "/" },
        { id: "disabled", label: "Disabled", disabled: true },
        { id: "current", label: "Current", current: true },
      ];

      render(() => (
        <Breadcrumb items={itemsWithDisabled} onItemClick={onItemClick} />
      ));

      const disabledItem = screen.getByText("Disabled");
      fireEvent.click(disabledItem);

      expect(onItemClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(() => <Breadcrumb items={mockBreadcrumbItems} />);

      const breadcrumb = screen.getByRole("navigation");
      expect(breadcrumb).toHaveAttribute("aria-label", "Breadcrumb navigation");
    });

    it("should have proper list structure", () => {
      render(() => <Breadcrumb items={mockBreadcrumbItems} />);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(4);
    });

    it("should mark current item with aria-current", () => {
      render(() => <Breadcrumb items={mockBreadcrumbItems} />);

      const currentItem = screen.getByText("Current Page");
      expect(currentItem).toHaveAttribute("aria-current", "page");
    });

    it("should mark disabled items with aria-disabled", () => {
      const itemsWithDisabled = [
        { id: "home", label: "Home", href: "/" },
        { id: "disabled", label: "Disabled", disabled: true },
        { id: "current", label: "Current", current: true },
      ];

      render(() => <Breadcrumb items={itemsWithDisabled} />);

      const disabledItem = screen.getByText("Disabled");
      expect(disabledItem).toHaveAttribute("aria-disabled", "true");
    });

    it("should have proper link attributes", () => {
      render(() => <Breadcrumb items={mockBreadcrumbItems} />);

      const homeLink = screen.getByText("Home");
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty items array", () => {
      render(() => <Breadcrumb items={[]} />);

      const breadcrumb = screen.getByRole("navigation");
      expect(breadcrumb).toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });

    it("should handle single item", () => {
      const singleItem = [{ id: "home", label: "Home", current: true }];
      render(() => <Breadcrumb items={singleItem} />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.queryByText("/")).not.toBeInTheDocument(); // No separators for single item
    });

    it("should handle items without href", () => {
      const itemsWithoutHref = [
        { id: "home", label: "Home" },
        { id: "current", label: "Current", current: true },
      ];

      render(() => <Breadcrumb items={itemsWithoutHref} />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Current")).toBeInTheDocument();
    });
  });
});
