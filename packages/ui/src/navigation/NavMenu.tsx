/**
 * Navigation Menu Component
 * Hierarchical navigation menu with keyboard support and accessibility
 */

import {
  Component,
  JSX,
  splitProps,
  For,
  Show,
  createSignal,
  onMount,
} from "solid-js";

export interface NavMenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Link href */
  href?: string;
  /** Icon element */
  icon?: JSX.Element;
  /** Badge/count element */
  badge?: JSX.Element | string | number;
  /** Whether item is active */
  active?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Submenu items */
  children?: NavMenuItem[];
  /** Custom data attributes */
  data?: Record<string, string>;
}

export interface NavMenuProps {
  /** Menu items */
  items: NavMenuItem[];
  /** Orientation of the menu */
  orientation?: "horizontal" | "vertical";
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show badges */
  showBadges?: boolean;
  /** Whether submenus open on hover */
  hoverToOpen?: boolean;
  /** Custom class name */
  class?: string;
  /** Click handler for items */
  onItemClick?: (item: NavMenuItem, event: MouseEvent | KeyboardEvent) => void;
  /** Active item change handler */
  onActiveChange?: (itemId: string) => void;
}

const defaultProps = {
  orientation: "vertical" as const,
  showIcons: true,
  showBadges: true,
  hoverToOpen: false,
};

export const NavMenu: Component<NavMenuProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "items",
    "orientation",
    "showIcons",
    "showBadges",
    "hoverToOpen",
    "class",
    "onItemClick",
    "onActiveChange",
  ]);

  const [openSubmenus, setOpenSubmenus] = createSignal<Set<string>>(new Set());



  let menuRef: HTMLElement | undefined;
  let focusableItems: HTMLElement[] = [];

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
    // Update focusable items after submenu state changes
    setTimeout(updateFocusableItems, 0);
  };

  const handleItemClick = (item: NavMenuItem, event: MouseEvent | KeyboardEvent) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (item.children?.length) {
      event.preventDefault();
      toggleSubmenu(item.id);
    }

    local.onItemClick?.(item, event);
    
    if (item.active !== undefined) {
      local.onActiveChange?.(item.id);
    }
  };

  const handleKeyDown = (event: KeyboardEvent, item: NavMenuItem) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        handleItemClick(item, event);
        break;
      
      case "ArrowDown":
        if (local.orientation === "vertical") {
          event.preventDefault();
          focusNextItem();
        }
        break;
      
      case "ArrowUp":
        if (local.orientation === "vertical") {
          event.preventDefault();
          focusPreviousItem();
        }
        break;
      
      case "ArrowRight":
        if (local.orientation === "horizontal") {
          event.preventDefault();
          focusNextItem();
        } else if (item.children?.length && !openSubmenus().has(item.id)) {
          event.preventDefault();
          toggleSubmenu(item.id);
        }
        break;
      
      case "ArrowLeft":
        if (local.orientation === "horizontal") {
          event.preventDefault();
          focusPreviousItem();
        } else if (item.children?.length && openSubmenus().has(item.id)) {
          event.preventDefault();
          toggleSubmenu(item.id);
        }
        break;
      
      case "Escape":
        setOpenSubmenus(new Set<string>());
        setTimeout(updateFocusableItems, 0);
        break;
    }
  };

  const focusNextItem = () => {
    const currentFocus = document.activeElement as HTMLElement;
    const currentIndex = focusableItems.findIndex(item => item === currentFocus);
    const nextIndex = (currentIndex + 1) % focusableItems.length;
    focusableItems[nextIndex]?.focus();
  };

  const focusPreviousItem = () => {
    const currentFocus = document.activeElement as HTMLElement;
    const currentIndex = focusableItems.findIndex(item => item === currentFocus);
    const prevIndex = currentIndex <= 0 ? focusableItems.length - 1 : currentIndex - 1;
    focusableItems[prevIndex]?.focus();
  };

  const updateFocusableItems = () => {
    if (menuRef) {
      focusableItems = Array.from(
        menuRef.querySelectorAll('a, span[tabindex="0"]:not([aria-disabled="true"])')
      ) as HTMLElement[];
    }
  };

  const getClasses = () => {
    const classes = [
      "reynard-nav-menu",
      `reynard-nav-menu--${local.orientation}`
    ];
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const getItemClasses = (item: NavMenuItem, level = 0) => {
    const classes = [
      "reynard-nav-menu__item",
      `reynard-nav-menu__item--level-${level}`
    ];
    if (item.active) classes.push("reynard-nav-menu__item--active");
    if (item.disabled) classes.push("reynard-nav-menu__item--disabled");
    if (item.children?.length) classes.push("reynard-nav-menu__item--has-children");
    if (openSubmenus().has(item.id)) classes.push("reynard-nav-menu__item--open");
    return classes.join(" ");
  };

  const getLinkClasses = (item: NavMenuItem) => {
    const classes = ["reynard-nav-menu__link"];
    if (item.active) classes.push("reynard-nav-menu__link--active");
    if (item.disabled) classes.push("reynard-nav-menu__link--disabled");
    return classes.join(" ");
  };

  const renderSubmenuToggle = (item: NavMenuItem) => (
    <button
      type="button"
      class="reynard-nav-menu__toggle"
      onClick={(e) => {
        e.stopPropagation();
        toggleSubmenu(item.id);
      }}
      aria-label={`${openSubmenus().has(item.id) ? "Collapse" : "Expand"} ${item.label} submenu`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        style={{
          transform: openSubmenus().has(item.id) ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }}
      >
        <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06L7.28 12.78a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
      </svg>
    </button>
  );

  const renderBadge = (badge: JSX.Element | string | number) => {
    if (typeof badge === "string" || typeof badge === "number") {
      return (
        <span class="reynard-nav-menu__badge">
          {badge}
        </span>
      );
    }
    return badge;
  };

  const renderMenuItem = (item: NavMenuItem, level = 0): JSX.Element => (
    <li class={getItemClasses(item, level)}>
      <Show
        when={item.href && !item.disabled}
        fallback={
          <span
            class={getLinkClasses(item)}
            tabindex={item.disabled ? -1 : 0}
            onKeyDown={(e) => handleKeyDown(e, item)}
            onClick={(e) => handleItemClick(item, e)}
            onMouseEnter={() => {
              if (local.hoverToOpen && item.children?.length) {
                setOpenSubmenus((prev) => new Set(prev).add(item.id));
                setTimeout(updateFocusableItems, 0);
            }
            }}
            {...(item.data || {})}
          >
            <div class="reynard-nav-menu__content">
              <Show when={local.showIcons && item.icon}>
                <span class="reynard-nav-menu__icon">{item.icon}</span>
              </Show>
              
              <span class="reynard-nav-menu__label">{item.label}</span>
              
              <Show when={local.showBadges && item.badge}>
                {renderBadge(item.badge!)}
              </Show>
            </div>
            
            <Show when={item.children?.length}>
              {renderSubmenuToggle(item)}
            </Show>
          </span>
        }
      >
        <a
          href={item.href}
          class={getLinkClasses(item)}
          tabindex={item.disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, item)}
          onClick={(e) => handleItemClick(item, e)}
          onMouseEnter={() => {
            if (local.hoverToOpen && item.children?.length) {
              setOpenSubmenus((prev) => new Set(prev).add(item.id));
              setTimeout(updateFocusableItems, 0);
            }
          }}
          {...(item.data || {})}
        >
          <div class="reynard-nav-menu__content">
            <Show when={local.showIcons && item.icon}>
              <span class="reynard-nav-menu__icon">{item.icon}</span>
            </Show>
            
            <span class="reynard-nav-menu__label">{item.label}</span>
            
            <Show when={local.showBadges && item.badge}>
              {renderBadge(item.badge!)}
            </Show>
          </div>
          
          <Show when={item.children?.length}>
            {renderSubmenuToggle(item)}
          </Show>
        </a>
      </Show>

      {/* Submenu */}
      <Show when={item.children?.length && openSubmenus().has(item.id)}>
        <ul class="reynard-nav-menu__submenu" role="menu">
          <For each={item.children}>
            {(child) => renderMenuItem(child, level + 1)}
          </For>
        </ul>
      </Show>
    </li>
  );

  onMount(updateFocusableItems);

  return (
    <nav
      ref={menuRef}
      class={getClasses()}
      {...others}
    >
      <ul class="reynard-nav-menu__list" role="menubar">
        <For each={local.items}>
          {(item) => renderMenuItem(item)}
        </For>
      </ul>
    </nav>
  );
};
