/**
 * useShiki composable - Refactored
 *
 * Modular Shiki syntax highlighting with separated concerns:
 * - Core state management in useShiki.core
 * - Highlighting operations in useShiki.operations
 * - Main composable orchestrates the modules
 */
import type { ShikiOptions } from "../types";
export interface UseShikiReturn {
    state: () => any;
    highlightCode: (code: string, lang: string, theme: string) => Promise<string>;
    getAvailableThemes: () => string[];
    getAvailableLanguages: () => string[];
    isLoading: () => boolean;
    error: () => string | null;
}
export declare const useShiki: (options?: ShikiOptions) => UseShikiReturn;
