/**
 * Panel Keyboard Composable
 * 
 * Extracted keyboard handling logic to maintain 140-line axiom.
 */

import { createEffect } from "solid-js";
import type { PanelConfig } from "../types";

export interface UsePanelKeyboardProps {
  panelRef: () => HTMLElement | undefined;
  config: Required<PanelConfig>;
  onHide?: () => void;
}

export const usePanelKeyboard = (props: UsePanelKeyboardProps) => {
  // Handle escape key to close panel
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && props.config.closable) {
      props.onHide?.();
    }
  };

  createEffect(() => {
    const panel = props.panelRef();
    if (panel && props.config.closable) {
      panel.addEventListener("keydown", handleKeyDown);
      return () => panel.removeEventListener("keydown", handleKeyDown);
    }
  });
};
