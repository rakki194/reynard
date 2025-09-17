/**
 * PanelHeader Component
 *
 * Ported from Yipyap's panel header with drag functionality.
 * Provides drag handle, minimize/maximize, and reset controls.
 */
import type { Component } from "solid-js";
import type { DraggableResizableReturn } from "../composables/useDraggableResizable";
interface PanelHeaderProps {
    title: string;
    panel: DraggableResizableReturn;
    onReset?: () => void;
}
export declare const PanelHeader: Component<PanelHeaderProps>;
export {};
