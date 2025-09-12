/**
 * Panel Styles Composable
 *
 * Extracted style generation logic to maintain 140-line axiom.
 */

import type { JSX } from "solid-js";
import type { PanelConfig, PanelPosition, PanelSize } from "../types";

export interface UsePanelStylesProps {
  position: PanelPosition;
  size?: PanelSize;
  config: Required<PanelConfig>;
}

export const usePanelStyles = (props: UsePanelStylesProps) => {
  // Generate CSS custom properties for theming
  const getCSSVariables = () => {
    const themeColors = {
      default: "var(--floating-panel-accent, #3b82f6)",
      accent: "var(--floating-panel-accent, #3b82f6)",
      warning: "var(--floating-panel-warning, #f59e0b)",
      error: "var(--floating-panel-error, #ef4444)",
      success: "var(--floating-panel-success, #10b981)",
      info: "var(--floating-panel-info, #06b6d4)",
    };

    return {
      "--panel-theme-color": themeColors[props.config.theme],
      "--panel-transition-duration": `${props.config.animationDuration}ms`,
      "--panel-transition-easing": props.config.animationEasing,
      "--panel-stagger-delay": `${props.config.animationDelay}ms`,
    };
  };

  // Generate inline styles for position and size
  const getInlineStyles = (): JSX.CSSProperties => {
    const { position, size = {} } = props;

    return {
      position: "absolute",
      top:
        typeof position.top === "number" ? `${position.top}px` : position.top,
      right:
        typeof position.right === "number"
          ? `${position.right}px`
          : position.right,
      bottom:
        typeof position.bottom === "number"
          ? `${position.bottom}px`
          : position.bottom,
      left:
        typeof position.left === "number"
          ? `${position.left}px`
          : position.left,
      width: typeof size.width === "number" ? `${size.width}px` : size.width,
      height:
        typeof size.height === "number" ? `${size.height}px` : size.height,
      "min-width":
        typeof size.minWidth === "number"
          ? `${size.minWidth}px`
          : size.minWidth,
      "min-height":
        typeof size.minHeight === "number"
          ? `${size.minHeight}px`
          : size.minHeight,
      "max-width":
        typeof size.maxWidth === "number"
          ? `${size.maxWidth}px`
          : size.maxWidth,
      "max-height":
        typeof size.maxHeight === "number"
          ? `${size.maxHeight}px`
          : size.maxHeight,
      "z-index": position.zIndex || 1000,
      ...getCSSVariables(),
    };
  };

  return {
    getInlineStyles,
  };
};
