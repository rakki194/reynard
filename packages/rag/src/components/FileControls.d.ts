/**
 * File Controls Component
 *
 * Controls for file display options like line numbers, wrapping, font size, etc.
 */
import { Component } from "solid-js";
export interface FileControlsProps {
    showLineNumbers: boolean;
    onToggleLineNumbers: () => void;
    wrapLines: boolean;
    onToggleWrapLines: () => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    onCopy: () => void;
    onDownload: () => void;
}
export declare const FileControls: Component<FileControlsProps>;
