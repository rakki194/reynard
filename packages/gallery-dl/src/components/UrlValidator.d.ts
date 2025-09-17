/**
 * URL Validator Component
 *
 * URL validation and extractor detection component with real-time feedback
 * and comprehensive error handling.
 */
import { Component } from "solid-js";
import { GalleryService } from "../services/GalleryService";
import type { ValidationResult } from "../types";
export interface UrlValidatorProps {
    /** Initial URL value */
    initialUrl?: string;
    /** Callback when validation result changes */
    onValidation?: (result: ValidationResult) => void;
    /** Callback when URL changes */
    onUrlChange?: (url: string) => void;
    /** Service instance */
    service?: GalleryService;
    /** Whether to show extractor details */
    showExtractorDetails?: boolean;
    /** CSS class */
    class?: string;
}
export declare const UrlValidator: Component<UrlValidatorProps>;
