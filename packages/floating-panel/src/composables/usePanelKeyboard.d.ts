/**
 * Panel Keyboard Composable
 *
 * Extracted keyboard handling logic to maintain 140-line axiom.
 */
import type { PanelConfig } from "../types";
export interface UsePanelKeyboardProps {
    panelRef: () => HTMLElement | undefined;
    config: Required<PanelConfig>;
    onHide?: () => void;
}
export declare const usePanelKeyboard: (props: UsePanelKeyboardProps) => void;
