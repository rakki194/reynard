/**
 * ContextMenu Renderer
 * Renders the context menu UI
 */

import { Component, Show, Accessor } from "solid-js";
import type { ContextMenuProps, ContextMenuItem, ContextMenuState } from "./types";
import { ContextMenuBackdrop } from "./ContextMenuBackdrop";
import { ContextMenuContainer } from "./ContextMenuContainer";
import { ContextMenuSubmenuWrapper } from "./ContextMenuSubmenuWrapper";

export interface ContextMenuRendererProps {
  props: ContextMenuProps;
  state: Accessor<ContextMenuState>;
  handleItemClick: (item: ContextMenuItem) => void;
  handleItemMouseEnter: (index: number) => void;
  handleItemMouseLeave: () => void;
  menuRef: HTMLDivElement | undefined;
  submenuRef: HTMLDivElement | undefined;
}

/**
 * Renders the context menu UI
 */
export const ContextMenuRenderer: Component<ContextMenuRendererProps> = (componentProps) => {
  return (
    <Show when={componentProps.props.visible}>
      <>
        <ContextMenuBackdrop onClose={componentProps.props.onClose} />
        
        <ContextMenuContainer
          items={componentProps.props.items}
          selectedIndex={componentProps.state().selectedIndex}
          showIcons={componentProps.props.showIcons ?? false}
          class={componentProps.props.class}
          menuRef={componentProps.menuRef}
          handleItemClick={componentProps.handleItemClick}
          handleItemMouseEnter={componentProps.handleItemMouseEnter}
          handleItemMouseLeave={componentProps.handleItemMouseLeave}
        />
        
        <ContextMenuSubmenuWrapper
          submenuOpen={componentProps.state().submenuOpen}
          items={componentProps.props.items}
          showIcons={componentProps.props.showIcons ?? false}
          submenuRef={componentProps.submenuRef}
          handleItemClick={componentProps.handleItemClick}
        />
      </>
    </Show>
  );
};
