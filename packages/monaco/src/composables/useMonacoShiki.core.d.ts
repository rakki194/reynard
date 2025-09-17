/**
 * Core Monaco Shiki State Management
 *
 * Handles the fundamental state for Monaco-Shiki integration
 */
import type { MonacoShikiOptions, MonacoShikiState } from "../types";
export declare function createMonacoShikiState(options?: MonacoShikiOptions): {
    state: import("solid-js").Accessor<MonacoShikiState>;
    updateState: (updates: Partial<MonacoShikiState>) => void;
    setShikiEnabled: (enabled: boolean) => void;
    setCurrentTheme: (theme: string) => void;
    setCurrentLang: (lang: string) => void;
    setShikiContent: (content: string) => void;
    setMonacoTheme: (theme: string) => void;
};
