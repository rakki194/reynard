/**
 * ContextMenu Event Handlers
 * Composable for handling context menu events
 */

import { Accessor } from "solid-js";
import type { ContextMenuItem, ContextMenuState } from "./types";

export interface UseContextMenuHandlersProps {
  items: ContextMenuItem[];
  state: Accessor<ContextMenuState>;
  setState: (fn: (prev: ContextMenuState) => ContextMenuState) => void;
  onClose: () => void;
  menuRef: HTMLDivElement | undefined;
}

export interface UseContextMenuHandlersReturn {
  handleOutsideClick: (event: MouseEvent) => void;
  handleItemClick: (item: ContextMenuItem) => void;
  handleItemMouseEnter: (index: number) => void;
  handleItemMouseLeave: () => void;
}

/**
 * Creates event handlers for context menu
 */
export const useContextMenuHandlers = ({
  items,
  state,
  setState,
  onClose,
  menuRef,
}: UseContextMenuHandlersProps): UseContextMenuHandlersReturn => {
  const handleOutsideClick = (event: MouseEvent) => {
    if (menuRef && !menuRef.contains(event.target as Node)) {
      onClose();
    }
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;

    if (item.submenu) {
      // Toggle submenu
      setState(prev => ({
        ...prev,
        submenuOpen: prev.submenuOpen === prev.selectedIndex ? null : prev.selectedIndex,
      }));
    } else {
      // Execute action and close menu
      item.onClick?.();
      onClose();
    }
  };

  const handleItemMouseEnter = (index: number) => {
    setState(prev => ({ ...prev, selectedIndex: index }));

    // Auto-open submenu on hover
    const item = items[index];
    if (item?.submenu) {
      setState(prev => ({ ...prev, submenuOpen: index }));
    } else {
      setState(prev => ({ ...prev, submenuOpen: null }));
    }
  };

  const handleItemMouseLeave = () => {
    // Don't immediately close submenu to allow moving to submenu
  };

  return {
    handleOutsideClick,
    handleItemClick,
    handleItemMouseEnter,
    handleItemMouseLeave,
  };
};
