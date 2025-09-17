/**
 * ContextMenu Positioning
 * Composable for handling context menu positioning logic
 */

import { Accessor } from "solid-js";
import type { ContextMenuState } from "./types";

export interface UseContextMenuPositioningProps {
  x: number;
  y: number;
  state: Accessor<ContextMenuState>;
  menuRef: HTMLDivElement | undefined;
  submenuRef: HTMLDivElement | undefined;
}

export interface UseContextMenuPositioningReturn {
  setMenuPosition: () => void;
  setSubmenuPosition: () => void;
}

/**
 * Creates positioning handlers for context menu
 */
export const useContextMenuPositioning = ({
  x,
  y,
  state,
  menuRef,
  submenuRef,
}: UseContextMenuPositioningProps): UseContextMenuPositioningReturn => {
  const setMenuPosition = () => {
    if (menuRef) {
      menuRef.style.setProperty("--context-menu-x", `${x}px`);
      menuRef.style.setProperty("--context-menu-y", `${y}px`);
    }
  };

  const setSubmenuPosition = () => {
    if (submenuRef && state().submenuOpen !== null) {
      const itemElement = menuRef?.querySelector(`[data-index="${state().submenuOpen}"]`);
      if (itemElement) {
        const rect = itemElement.getBoundingClientRect();
        submenuRef.style.setProperty("--context-menu-submenu-x", `${rect.right + 4}px`);
        submenuRef.style.setProperty("--context-menu-submenu-y", `${rect.top}px`);
      }
    }
  };

  return {
    setMenuPosition,
    setSubmenuPosition,
  };
};
