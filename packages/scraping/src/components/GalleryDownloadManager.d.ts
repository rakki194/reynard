import { Component } from "solid-js";
import type { GalleryDownloadJob } from "../types";
export interface GalleryDownloadManagerProps {
    onDownloadComplete?: (download: GalleryDownloadJob) => void;
    onDownloadError?: (download: GalleryDownloadJob, error: string) => void;
}
export declare const GalleryDownloadManager: Component<GalleryDownloadManagerProps>;
export type GalleryDownloadManagerProps = {
    onDownloadComplete?: (download: GalleryDownloadJob) => void;
    onDownloadError?: (download: GalleryDownloadJob, error: string) => void;
};
