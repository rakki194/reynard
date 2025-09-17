/**
 * Theme Context Hook
 * Provides safe access to theme context with fallback handling
 */
export interface ThemeContextFallback {
    theme: string;
    setTheme: (theme: string) => void;
    getTagStyle: () => Record<string, any>;
    isDark: boolean;
    isHighContrast: boolean;
}
export declare const useThemeContext: () => import("solid-js").Accessor<import("reynard-themes").ThemeContext | ThemeContextFallback>;
