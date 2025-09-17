/**
 * useDragDrop Composable
 * Orchestrates drag and drop functionality for file uploads
 */

import { createSignal } from "solid-js";
import type { FileUploadProps } from "../types";
import { createDragHandlers } from "./drag-handlers";
import { createPasteHandlerWithCleanup } from "./paste-handler";

export function useDragDrop(props: FileUploadProps, onFilesDropped: (files: File[]) => void) {
  const [isDragOver, setIsDragOver] = createSignal(false);

  // Create drag event handlers
  const dragHandlers = createDragHandlers(props, setIsDragOver, onFilesDropped);

  // Set up paste event handling
  createPasteHandlerWithCleanup(files => {
    onFilesDropped(files);
    props.onFilesDropped?.(files);
  });

  return {
    isDragOver,
    ...dragHandlers,
  };
}
