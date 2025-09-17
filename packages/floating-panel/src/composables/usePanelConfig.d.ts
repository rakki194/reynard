/**
 * Panel Configuration Composable
 *
 * Extracted configuration logic to maintain 140-line axiom.
 */
import type { PanelConfig } from "../types";
export declare const usePanelConfig: (userConfig?: PanelConfig) => Required<PanelConfig>;
