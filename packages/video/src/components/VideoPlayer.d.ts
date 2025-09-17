/**
 * Video Player Component for Reynard Caption System
 *
 * Modal video player with custom controls and metadata display.
 */
import { Component } from "solid-js";
import { VideoFile } from "../types";
export interface VideoPlayerProps {
    file: VideoFile;
    onClose: () => void;
}
export declare const VideoPlayer: Component<VideoPlayerProps>;
