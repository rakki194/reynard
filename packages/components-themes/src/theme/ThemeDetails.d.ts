/**
 * Theme Details Component
 * Current theme info and color details toggle
 */
import { Component } from "solid-js";
import { type ThemeColor } from "./theme-utils";
interface ThemeDetailsProps {
    currentThemeName: string;
    showColorDetails: boolean;
    themeColors: ThemeColor[];
    onToggleColorDetails: () => void;
    onCopyColor: (color: string) => void;
}
export declare const ThemeDetails: Component<ThemeDetailsProps>;
export {};
