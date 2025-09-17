/**
 * Panel Styles Composable
 *
 * Extracted style generation logic to maintain 140-line axiom.
 */
import type { JSX as _JSX } from "solid-js";
import type { PanelConfig, PanelPosition, PanelSize } from "../types.js";
export interface UsePanelStylesProps {
    position: PanelPosition;
    size?: PanelSize;
    config: Required<PanelConfig>;
}
export declare const usePanelStyles: (props: UsePanelStylesProps) => {
    styles: _JSX.CSSProperties;
    getCSSVariables: () => _JSX.CSSProperties;
};
