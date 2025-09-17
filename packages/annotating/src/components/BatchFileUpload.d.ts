/**
 * Batch File Upload Component
 *
 * Handles drag-and-drop file upload for batch processing.
 */
import { Component } from "solid-js";
export interface BatchFileUploadProps {
    onFilesAdded: (files: File[]) => void;
    disabled?: boolean;
    class?: string;
}
export declare const BatchFileUpload: Component<BatchFileUploadProps>;
