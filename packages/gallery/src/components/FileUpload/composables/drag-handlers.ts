/**
 * Drag Event Handlers
 * Handles drag and drop event logic for file uploads
 */

import type { FileUploadProps } from "../types";

export interface DragHandlers {
  handleDragOver: (event: DragEvent) => void;
  handleDragLeave: (event: DragEvent) => void;
  handleDrop: (event: DragEvent) => void;
}

/**
 * Creates drag event handlers for file upload
 */
export function createDragHandlers(
  props: FileUploadProps,
  setIsDragOver: (value: boolean) => void,
  onFilesDropped: (files: File[]) => void,
): DragHandlers {
  /**
   * Handle drag over events
   */
  const handleDragOver = (event: DragEvent) => {
    if (!props.enableDragDrop) return;

    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  /**
   * Handle drag leave events
   */
  const handleDragLeave = (event: DragEvent) => {
    if (!props.enableDragDrop) return;

    event.preventDefault();
    event.stopPropagation();

    // Only set drag over to false if we're leaving the drop zone entirely
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  /**
   * Handle drop events
   */
  const handleDrop = (event: DragEvent) => {
    if (!props.enableDragDrop) return;

    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      onFilesDropped(files);
      props.onFilesDropped?.(files);
    }
  };

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
