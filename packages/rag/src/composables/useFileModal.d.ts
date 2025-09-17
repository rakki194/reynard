/**
 * File Modal Composable
 *
 * Manages state and actions for the RAG file modal.
 */
export declare function useFileModal(props: {
    fileContent: string;
    fileName: string;
    chunkIndex?: number;
}): {
    selectedChunk: import("solid-js").Accessor<number | null>;
    setSelectedChunk: import("solid-js").Setter<number | null>;
    showLineNumbers: import("solid-js").Accessor<boolean>;
    setShowLineNumbers: import("solid-js").Setter<boolean>;
    wrapLines: import("solid-js").Accessor<boolean>;
    setWrapLines: import("solid-js").Setter<boolean>;
    fontSize: import("solid-js").Accessor<number>;
    setFontSize: import("solid-js").Setter<number>;
    contentChunks: import("solid-js").Accessor<string[]>;
    handleDownload: () => void;
    handleCopy: () => Promise<void>;
};
