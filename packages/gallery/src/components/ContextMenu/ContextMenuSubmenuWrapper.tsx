/**
 * ContextMenu Submenu Wrapper Component
 * Handles submenu display logic
 */

import { Component, Show } from "solid-js";
import type { ContextMenuItem } from "./types";
import { ContextSubmenu } from "./ContextSubmenu";

export interface ContextMenuSubmenuWrapperProps {
  submenuOpen: number | null;
  items: ContextMenuItem[];
  showIcons: boolean;
  submenuRef: HTMLDivElement | undefined;
  handleItemClick: (item: ContextMenuItem) => void;
}

/**
 * Submenu wrapper component
 */
export const ContextMenuSubmenuWrapper: Component<
  ContextMenuSubmenuWrapperProps
> = (props) => {
  return (
    <Show when={props.submenuOpen !== null}>
      <div ref={props.submenuRef}>
        <ContextSubmenu
          items={props.items[props.submenuOpen!]?.submenu || []}
          showIcons={props.showIcons}
          onItemClick={props.handleItemClick}
        />
      </div>
    </Show>
  );
};
