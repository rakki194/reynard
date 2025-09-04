/**
 * ContextMenu Component
 * Dynamic context menu with positioning and action handling
 */

import {
  Component,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  For,
  Show,
} from "solid-js";
import "./ContextMenu.css";

export interface ContextMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether to show a separator after this item */
  separator?: boolean;
  /** Submenu items */
  submenu?: ContextMenuItem[];
  /** Click handler */
  onClick?: () => void;
}

export interface ContextMenuProps {
  /** Whether the context menu is visible */
  visible: boolean;
  /** X position of the context menu */
  x: number;
  /** Y position of the context menu */
  y: number;
  /** Array of menu items */
  items: ContextMenuItem[];
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to enable keyboard navigation */
  enableKeyboard?: boolean;
  /** Callback when the context menu should close */
  onClose: () => void;
  /** Custom class name */
  class?: string;
}

export interface ContextMenuState {
  selectedIndex: number;
  submenuOpen: number | null;
  isVisible: boolean;
}

const defaultProps = {
  showIcons: true,
  enableKeyboard: true,
};

export const ContextMenu: Component<ContextMenuProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local] = splitProps(merged, [
    "visible",
    "x",
    "y",
    "items",
    "showIcons",
    "enableKeyboard",
    "onClose",
    "class",
  ]);

  // State
  const [state, setState] = createSignal<ContextMenuState>({
    selectedIndex: -1,
    submenuOpen: null,
    isVisible: false,
  });

  // Refs
  let menuRef: HTMLDivElement | undefined;
  let submenuRef: HTMLDivElement | undefined;

  // Effects
  createEffect(() => {
    if (local.visible) {
      setState((prev) => ({
        ...prev,
        isVisible: true,
        selectedIndex: -1,
        submenuOpen: null,
      }));
      document.addEventListener("click", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("click", handleOutsideClick);
        document.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      setState((prev) => ({ ...prev, isVisible: false }));
    }
  });

  // Cleanup
  onCleanup(() => {
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleKeyDown);
  });

  // Event handlers
  const handleOutsideClick = (event: MouseEvent) => {
    if (menuRef && !menuRef.contains(event.target as Node)) {
      local.onClose();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!local.enableKeyboard) return;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        local.onClose();
        break;
      case "ArrowDown":
        event.preventDefault();
        setState((prev) => ({
          ...prev,
          selectedIndex: Math.min(
            prev.selectedIndex + 1,
            local.items.length - 1,
          ),
        }));
        break;
      case "ArrowUp":
        event.preventDefault();
        setState((prev) => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
        break;
      case "ArrowRight": {
        event.preventDefault();
        const currentItem = local.items[state().selectedIndex];
        if (currentItem?.submenu) {
          setState((prev) => ({ ...prev, submenuOpen: prev.selectedIndex }));
        }
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        const selectedItem = local.items[state().selectedIndex];
        if (selectedItem && !selectedItem.disabled) {
          handleItemClick(selectedItem);
        }
        break;
      }
    }
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;

    if (item.submenu) {
      // Toggle submenu
      setState((prev) => ({
        ...prev,
        submenuOpen:
          prev.submenuOpen === prev.selectedIndex ? null : prev.selectedIndex,
      }));
    } else {
      // Execute action and close menu
      item.onClick?.();
      local.onClose();
    }
  };

  const handleItemMouseEnter = (index: number) => {
    setState((prev) => ({ ...prev, selectedIndex: index }));

    // Auto-open submenu on hover
    const item = local.items[index];
    if (item?.submenu) {
      setState((prev) => ({ ...prev, submenuOpen: index }));
    } else {
      setState((prev) => ({ ...prev, submenuOpen: null }));
    }
  };

  const handleItemMouseLeave = () => {
    // Don't immediately close submenu to allow moving to submenu
  };

  // Computed values
  const setMenuPosition = () => {
    if (menuRef) {
      menuRef.style.setProperty('--context-menu-x', `${local.x}px`);
      menuRef.style.setProperty('--context-menu-y', `${local.y}px`);
    }
  };

  const setSubmenuPosition = () => {
    if (submenuRef && state().submenuOpen !== null) {
      const itemElement = menuRef?.querySelector(
        `[data-index="${state().submenuOpen}"]`,
      );
      if (itemElement) {
        const rect = itemElement.getBoundingClientRect();
        submenuRef.style.setProperty('--context-menu-submenu-x', `${rect.right + 4}px`);
        submenuRef.style.setProperty('--context-menu-submenu-y', `${rect.top}px`);
      }
    }
  };

  const hasSubmenu = (item: ContextMenuItem) =>
    item.submenu && item.submenu.length > 0;

  // Set positions when component updates
  createEffect(() => {
    if (local.visible) {
      setMenuPosition();
    }
  });

  createEffect(() => {
    if (state().submenuOpen !== null) {
      setSubmenuPosition();
    }
  });

  return (
    <Show when={local.visible}>
      <>
        {/* Backdrop */}
        <div class="reynard-context-menu__backdrop" onClick={() => local.onClose()} />

        {/* Main Menu */}
        <div
          ref={menuRef}
          class={`reynard-context-menu ${local.class || ""}`}
          role="menu"
          tabindex={-1}
        >
          <For each={local.items}>
            {(item, index) => (
              <>
                <div
                  class={`reynard-context-menu__item ${
                    state().selectedIndex === index()
                      ? "reynard-context-menu__item--selected"
                      : ""
                  } ${item.disabled ? "reynard-context-menu__item--disabled" : ""}`}
                  data-index={index()}
                  role="menuitem"
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => handleItemMouseEnter(index())}
                  onMouseLeave={handleItemMouseLeave}
                  data-testid={`context-menu-item-${item.id}`}
                >
                  <Show when={local.showIcons && item.icon}>
                    <span class="reynard-context-menu__item-icon">
                      {item.icon}
                    </span>
                  </Show>
                  <span class="reynard-context-menu__item-label">
                    {item.label}
                  </span>
                  <Show when={hasSubmenu(item)}>
                    <span class="reynard-context-menu__item-arrow">▶</span>
                  </Show>
                </div>

                <Show when={item.separator}>
                  <div class="reynard-context-menu__separator" />
                </Show>
              </>
            )}
          </For>
        </div>

        {/* Submenu */}
        <Show when={state().submenuOpen !== null}>
          <div
            ref={submenuRef}
            class="reynard-context-menu reynard-context-menu--submenu"
            role="menu"
          >
            <For each={local.items[state().submenuOpen!]?.submenu || []}>
              {(item) => (
                <>
                  <div
                    class={`reynard-context-menu__item ${
                      item.disabled ? "reynard-context-menu__item--disabled" : ""
                    }`}
                    role="menuitem"
                    onClick={() => handleItemClick(item)}
                    data-testid={`context-menu-submenu-item-${item.id}`}
                  >
                    <Show when={local.showIcons && item.icon}>
                      <span class="reynard-context-menu__item-icon">
                        {item.icon}
                      </span>
                    </Show>
                    <span class="reynard-context-menu__item-label">
                      {item.label}
                    </span>
                  </div>

                  <Show when={item.separator}>
                    <div class="reynard-context-menu__separator" />
                  </Show>
                </>
              )}
            </For>
          </div>
        </Show>
      </>
    </Show>
  );
};
