/**
 * Paste Event Handler
 * Handles paste events for file uploads
 */

import { onCleanup } from 'solid-js';

export interface PasteHandler {
  setupEventListeners: () => void;
  cleanupEventListeners: () => void;
}

/**
 * Creates paste event handler for file upload
 */
export function createPasteHandler(
  onFilesDropped: (files: File[]) => void
): PasteHandler {
  /**
   * Handle paste events for file uploads
   */
  const handlePaste = (event: Event) => {
    const clipboardEvent = event as { clipboardData?: { files?: File[] } };
    const files = clipboardEvent.clipboardData?.files || [];
    if (files.length > 0) {
      onFilesDropped(files);
    }
  };

  /**
   * Set up global event listeners
   */
  const setupEventListeners = () => {
    document.addEventListener('paste', handlePaste);
  };

  /**
   * Clean up event listeners
   */
  const cleanupEventListeners = () => {
    document.removeEventListener('paste', handlePaste);
  };

  return {
    setupEventListeners,
    cleanupEventListeners
  };
}

/**
 * Composable for managing paste event listeners
 */
export function createPasteHandlerWithCleanup(onFilesDropped: (files: File[]) => void) {
  const pasteHandler = createPasteHandler(onFilesDropped);
  
  // Set up event listeners on mount
  pasteHandler.setupEventListeners();
  onCleanup(pasteHandler.cleanupEventListeners);
  
  return pasteHandler;
}
