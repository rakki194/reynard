/**
 * Theme Context Hook
 * Provides safe access to theme context with fallback handling
 */
import { createMemo } from "solid-js";
import { useTheme } from "reynard-themes";
export const useThemeContext = () => {
    return createMemo(() => {
        try {
            return useTheme();
        }
        catch (error) {
            console.error("useThemeContext: Theme context not available", error);
            return {
                theme: "light",
                setTheme: (theme) => {
                    console.warn("Theme context not available, cannot set theme:", theme);
                },
                getTagStyle: () => ({}),
                isDark: false,
                isHighContrast: false,
            };
        }
    });
};
