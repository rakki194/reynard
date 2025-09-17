/**
 * Custom Monaco Editor themes that match Reynard theme colors
 * These themes provide better integration with Reynard's design system
 */
import type { editor } from "monaco-editor";
/**
 * Get custom Monaco theme definition for a Reynard theme
 * @param reynardTheme - The Reynard theme name
 * @returns Monaco theme definition or null if no custom theme exists
 */
export declare const getCustomMonacoTheme: (reynardTheme: string) => editor.IStandaloneThemeData | null;
/**
 * Register custom Monaco themes
 * @param monaco - Monaco editor instance
 * @param reynardTheme - Current Reynard theme
 */
export declare const registerCustomMonacoTheme: (monaco: typeof import("monaco-editor"), reynardTheme: string) => void;
/**
 * Get the appropriate Monaco theme name for a Reynard theme
 * @param reynardTheme - The Reynard theme name
 * @returns Monaco theme name (custom or fallback)
 */
export declare const getMonacoThemeName: (reynardTheme: string) => string;
