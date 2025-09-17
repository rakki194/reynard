/**
 * ContextMenu Keyboard Navigation
 * Composable for handling keyboard navigation in context menus
 */

import { Accessor } from "solid-js";
import type { ContextMenuItem, ContextMenuState } from "./types";

export interface UseKeyboardNavigationProps {
  items: ContextMenuItem[];
  state: Accessor<ContextMenuState>;
  setState: (fn: (prev: ContextMenuState) => ContextMenuState) => void;
  enableKeyboard: boolean;
  onClose: () => void;
  onItemClick: (item: ContextMenuItem) => void;
}

export interface UseKeyboardNavigationReturn {
  handleKeyDown: (event: KeyboardEvent) => void;
}

/**
 * Creates keyboard navigation handlers for context menu
 */
export const useKeyboardNavigation = ({
  items,
  state,
  setState,
  enableKeyboard,
  onClose,
  onItemClick,
}: UseKeyboardNavigationProps): UseKeyboardNavigationReturn => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!enableKeyboard) return;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      case "ArrowDown":
        event.preventDefault();
        setState(prev => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, items.length - 1),
        }));
        break;
      case "ArrowUp":
        event.preventDefault();
        setState(prev => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
        break;
      case "ArrowRight": {
        event.preventDefault();
        const currentItem = items[state().selectedIndex];
        if (currentItem?.submenu) {
          setState(prev => ({ ...prev, submenuOpen: prev.selectedIndex }));
        }
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        const selectedItem = items[state().selectedIndex];
        if (selectedItem && !selectedItem.disabled) {
          onItemClick(selectedItem);
        }
        break;
      }
    }
  };

  return {
    handleKeyDown,
  };
};
