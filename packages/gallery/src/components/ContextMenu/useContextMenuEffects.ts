/**
 * ContextMenu Effects
 * Composable for managing context menu effects and lifecycle
 */

import { createEffect, onCleanup, Accessor } from "solid-js";
import type { ContextMenuState } from "./types";

export interface UseContextMenuEffectsProps {
  visible: boolean;
  state: Accessor<ContextMenuState>;
  resetState: () => void;
  setVisible: (visible: boolean) => void;
  handleOutsideClick: (event: MouseEvent) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  setMenuPosition: () => void;
  setSubmenuPosition: () => void;
}

/**
 * Creates effects for context menu lifecycle management
 */
export const useContextMenuEffects = ({
  visible,
  state,
  resetState,
  setVisible,
  handleOutsideClick,
  handleKeyDown,
  setMenuPosition,
  setSubmenuPosition,
}: UseContextMenuEffectsProps) => {
  // Main visibility effect
  createEffect(() => {
    if (visible) {
      resetState();
      setVisible(true);
      document.addEventListener("click", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("click", handleOutsideClick);
        document.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      setVisible(false);
    }
  });

  // Cleanup
  onCleanup(() => {
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleKeyDown);
  });

  // Position effects
  createEffect(() => {
    if (visible) {
      setMenuPosition();
    }
  });

  createEffect(() => {
    if (state().submenuOpen !== null) {
      setSubmenuPosition();
    }
  });
};
