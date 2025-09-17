/**
 * Video File Card Component for Reynard Caption System
 *
 * Displays individual video file information with thumbnail and metadata.
 */
import { Component } from "solid-js";
import { VideoFile } from "../types";
export interface VideoFileCardProps {
    file: VideoFile;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: () => void;
    showMetadata?: boolean;
}
export declare const VideoFileCard: Component<VideoFileCardProps>;
