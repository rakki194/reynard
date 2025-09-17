/**
 * useScrapingProgress Composable
 * Tracks and manages scraping progress
 */
export interface ProgressUpdate {
    jobId: string;
    progress: number;
    currentFile?: string;
    totalFiles?: number;
    downloadedFiles?: number;
    speed?: number;
    estimatedTime?: number;
    message?: string;
}
export interface UseScrapingProgressOptions {
    onProgressUpdate?: (update: ProgressUpdate) => void;
    onJobComplete?: (jobId: string) => void;
    onJobError?: (jobId: string, error: string) => void;
}
export interface UseScrapingProgressReturn {
    progress: Record<string, ProgressUpdate>;
    getProgress: (jobId: string) => ProgressUpdate | undefined;
    getOverallProgress: () => number;
    isJobActive: (jobId: string) => boolean;
    getActiveJobsCount: () => number;
}
export declare function useScrapingProgress(options?: UseScrapingProgressOptions): UseScrapingProgressReturn;
