/**
 * ContextMenuItem Component
 * Individual menu item component for context menus
 */

/* eslint-disable jsx-a11y/role-supports-aria-props */

import { Component, Show } from "solid-js";
import type { ContextMenuItem } from "./types";

export interface ContextMenuItemComponentProps {
  item: ContextMenuItem;
  index: number;
  isSelected: boolean;
  showIcons: boolean;
  onClick: (item: ContextMenuItem) => void;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
}

/**
 * Individual context menu item component
 * Note: This component must be used within a ContextMenuContainer with role="menu"
 * The ARIA role="menuitem" is valid when used within the proper parent container
 * 
 * This component is designed to be used within a menu structure and will be
 * properly accessible when rendered within ContextMenuContainer.
 */
export const ContextMenuItemComponent: Component<ContextMenuItemComponentProps> = (props) => {
  const hasSubmenu = (item: ContextMenuItem) =>
    item.submenu && item.submenu.length > 0;

  return (
    <div
      class={`reynard-context-menu__item ${
        props.isSelected ? "reynard-context-menu__item--selected" : ""
      } ${props.item.disabled ? "reynard-context-menu__item--disabled" : ""}`}
      role="menuitem"
      data-index={props.index}
      aria-describedby="context-menu"
      tabindex={props.isSelected ? "0" : "-1"}
      {...(props.item.disabled && { "aria-disabled": "true" })}
      onClick={() => props.onClick(props.item)}
      onMouseEnter={() => props.onMouseEnter(props.index)}
      onMouseLeave={() => props.onMouseLeave()}
      data-testid={`context-menu-item-${props.item.id}`}
      id={`context-menu-item-${props.index}`}
    >
      <Show when={props.showIcons && props.item.icon}>
        <span class="reynard-context-menu__item-icon">
          {props.item.icon}
        </span>
      </Show>
      <span class="reynard-context-menu__item-label">
        {props.item.label}
      </span>
      <Show when={hasSubmenu(props.item)}>
        <span class="reynard-context-menu__item-arrow" aria-hidden="true">▶</span>
      </Show>
    </div>
  );
};
