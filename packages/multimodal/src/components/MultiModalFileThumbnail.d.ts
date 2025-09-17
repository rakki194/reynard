/**
 * Multi-Modal File Thumbnail Component
 *
 * Handles thumbnail display with fallback to file type icon.
 */
import { Component } from "solid-js";
import type { MultiModalFile } from "../types/MultiModalTypes";
interface MultiModalFileThumbnailProps {
    file: MultiModalFile;
}
export declare const MultiModalFileThumbnail: Component<MultiModalFileThumbnailProps>;
export {};
