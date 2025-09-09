/**
 * ContextMenu Main Composable
 * Single composable that orchestrates all context menu functionality
 */

import { Accessor } from "solid-js";
import type { ContextMenuProps, ContextMenuItem } from "./types";
import { useContextMenuState } from "./useContextMenuState";
import { useKeyboardNavigation } from "./useKeyboardNavigation";
import { useContextMenuPositioning } from "./useContextMenuPositioning";
import { useContextMenuHandlers } from "./useContextMenuHandlers";
import { useContextMenuEffects } from "./useContextMenuEffects";

export interface UseContextMenuReturn {
  state: Accessor<import("./types").ContextMenuState>;
  handleOutsideClick: (event: MouseEvent) => void;
  handleItemClick: (item: ContextMenuItem) => void;
  handleItemMouseEnter: (index: number) => void;
  handleItemMouseLeave: () => void;
  setMenuPosition: () => void;
  setSubmenuPosition: () => void;
}

/**
 * Main composable that orchestrates all context menu functionality
 */
export const useContextMenu = (
  props: ContextMenuProps,
): UseContextMenuReturn => {
  const { state, setState, resetState, setVisible } = useContextMenuState();

  // Event handlers
  const {
    handleOutsideClick,
    handleItemClick,
    handleItemMouseEnter,
    handleItemMouseLeave,
  } = useContextMenuHandlers({
    items: props.items,
    state,
    setState,
    onClose: props.onClose,
    menuRef: undefined, // Will be set by parent
  });

  // Keyboard navigation
  const { handleKeyDown } = useKeyboardNavigation({
    items: props.items,
    state,
    setState,
    enableKeyboard: props.enableKeyboard ?? true,
    onClose: props.onClose,
    onItemClick: handleItemClick,
  });

  // Positioning
  const { setMenuPosition, setSubmenuPosition } = useContextMenuPositioning({
    x: props.x,
    y: props.y,
    state,
    menuRef: undefined, // Will be set by parent
    submenuRef: undefined, // Will be set by parent
  });

  // Effects
  useContextMenuEffects({
    visible: props.visible,
    state,
    resetState,
    setVisible,
    handleOutsideClick,
    handleKeyDown,
    setMenuPosition,
    setSubmenuPosition,
  });

  return {
    state,
    handleOutsideClick,
    handleItemClick,
    handleItemMouseEnter,
    handleItemMouseLeave,
    setMenuPosition,
    setSubmenuPosition,
  };
};
