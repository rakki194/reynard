/**
 * Shiki Operations
 *
 * Handles the actual syntax highlighting operations
 */
import type { ShikiOptions } from "../types";
export interface ShikiOperations {
    initializeHighlighter: (options: ShikiOptions) => Promise<void>;
    highlightCode: (code: string, lang: string, theme: string) => Promise<string>;
    getAvailableThemes: () => string[];
    getAvailableLanguages: () => string[];
}
export declare function createShikiOperations(state: () => any, setHighlighter: (highlighter: any) => void, setError: (error: string | null) => void, setLoading: (loading: boolean) => void): ShikiOperations;
