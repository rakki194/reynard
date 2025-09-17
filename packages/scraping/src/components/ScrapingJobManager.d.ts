/**
 * ScrapingJobManager Component
 *
 * Comprehensive job management interface for scraping operations.
 * Provides real-time job monitoring, creation, and control.
 */
import type { ScrapingJob } from "../types";
export interface ScrapingJobManagerProps {
    autoRefresh?: boolean;
    refreshInterval?: number;
    onJobSelect?: (job: ScrapingJob) => void;
    onJobComplete?: (job: ScrapingJob) => void;
    className?: string;
}
export declare function ScrapingJobManager(props: ScrapingJobManagerProps): any;
