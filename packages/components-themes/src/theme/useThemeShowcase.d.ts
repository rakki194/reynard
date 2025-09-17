/**
 * Theme Showcase Hook
 * Custom hook for managing theme showcase state and logic
 */
import { type ThemeName } from "reynard-themes";
export declare const useThemeShowcase: () => {
    availableThemes: import("reynard-themes").ThemeConfig[];
    previewTheme: import("solid-js").Accessor<string | null>;
    showColorDetails: import("solid-js").Accessor<boolean>;
    setShowColorDetails: import("solid-js").Setter<boolean>;
    handleThemeChange: (themeName: string) => void;
    handlePreviewTheme: (themeName: string) => void;
    handleStopPreview: () => void;
    copyColorValue: (color: string) => void;
    currentTheme: () => string;
    currentThemeConfig: () => import("reynard-themes").ThemeConfig | undefined;
    themeContext: import("solid-js").Accessor<import("reynard-themes").ThemeContext | {
        theme: ThemeName;
        setTheme: (theme: ThemeName) => void;
        getTagStyle: () => {};
        isDark: boolean;
        isHighContrast: boolean;
    }>;
};
