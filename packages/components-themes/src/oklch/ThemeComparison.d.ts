/**
 * Theme Comparison Component
 * Demonstrates theme-aware color generation
 */
import { Component } from "solid-js";
interface TagColorData {
    theme: string;
    color: any;
}
interface TagData {
    tag: string;
    colors: TagColorData[];
}
interface ThemeComparisonProps {
    availableThemes: string[];
    selectedTheme: string;
    themeTagColors: TagData[];
    onThemeChange: (theme: string) => void;
}
export declare const ThemeComparison: Component<ThemeComparisonProps>;
export {};
