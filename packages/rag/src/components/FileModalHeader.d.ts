/**
 * File Modal Header Component
 *
 * Header section with file info and controls for the RAG file modal.
 */
import { Component } from "solid-js";
export interface FileModalHeaderProps {
    filePath: string;
    fileContent: string;
    showLineNumbers: boolean;
    onToggleLineNumbers: () => void;
    wrapLines: boolean;
    onToggleWrapLines: () => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    onCopy: () => void;
    onDownload: () => void;
}
export declare const FileModalHeader: Component<FileModalHeaderProps>;
