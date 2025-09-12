/**
 * Navigation Menu Component Test Suite
 *
 * Tests for the NavMenu component including menu structure,
 * keyboard navigation, and accessibility features.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { NavMenu } from "../NavMenu";

describe("NavMenu", () => {
  const mockMenuItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: <span data-testid="home-icon">🏠</span>,
    },
    {
      id: "about",
      label: "About",
      href: "/about",
      active: true,
    },
    {
      id: "services",
      label: "Services",
      children: [
        { id: "web", label: "Web Development", href: "/services/web" },
        { id: "mobile", label: "Mobile Apps", href: "/services/mobile" },
      ],
    },
    {
      id: "contact",
      label: "Contact",
      href: "/contact",
      disabled: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render menu items", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText("Services")).toBeInTheDocument();
      expect(screen.getByText("Contact")).toBeInTheDocument();
    });

    it("should render with custom class name", () => {
      render(() => <NavMenu items={mockMenuItems} class="custom-nav" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("nav-menu", "custom-nav");
    });

    it("should render icons when showIcons is true", () => {
      render(() => <NavMenu items={mockMenuItems} showIcons={true} />);

      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    });

    it("should not render icons when showIcons is false", () => {
      render(() => <NavMenu items={mockMenuItems} showIcons={false} />);

      expect(screen.queryByTestId("home-icon")).not.toBeInTheDocument();
    });
  });

  describe("Menu Structure", () => {
    it("should render horizontal menu by default", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("nav-menu--horizontal");
    });

    it("should render vertical menu when specified", () => {
      render(() => <NavMenu items={mockMenuItems} orientation="vertical" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("nav-menu--vertical");
    });

    it("should mark active items", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const aboutItem = screen.getByText("About");
      expect(aboutItem.closest(".nav-menu-item")).toHaveClass(
        "nav-menu-item--active",
      );
    });

    it("should disable disabled items", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const contactItem = screen.getByText("Contact");
      expect(contactItem.closest(".nav-menu-item")).toHaveClass(
        "nav-menu-item--disabled",
      );
    });
  });

  describe("Submenu Handling", () => {
    it("should render submenu items", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const servicesItem = screen.getByText("Services");
      fireEvent.click(servicesItem);

      expect(screen.getByText("Web Development")).toBeInTheDocument();
      expect(screen.getByText("Mobile Apps")).toBeInTheDocument();
    });

    it("should open submenu on hover when hoverToOpen is true", () => {
      render(() => <NavMenu items={mockMenuItems} hoverToOpen={true} />);

      const servicesItem = screen.getByText("Services");
      fireEvent.mouseEnter(servicesItem);

      expect(screen.getByText("Web Development")).toBeInTheDocument();
    });

    it("should not open submenu on hover when hoverToOpen is false", () => {
      render(() => <NavMenu items={mockMenuItems} hoverToOpen={false} />);

      const servicesItem = screen.getByText("Services");
      fireEvent.mouseEnter(servicesItem);

      expect(screen.queryByText("Web Development")).not.toBeInTheDocument();
    });

    it("should close submenu when clicking outside", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const servicesItem = screen.getByText("Services");
      fireEvent.click(servicesItem);

      expect(screen.getByText("Web Development")).toBeInTheDocument();

      fireEvent.click(document.body);

      expect(screen.queryByText("Web Development")).not.toBeInTheDocument();
    });
  });

  describe("Event Handling", () => {
    it("should call onItemClick when item is clicked", () => {
      const onItemClick = vi.fn();
      render(() => <NavMenu items={mockMenuItems} onItemClick={onItemClick} />);

      const homeItem = screen.getByText("Home");
      fireEvent.click(homeItem);

      expect(onItemClick).toHaveBeenCalledWith(
        mockMenuItems[0],
        expect.any(MouseEvent),
      );
    });

    it("should not call onItemClick for disabled items", () => {
      const onItemClick = vi.fn();
      render(() => <NavMenu items={mockMenuItems} onItemClick={onItemClick} />);

      const contactItem = screen.getByText("Contact");
      fireEvent.click(contactItem);

      expect(onItemClick).not.toHaveBeenCalled();
    });

    it("should handle submenu item clicks", () => {
      const onItemClick = vi.fn();
      render(() => <NavMenu items={mockMenuItems} onItemClick={onItemClick} />);

      const servicesItem = screen.getByText("Services");
      fireEvent.click(servicesItem);

      const webItem = screen.getByText("Web Development");
      fireEvent.click(webItem);

      expect(onItemClick).toHaveBeenCalledWith(
        mockMenuItems[2].children![0],
        expect.any(MouseEvent),
      );
    });
  });

  describe("Keyboard Navigation", () => {
    it("should navigate with arrow keys", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const homeItem = screen.getByText("Home");
      homeItem.focus();

      fireEvent.keyDown(homeItem, { key: "ArrowRight" });

      const aboutItem = screen.getByText("About");
      expect(aboutItem).toHaveFocus();
    });

    it("should open submenu with enter key", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const servicesItem = screen.getByText("Services");
      servicesItem.focus();

      fireEvent.keyDown(servicesItem, { key: "Enter" });

      expect(screen.getByText("Web Development")).toBeInTheDocument();
    });

    it("should close submenu with escape key", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const servicesItem = screen.getByText("Services");
      fireEvent.click(servicesItem);

      expect(screen.getByText("Web Development")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByText("Web Development")).not.toBeInTheDocument();
    });

    it("should navigate submenu items with arrow keys", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const servicesItem = screen.getByText("Services");
      fireEvent.click(servicesItem);

      const webItem = screen.getByText("Web Development");
      webItem.focus();

      fireEvent.keyDown(webItem, { key: "ArrowDown" });

      const mobileItem = screen.getByText("Mobile Apps");
      expect(mobileItem).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Main navigation");
    });

    it("should have proper menu structure", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const menuItems = screen.getAllByRole("menuitem");
      expect(menuItems).toHaveLength(4);
    });

    it("should mark active item with aria-current", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const aboutItem = screen.getByText("About");
      expect(aboutItem).toHaveAttribute("aria-current", "page");
    });

    it("should mark disabled items with aria-disabled", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const contactItem = screen.getByText("Contact");
      expect(contactItem).toHaveAttribute("aria-disabled", "true");
    });

    it("should have proper submenu ARIA attributes", () => {
      render(() => <NavMenu items={mockMenuItems} />);

      const servicesItem = screen.getByText("Services");
      expect(servicesItem).toHaveAttribute("aria-haspopup", "true");
      expect(servicesItem).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(servicesItem);

      expect(servicesItem).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Badge Support", () => {
    const itemsWithBadges = [
      {
        id: "notifications",
        label: "Notifications",
        badge: "5",
      },
      {
        id: "messages",
        label: "Messages",
        badge: <span data-testid="message-badge">New</span>,
      },
    ];

    it("should render badges when showBadges is true", () => {
      render(() => <NavMenu items={itemsWithBadges} showBadges={true} />);

      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByTestId("message-badge")).toBeInTheDocument();
    });

    it("should not render badges when showBadges is false", () => {
      render(() => <NavMenu items={itemsWithBadges} showBadges={false} />);

      expect(screen.queryByText("5")).not.toBeInTheDocument();
      expect(screen.queryByTestId("message-badge")).not.toBeInTheDocument();
    });
  });
});
