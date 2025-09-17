/**
 * File Content Display Component
 *
 * Displays file content with syntax highlighting and line numbers.
 */
import { Component } from "solid-js";
export interface FileContentDisplayProps {
    fileContent: string;
    fileName: string;
    showLineNumbers: boolean;
    wrapLines: boolean;
    fontSize: number;
}
export declare const FileContentDisplay: Component<FileContentDisplayProps>;
