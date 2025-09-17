/**
 * useScrapingJobs Composable
 * Manages scraping job state and operations
 */
import type { ScrapingApiRequest, ScrapingJob } from "../types";
export interface UseScrapingJobsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    onJobUpdate?: (job: ScrapingJob) => void;
    onJobComplete?: (job: ScrapingJob) => void;
    onJobError?: (job: ScrapingJob, error: string) => void;
}
export interface UseScrapingJobsReturn {
    jobs: ScrapingJob[];
    activeJobs: ScrapingJob[];
    completedJobs: ScrapingJob[];
    failedJobs: ScrapingJob[];
    isLoading: boolean;
    error: string | null;
    createJob: (request: ScrapingApiRequest) => Promise<ScrapingJob>;
    cancelJob: (jobId: string) => Promise<void>;
    retryJob: (jobId: string) => Promise<void>;
    deleteJob: (jobId: string) => Promise<void>;
    refreshJobs: () => Promise<void>;
    getJob: (jobId: string) => ScrapingJob | undefined;
}
export declare function useScrapingJobs(options?: UseScrapingJobsOptions): UseScrapingJobsReturn;
