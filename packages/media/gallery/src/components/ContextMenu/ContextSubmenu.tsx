/**
 * ContextSubmenu Component
 * Submenu component for context menus
 */

import { Component, For, Show } from "solid-js";
import type { ContextMenuItem } from "./types";

export interface ContextSubmenuProps {
  items: ContextMenuItem[];
  showIcons: boolean;
  onItemClick: (item: ContextMenuItem) => void;
}

/**
 * Context menu submenu component
 */
export const ContextSubmenu: Component<ContextSubmenuProps> = props => {
  return (
    <ul class="reynard-context-menu reynard-context-menu--submenu" role="menu" aria-label="Submenu">
      <For each={props.items}>
        {item => (
          <>
            <li
              class={`reynard-context-menu__item ${item.disabled ? "reynard-context-menu__item--disabled" : ""}`}
              role="menuitem"
              tabindex="-1"
              {...(item.disabled && { "aria-disabled": "true" })}
              onClick={() => props.onItemClick(item)}
              data-testid={`context-menu-submenu-item-${item.id}`}
            >
              <Show when={props.showIcons && item.icon}>
                <span class="reynard-context-menu__item-icon">{item.icon}</span>
              </Show>
              <span class="reynard-context-menu__item-label">{item.label}</span>
            </li>

            <Show when={item.separator}>
              <li class="reynard-context-menu__separator" />
            </Show>
          </>
        )}
      </For>
    </ul>
  );
};
