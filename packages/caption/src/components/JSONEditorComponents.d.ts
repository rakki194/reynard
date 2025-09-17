/**
 * JSON Editor Sub-components
 *
 * Sub-components for the JSON Editor to keep the main component
 * under the 140-line limit.
 */
import { Component } from "solid-js";
interface ValidationMarker {
    startLineNumber: number;
    message: string;
}
export declare const EditorHeader: Component<{
    title?: string;
    isValid: () => boolean;
    validationMarkers: () => ValidationMarker[];
    onFormat: () => void;
}>;
export declare const ErrorDetails: Component<{
    validationMarkers: () => ValidationMarker[];
}>;
export {};
