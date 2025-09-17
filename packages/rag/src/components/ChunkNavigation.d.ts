/**
 * Chunk Navigation Component
 *
 * Navigation controls for browsing through file chunks.
 */
import { Component } from "solid-js";
export interface ChunkNavigationProps {
    chunks: string[];
    selectedChunk: number | null;
    onChunkChange: (chunkIndex: number) => void;
    chunkIndex?: number;
    chunkText?: string;
}
export declare const ChunkNavigation: Component<ChunkNavigationProps>;
