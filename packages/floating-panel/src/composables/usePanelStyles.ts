/**
 * Panel Styles Composable
 *
 * Extracted style generation logic to maintain 140-line axiom.
 */

import type { JSX as _JSX } from "solid-js";
import type { PanelConfig, PanelPosition, PanelSize } from "../types.js";
import { generatePanelStyles } from "./panel-styles/PanelStyleGenerator.js";

export interface UsePanelStylesProps {
  position: PanelPosition;
  size?: PanelSize;
  config: Required<PanelConfig>;
}

export const usePanelStyles = (props: UsePanelStylesProps) => {
  const styles = generatePanelStyles(props.position, props.size, props.config);

  return {
    styles,
    getCSSVariables: () => generatePanelStyles(props.position, props.size, props.config),
  };
};
