/**
 * Theme Showcase Hook
 * Custom hook for managing theme showcase state and logic
 */

import { createSignal, createMemo } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";
import { useNotifications } from "reynard-core";
import { getCurrentTheme, getThemeColors } from "./theme-utils";

export const useThemeShowcase = () => {
  // Use createMemo to defer context access and handle errors gracefully
  const themeContext = createMemo(() => {
    try {
      return useTheme();
    } catch (error) {
      console.error("useThemeShowcase: Theme context not available", error);
      return {
        theme: "light" as ThemeName,
        setTheme: (theme: ThemeName) => {
          console.warn("Theme context not available, cannot set theme:", theme);
        },
        getTagStyle: () => ({}),
        isDark: false,
        isHighContrast: false,
      };
    }
  });

  const notifications = createMemo(() => {
    try {
      return useNotifications();
    } catch (error) {
      console.error("useThemeShowcase: Notifications context not available", error);
      return {
        notify: (message: string, type?: string) => {
          console.warn("Notifications context not available:", message, type);
        },
      };
    }
  });

  const notify = createMemo(() => notifications().notify);
  const [previewTheme, setPreviewTheme] = createSignal<string | null>(null);
  const [showColorDetails, setShowColorDetails] = createSignal(false);

  const availableThemes = getAvailableThemes();

  const handleThemeChange = (themeName: string) => {
    themeContext().setTheme(themeName as ThemeName);
    notify()(`Switched to ${themeName} theme!`, "success");
  };

  const handlePreviewTheme = (themeName: string) => {
    setPreviewTheme(themeName);
  };

  const handleStopPreview = () => {
    setPreviewTheme(null);
  };

  const copyColorValue = (color: string) => {
    navigator.clipboard.writeText(color);
    notify()(`Color ${color} copied to clipboard!`, "info");
  };

  const currentTheme = () => getCurrentTheme(previewTheme(), themeContext().theme);
  const currentThemeConfig = () => availableThemes.find(t => t.name === currentTheme());

  return {
    availableThemes,
    previewTheme,
    showColorDetails,
    setShowColorDetails,
    handleThemeChange,
    handlePreviewTheme,
    handleStopPreview,
    copyColorValue,
    currentTheme,
    currentThemeConfig,
    themeContext,
  };
};
