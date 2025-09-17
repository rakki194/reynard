/**
 * Panel Event Types
 *
 * Event types for floating panels.
 */
import type { PanelPosition, PanelSize } from "./PanelTypes.js";
import type { PanelConfig } from "./PanelConfig.js";
import type { JSX } from "solid-js";
export interface PanelEventHandlers {
    onPanelShow?: (panel: unknown) => void;
    onPanelHide?: (panel: unknown) => void;
    onPanelDrag?: (panel: unknown, position: PanelPosition) => void;
    onPanelResize?: (panel: unknown, size: PanelSize) => void;
}
export interface FloatingPanelProps {
    id: string;
    position: PanelPosition;
    size?: PanelSize;
    config?: PanelConfig;
    children?: JSX.Element;
    class?: string;
    style?: JSX.CSSProperties;
    onShow?: () => void;
    onHide?: () => void;
    onDrag?: (position: PanelPosition) => void;
    onResize?: (size: PanelSize) => void;
    title?: string;
}
