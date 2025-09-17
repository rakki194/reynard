/**
 * Batch File List Component
 *
 * Displays and manages the list of files in the batch.
 */
import { Component } from "solid-js";
import type { BatchFile } from "./BatchCaptionProcessor";
export interface BatchFileListProps {
    files: BatchFile[];
    availableGenerators: string[];
    isProcessing: boolean;
    onRemoveFile: (fileId: string) => void;
    onUpdateFileConfig: (fileId: string, updates: Partial<BatchFile>) => void;
    onProcessBatch: () => void;
    onClearBatch: () => void;
    class?: string;
}
export declare const BatchFileList: Component<BatchFileListProps>;
