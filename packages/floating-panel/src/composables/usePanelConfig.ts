/**
 * Panel Configuration Composable
 * 
 * Extracted configuration logic to maintain 140-line axiom.
 */

import type { PanelConfig } from "../types";

export const usePanelConfig = (userConfig?: PanelConfig): Required<PanelConfig> => {
  return {
    draggable: true,
    resizable: false,
    closable: false,
    backdrop: false,
    backdropBlur: false,
    backdropColor: "transparent",
    animationDelay: 0,
    animationDuration: 300,
    animationEasing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    showOnHover: false,
    hoverDelay: 500,
    persistent: true,
    theme: "default",
    ...userConfig
  };
};
