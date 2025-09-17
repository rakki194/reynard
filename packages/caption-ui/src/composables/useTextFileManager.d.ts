/**
 * Text File Manager Composable for Reynard Caption System
 *
 * Handles text file state management and operations.
 */
import { TextFile } from "reynard-caption-core";
export interface UseTextFileManagerOptions {
    initialFiles?: TextFile[];
    onFileSelect?: (file: TextFile) => void;
    onFileRemove?: (fileId: string) => void;
    onFileModify?: (fileId: string, content: string) => void;
}
export declare const useTextFileManager: (options?: UseTextFileManagerOptions) => {
    textFiles: import("solid-js").Accessor<TextFile[]>;
    selectedFile: import("solid-js").Accessor<any>;
    setSelectedFile: import("solid-js").Setter<any>;
    handleFileSelect: (file: TextFile) => void;
    handleFileRemove: (fileId: string) => void;
    handleFileModify: (fileId: string, content: string) => void;
    addFiles: (newFiles: TextFile[]) => void;
};
