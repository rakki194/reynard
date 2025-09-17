/**
 * Floating Panel Header Component
 *
 * Extracted header logic from FloatingPanel to maintain 140-line axiom.
 */
import type { Component } from "solid-js";
import type { PanelConfig } from "../types";
interface FloatingPanelHeaderProps {
    id: string;
    config: Required<PanelConfig>;
    onHide?: () => void;
}
export declare const FloatingPanelHeader: Component<FloatingPanelHeaderProps>;
export {};
