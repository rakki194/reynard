/**
 * Text Files Grid Component for Reynard Caption System
 *
 * Displays the grid of text file cards.
 */
import { Component } from "solid-js";
import { TextFile } from "../types/TextTypes";
export interface TextFilesGridProps {
    files: TextFile[];
    selectedFile: TextFile | null;
    onFileSelect: (file: TextFile) => void;
    onFileRemove: (fileId: string) => void;
    onFileModify: (fileId: string, content: string) => void;
    onCloseEditor: () => void;
    showMetadata?: boolean;
    editable?: boolean;
    class?: string;
}
export declare const TextFilesGrid: Component<TextFilesGridProps>;
