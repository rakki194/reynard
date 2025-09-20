/**
 * ContextMenu State Management
 * Composable for managing context menu state
 */

import { createSignal, Accessor, Setter } from "solid-js";
import type { ContextMenuState } from "./types";

export interface UseContextMenuStateReturn {
  state: Accessor<ContextMenuState>;
  setState: Setter<ContextMenuState>;
  resetState: () => void;
  setSelectedIndex: (index: number) => void;
  setSubmenuOpen: (index: number | null) => void;
  setVisible: (visible: boolean) => void;
}

/**
 * Creates and manages context menu state
 */
export const useContextMenuState = (): UseContextMenuStateReturn => {
  const [state, setState] = createSignal<ContextMenuState>({
    selectedIndex: -1,
    submenuOpen: null,
    isVisible: false,
  });

  const resetState = () => {
    setState({
      selectedIndex: -1,
      submenuOpen: null,
      isVisible: false,
    });
  };

  const setSelectedIndex = (index: number) => {
    setState(prev => ({ ...prev, selectedIndex: index }));
  };

  const setSubmenuOpen = (index: number | null) => {
    setState(prev => ({ ...prev, submenuOpen: index }));
  };

  const setVisible = (visible: boolean) => {
    setState(prev => ({ ...prev, isVisible: visible }));
  };

  return {
    state,
    setState,
    resetState,
    setSelectedIndex,
    setSubmenuOpen,
    setVisible,
  };
};
