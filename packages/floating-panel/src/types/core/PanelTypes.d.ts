/**
 * Core Panel Types
 *
 * Core types for floating panels.
 */
import type { JSX } from "solid-js";
import type { PanelConfig } from "./PanelConfig.js";
export interface FloatingPanel {
    id: string;
    position: PanelPosition;
    size: PanelSize;
    content: JSX.Element;
    config: PanelConfig;
}
export interface PanelPosition {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
    zIndex?: number;
}
export interface PanelSize {
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
}
