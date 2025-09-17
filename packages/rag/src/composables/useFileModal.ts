/**
 * File Modal Composable
 *
 * Manages state and actions for the RAG file modal.
 */

import { createSignal, createEffect } from "solid-js";
import { downloadFile, copyToClipboard, chunkContent } from "../utils/file-utils";

export function useFileModal(props: { fileContent: string; fileName: string; chunkIndex?: number }) {
  const [selectedChunk, setSelectedChunk] = createSignal<number | null>(props.chunkIndex ?? null);
  const [showLineNumbers, setShowLineNumbers] = createSignal(true);
  const [wrapLines, setWrapLines] = createSignal(false);
  const [fontSize, setFontSize] = createSignal(14);
  const [contentChunks, setContentChunks] = createSignal<string[]>([]);

  // Split content into chunks for navigation
  createEffect(() => {
    if (props.fileContent) {
      const chunks = chunkContent(props.fileContent, 50);
      setContentChunks(chunks);
    }
  });

  const handleDownload = () => {
    downloadFile(props.fileContent, props.fileName);
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(props.fileContent);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return {
    selectedChunk,
    setSelectedChunk,
    showLineNumbers,
    setShowLineNumbers,
    wrapLines,
    setWrapLines,
    fontSize,
    setFontSize,
    contentChunks,
    handleDownload,
    handleCopy,
  };
}
