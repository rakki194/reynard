/**
 * Text File Manager Composable for Reynard Caption System
 *
 * Handles text file state management and operations.
 */
import { TextFile } from "../types/TextTypes";
export interface UseTextFileManagerOptions {
    initialFiles?: TextFile[];
    onFileSelect?: (file: TextFile) => void;
    onFileRemove?: (fileId: string) => void;
    onFileModify?: (fileId: string, content: string) => void;
}
export declare const useTextFileManager: (options?: UseTextFileManagerOptions) => {
    textFiles: import("solid-js").Accessor<TextFile[]>;
    selectedFile: import("solid-js").Accessor<TextFile | null>;
    setSelectedFile: import("solid-js").Setter<TextFile | null>;
    handleFileSelect: (file: TextFile) => void;
    handleFileRemove: (fileId: string) => void;
    handleFileModify: (fileId: string, content: string) => void;
    addFiles: (newFiles: TextFile[]) => void;
};
