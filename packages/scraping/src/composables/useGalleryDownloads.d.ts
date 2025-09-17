/**
 * useGalleryDownloads Composable
 * Manages gallery-dl download operations
 */
import type { DownloadProgress, GalleryConfig, GalleryDownloadJob } from "../types";
export interface UseGalleryDownloadsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    onDownloadComplete?: (job: GalleryDownloadJob) => void;
    onDownloadError?: (job: GalleryDownloadJob, error: string) => void;
}
export interface UseGalleryDownloadsReturn {
    downloads: GalleryDownloadJob[];
    activeDownloads: GalleryDownloadJob[];
    completedDownloads: GalleryDownloadJob[];
    failedDownloads: GalleryDownloadJob[];
    isLoading: boolean;
    error: string | null;
    startDownload: (url: string, config?: Partial<GalleryConfig>) => Promise<GalleryDownloadJob>;
    cancelDownload: (jobId: string) => Promise<void>;
    pauseDownload: (jobId: string) => Promise<void>;
    resumeDownload: (jobId: string) => Promise<void>;
    deleteDownload: (jobId: string) => Promise<void>;
    getDownload: (jobId: string) => GalleryDownloadJob | undefined;
    getDownloadProgress: (jobId: string) => DownloadProgress | undefined;
    refreshDownloads: () => Promise<void>;
}
export declare function useGalleryDownloads(options?: UseGalleryDownloadsOptions): UseGalleryDownloadsReturn;
