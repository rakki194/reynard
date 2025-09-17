/**
 * Multi-Modal File Info Component
 *
 * Displays file information including name, size, and metadata.
 */
import { Component } from "solid-js";
import type { MultiModalFile } from "../types/MultiModalTypes";
interface MultiModalFileInfoProps {
    file: MultiModalFile;
    showMetadata?: boolean;
}
export declare const MultiModalFileInfo: Component<MultiModalFileInfoProps>;
export {};
