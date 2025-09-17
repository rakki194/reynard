/**
 * Text Editor Component for Reynard Caption System
 *
 * Provides Monaco editor integration for text file editing.
 */
import { Component } from "solid-js";
import { TextFile } from "../types/TextTypes";
export interface TextEditorProps {
    file: TextFile;
    onClose: () => void;
    onModify: (content: string) => void;
    editable?: boolean;
}
export declare const TextEditor: Component<TextEditorProps>;
