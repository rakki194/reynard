/**
 * useMonacoShiki composable - Refactored
 *
 * Modular Monaco-Shiki integration with separated concerns:
 * - Core state management in useMonacoShiki.core
 * - Integration operations in useMonacoShiki.operations
 * - Main composable orchestrates the modules
 */
import type { MonacoShikiOptions } from "../types";
export interface UseMonacoShikiReturn {
    state: () => any;
    highlightCode: (code: string, lang?: string, theme?: string) => Promise<string>;
    syncThemes: (monacoTheme: string, shikiTheme: string) => void;
    updateLanguage: (lang: string) => void;
    updateTheme: (theme: string) => void;
    toggleShiki: () => void;
    isShikiEnabled: () => boolean;
    currentTheme: () => string;
    currentLang: () => string;
}
export declare const useMonacoShiki: (options?: MonacoShikiOptions) => UseMonacoShikiReturn;
