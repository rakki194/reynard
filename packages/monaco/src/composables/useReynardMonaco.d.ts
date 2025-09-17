/**
 * Monaco Editor integration with Reynard themes
 * Provides seamless theme synchronization between Reynard and Monaco Editor
 */
type ThemeName = "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut" | "high-contrast-black" | "high-contrast-inverse";
export interface ReynardMonacoOptions {
    /** The current Reynard theme (can be a function for reactivity) */
    reynardTheme: ThemeName | (() => ThemeName);
    /** Language for syntax highlighting (can be a function for reactivity) */
    lang?: string | (() => string);
    /** Whether to enable Shiki syntax highlighting */
    enableShikiHighlighting?: boolean;
    /** Additional Monaco editor options */
    monacoOptions?: any;
}
export interface ReynardMonacoState {
    /** Current Monaco theme name */
    monacoTheme: string;
    /** Current Shiki theme name */
    shikiTheme: string;
    /** Whether the current theme is dark */
    isDark: boolean;
    /** Whether Shiki highlighting is enabled */
    isShikiEnabled: boolean;
}
/**
 * Hook for Monaco Editor with Reynard theme integration
 * Automatically syncs Monaco Editor theme with the current Reynard theme
 */
export declare const useReynardMonaco: (options: ReynardMonacoOptions) => {
    state: import("solid-js").Accessor<ReynardMonacoState>;
    monacoTheme: () => string;
    shikiTheme: () => string;
    isDark: () => boolean;
    isShikiEnabled: () => boolean;
    monacoShiki: import("./useMonacoShiki").UseMonacoShikiReturn;
    getMonacoOptions: (additionalOptions?: any) => any;
    registerThemes: (monaco: any) => void;
    getMonacoThemeFromReynard: (reynardTheme: "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut" | "high-contrast-black" | "high-contrast-inverse") => string;
    getShikiThemeFromReynard: (reynardTheme: "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut" | "high-contrast-black" | "high-contrast-inverse") => string;
    isReynardThemeDark: (reynardTheme: "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut" | "high-contrast-black" | "high-contrast-inverse") => boolean;
};
export {};
