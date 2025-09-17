/**
 * Theme Card Component
 * Individual theme preview card with interactive preview
 */
import { Component } from "solid-js";
import { type ThemeConfig } from "reynard-themes";
import "./theme-showcase.css";
interface ThemeCardProps {
    themeConfig: ThemeConfig;
    isActive: boolean;
    isPreviewing: boolean;
    onThemeChange: (themeName: string) => void;
    onPreviewTheme: (themeName: string) => void;
    onStopPreview: () => void;
}
export declare const ThemeCard: Component<ThemeCardProps>;
export {};
