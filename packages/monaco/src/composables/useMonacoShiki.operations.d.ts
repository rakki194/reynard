/**
 * Monaco Shiki Operations
 *
 * Handles the integration logic between Monaco and Shiki
 */
import type { MonacoShikiOptions } from "../types";
import type { MonacoShikiState } from "../types";
export interface MonacoShikiOperations {
    highlightCode: (code: string, lang: string, theme: string) => Promise<string>;
    syncThemes: (monacoTheme: string, shikiTheme: string) => void;
    updateLanguage: (lang: string) => void;
    updateTheme: (theme: string) => void;
    toggleShiki: () => void;
}
export declare function createMonacoShikiOperations(state: () => MonacoShikiState, updateState: (updates: Partial<MonacoShikiState>) => void, _options?: MonacoShikiOptions): MonacoShikiOperations;
