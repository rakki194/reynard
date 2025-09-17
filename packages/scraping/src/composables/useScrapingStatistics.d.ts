/**
 * useScrapingStatistics Composable
 * Provides scraping statistics and analytics
 */
import type { ScrapingStatistics } from "../types";
export interface UseScrapingStatisticsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
}
export interface UseScrapingStatisticsReturn {
    statistics: ScrapingStatistics | null;
    isLoading: boolean;
    error: string | null;
    refreshStatistics: () => Promise<void>;
    getCategoryStats: (category: string) => any;
    getPerformanceMetrics: () => any;
}
export declare function useScrapingStatistics(options?: UseScrapingStatisticsOptions): UseScrapingStatisticsReturn;
