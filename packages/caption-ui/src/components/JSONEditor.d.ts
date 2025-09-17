/**
 * JSON Editor Component
 *
 * A generic JSON editor with syntax highlighting, validation, and Monaco integration.
 * Built for the Reynard caption system but can be used for any JSON editing needs.
 *
 * Features:
 * - Real-time JSON validation with Monaco
 * - Syntax highlighting for JSON format
 * - Error reporting and line numbers
 * - Keyboard shortcuts for formatting
 * - Integration with Reynard's Monaco package
 */
import { Component } from "solid-js";
interface ValidationMarker {
    startLineNumber: number;
    message: string;
}
export interface JSONEditorProps {
    content: string;
    onChange: (content: string) => void;
    onValidationChange?: (isValid: boolean, markers: ValidationMarker[]) => void;
    title?: string;
    height?: string;
    width?: string;
    theme?: "light" | "dark";
    readOnly?: boolean;
    placeholder?: string;
}
export declare const JSONEditor: Component<JSONEditorProps>;
export {};
