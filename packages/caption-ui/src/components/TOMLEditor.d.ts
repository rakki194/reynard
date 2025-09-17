/**
 * TOML Editor Component
 *
 * A specialized editor for TOML format with syntax highlighting,
 * validation, and Monaco integration. Built for the Reynard caption system.
 *
 * Features:
 * - Real-time TOML validation
 * - Syntax highlighting for TOML format
 * - Error reporting and line numbers
 * - Keyboard shortcuts for formatting
 * - Integration with Reynard's Monaco package
 */
import { Component } from "solid-js";
interface ValidationMarker {
    startLineNumber: number;
    message: string;
}
export interface TOMLEditorProps {
    /** Initial TOML content */
    content: string;
    /** Callback when content changes */
    onChange: (content: string) => void;
    /** Callback when validation status changes */
    onValidationChange?: (isValid: boolean, errors: ValidationMarker[]) => void;
    /** Editor height */
    height?: string;
    /** Editor width */
    width?: string;
    /** Whether the editor is read-only */
    readOnly?: boolean;
    /** Custom theme */
    theme?: "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut" | "high-contrast-black" | "high-contrast-inverse";
    /** Additional CSS class */
    className?: string;
}
export declare const TOMLEditor: Component<TOMLEditorProps>;
export {};
