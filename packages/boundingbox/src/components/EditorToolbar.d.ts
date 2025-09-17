/**
 * Editor Toolbar Component
 *
 * Handles toolbar UI and actions
 */
import type { Component } from "solid-js";
import type { EditorConfig } from "../types";
export interface EditorToolbarProps {
    config: EditorConfig;
    selectedLabelClass: string;
    onLabelClassChange: (label: string) => void;
    className?: string;
}
export declare const EditorToolbar: Component<EditorToolbarProps>;
