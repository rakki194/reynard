/**
 * Image Display Component
 *
 * Handles image loading, error states, and zoom controls
 */
import { Component } from "solid-js";
export interface ImageDisplayProps {
    imagePath: string;
    previewPath?: string;
    imageId: string;
    onRetry?: () => void;
}
export declare const ImageDisplay: Component<ImageDisplayProps>;
