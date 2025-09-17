/**
 * Core Shiki State Management
 *
 * Handles the fundamental state for Shiki syntax highlighting
 */
import type { ShikiState } from "../types";
export declare function createShikiState(): {
    state: import("solid-js").Accessor<ShikiState>;
    updateState: (updates: Partial<ShikiState>) => void;
    setHighlighter: (highlighter: any) => void;
    setError: (error: string | null) => void;
    setHighlightedHtml: (html: string) => void;
    setLoading: (loading: boolean) => void;
};
