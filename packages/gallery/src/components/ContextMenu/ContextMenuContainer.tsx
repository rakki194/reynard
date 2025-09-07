/**
 * ContextMenu Container Component
 * Main menu container with items
 */

import { Component, For, Show } from "solid-js";
import type { ContextMenuItem } from "./types";
import { ContextMenuItemComponent } from "./ContextMenuItem";

export interface ContextMenuContainerProps {
  items: ContextMenuItem[];
  selectedIndex: number;
  showIcons: boolean;
  class?: string;
  menuRef: HTMLDivElement | undefined;
  handleItemClick: (item: ContextMenuItem) => void;
  handleItemMouseEnter: (index: number) => void;
  handleItemMouseLeave: () => void;
}

/**
 * Main menu container component
 */
export const ContextMenuContainer: Component<ContextMenuContainerProps> = (props) => {
  return (
    <div
      ref={props.menuRef}
      class={`reynard-context-menu ${props.class || ""}`}
      role="menu"
      aria-label="Context menu"
      id="context-menu"
      tabindex={-1}
    >
      <For each={props.items}>
        {(item, index) => (
          <>
            <ContextMenuItemComponent
              item={item}
              index={index()}
              isSelected={props.selectedIndex === index()}
              showIcons={props.showIcons}
              onClick={props.handleItemClick}
              onMouseEnter={props.handleItemMouseEnter}
              onMouseLeave={props.handleItemMouseLeave}
            />
            <Show when={item.separator}>
              <div role="separator" class="reynard-context-menu__separator" />
            </Show>
          </>
        )}
      </For>
    </div>
  );
};
