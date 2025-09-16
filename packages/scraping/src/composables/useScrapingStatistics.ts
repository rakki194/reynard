/**
 * useScrapingStatistics Composable
 * Provides scraping statistics and analytics
 */

import { createEffect, createSignal } from "solid-js";
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

export function useScrapingStatistics(options: UseScrapingStatisticsOptions = {}): UseScrapingStatisticsReturn {
  const { autoRefresh = true, refreshInterval = 30000 } = options;

  const [statistics, setStatistics] = createSignal<ScrapingStatistics | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  let refreshTimer: number | null = null;

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/scraping/statistics");
      const result = await response.json();

      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setError(result.error || "Failed to fetch statistics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryStats = (category: string) => {
    const stats = statistics();
    return stats?.topCategories.find(cat => cat.category === category);
  };

  const getPerformanceMetrics = () => {
    const stats = statistics();
    return stats?.performanceMetrics;
  };

  createEffect(() => {
    if (autoRefresh) {
      fetchStatistics();
      refreshTimer = setInterval(fetchStatistics, refreshInterval);
    }

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  });

  return {
    statistics: statistics(),
    isLoading,
    error,
    refreshStatistics: fetchStatistics,
    getCategoryStats,
    getPerformanceMetrics,
  };
}
