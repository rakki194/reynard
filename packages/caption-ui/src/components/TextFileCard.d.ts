/**
 * Text File Card Component for Reynard Caption System
 *
 * Displays individual text file information in a card format.
 */
import { TextFile } from "reynard-caption-core";
import { Component } from "solid-js";
export interface TextFileCardProps {
    file: TextFile;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: () => void;
    showMetadata?: boolean;
}
export declare const TextFileCard: Component<TextFileCardProps>;
