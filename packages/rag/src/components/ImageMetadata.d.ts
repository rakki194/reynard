/**
 * Image Metadata Component
 *
 * Displays image metadata in a collapsible card
 */
import { Component } from "solid-js";
export interface ImageMetadataProps {
    metadata?: Record<string, unknown>;
    isVisible: boolean;
    onToggle: () => void;
}
export declare const ImageMetadata: Component<ImageMetadataProps>;
