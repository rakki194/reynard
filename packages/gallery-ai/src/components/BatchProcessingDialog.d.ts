/**
 * Batch Processing Dialog Component
 *
 * Dialog for managing batch annotation operations with progress tracking.
 * Provides a user-friendly interface for processing multiple images.
 */
import { Component } from "solid-js";
import type { FileItem, GalleryCaptionResult } from "../types";
export interface BatchProcessingDialogProps {
    /** Whether the dialog is visible */
    visible: boolean;
    /** Items to process */
    items: FileItem[];
    /** Available generators */
    availableGenerators: string[];
    /** Event handlers */
    onClose: () => void;
    onComplete?: (results: GalleryCaptionResult[]) => void;
    onError?: (error: string) => void;
    /** Custom class name */
    class?: string;
}
export declare const BatchProcessingDialog: Component<BatchProcessingDialogProps>;
