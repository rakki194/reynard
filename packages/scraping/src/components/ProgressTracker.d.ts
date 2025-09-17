/**
 * ProgressTracker Component
 *
 * Real-time progress tracking for scraping jobs with detailed statistics.
 */
import type { ProgressUpdate } from "../composables/useScrapingProgress";
export interface ProgressTrackerProps {
    jobId: string;
    onProgressUpdate?: (progress: ProgressUpdate) => void;
    className?: string;
}
export declare function ProgressTracker(props: ProgressTrackerProps): any;
