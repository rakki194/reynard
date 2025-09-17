/**
 * Image Modal Header Component
 *
 * Header with image info and control buttons
 */
import { Component } from "solid-js";
export interface ImageModalHeaderProps {
    imagePath: string;
    imageId: string;
    imageDimensions?: {
        width: number;
        height: number;
    };
    imageSize?: number;
    imageFormat?: string;
    showMetadata: boolean;
    showEmbeddingInfo: boolean;
    onToggleMetadata: () => void;
    onToggleEmbeddingInfo: () => void;
    onCopyPath: () => void;
    onDownload: () => void;
}
export declare const ImageModalHeader: Component<ImageModalHeaderProps>;
