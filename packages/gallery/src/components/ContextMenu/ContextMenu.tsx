/**
 * ContextMenu Component
 * Dynamic context menu with positioning and action handling
 */

import { Component, splitProps } from "solid-js";
import "./ContextMenu.css";
import type { ContextMenuProps } from "./types";
import { useContextMenu } from "./useContextMenu";
import { ContextMenuRenderer } from "./ContextMenuRenderer";

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

  // Main composable
  const { state, handleItemClick, handleItemMouseEnter, handleItemMouseLeave } =
    useContextMenu(local);

  // Refs
  let menuRef: HTMLDivElement | undefined;
  let submenuRef: HTMLDivElement | undefined;

  return (
    <ContextMenuRenderer
      props={local}
      state={state}
      handleItemClick={handleItemClick}
      handleItemMouseEnter={handleItemMouseEnter}
      handleItemMouseLeave={handleItemMouseLeave}
      menuRef={menuRef}
      submenuRef={submenuRef}
    />
  );
};
