export interface DragAndDropOptions {
    onDragStateChange: (isDragging: boolean) => void;
    onFilesDropped?: (files: FileList) => void;
    onItemsDropped?: (items: any[], targetPath: string) => void;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    uploadFiles?: (files: FileList) => Promise<void>;
    moveItems?: (items: string[], sourcePath: string, targetPath: string) => Promise<any>;
    notify?: (message: string, type?: "error" | "success" | "info" | "warning") => void;
}
/**
 * Drag and Drop composable for handling file uploads and item movement
 *
 * @param options Configuration options for drag and drop behavior
 * @returns Object with drag and drop handlers and state
 */
export declare function useDragAndDrop(options: DragAndDropOptions): {
    isMoving: import("solid-js").Accessor<boolean>;
    movingItems: import("solid-js").Accessor<Set<string>>;
};
