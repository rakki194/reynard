/**
 * Auto Refresh Composable
 * 
 * Manages auto-refresh functionality for the dashboard
 */

import { createSignal, onCleanup } from "solid-js";

export function useAutoRefresh(refreshInterval?: number) {
  const [refreshTimer, setRefreshTimer] = createSignal<NodeJS.Timeout | null>(null);

  /**
   * 🦊 Start auto-refresh
   */
  const startAutoRefresh = (onRefresh: () => Promise<void>) => {
    if (refreshTimer()) {
      clearInterval(refreshTimer()!);
    }

    const timer = setInterval(async () => {
      try {
        await onRefresh();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, refreshInterval || 30000);

    setRefreshTimer(timer);
  };

  /**
   * 🦊 Stop auto-refresh
   */
  const stopAutoRefresh = () => {
    if (refreshTimer()) {
      clearInterval(refreshTimer()!);
      setRefreshTimer(null);
    }
  };

  // Cleanup on unmount
  onCleanup(() => {
    stopAutoRefresh();
  });

  return {
    startAutoRefresh,
    stopAutoRefresh,
  };
}
