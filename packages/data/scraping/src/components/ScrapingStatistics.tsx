/**
 * ScrapingStatistics Component
 *
 * Comprehensive analytics and performance metrics for scraping operations.
 */
import { For, createSignal } from "solid-js";
import { useScrapingStatistics } from "../composables/useScrapingStatistics";
export function ScrapingStatistics(props) {
  const { autoRefresh = true, refreshInterval = 30000, className = "" } = props;
  const [selectedTimeRange, setSelectedTimeRange] = createSignal("24h");
  const { statistics, isLoading, error } = useScrapingStatistics({
    autoRefresh,
    refreshInterval,
  });
  const formatNumber = num => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  const formatBytes = bytes => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };
  const formatDuration = ms => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };
  const getSuccessRateColor = rate => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-blue-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  const getSuccessRateBgColor = rate => {
    if (rate >= 90) return "bg-green-100";
    if (rate >= 75) return "bg-blue-100";
    if (rate >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };
  return (
    <div class={`scraping-statistics ${className}`}>
      {/* Header */}
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Scraping Statistics</h2>
          <p class="text-gray-600">Performance metrics and analytics for your scraping operations</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">Time Range:</span>
          <select
            value={selectedTimeRange()}
            onChange={e => setSelectedTimeRange(e.currentTarget.value)}
            class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error() && (
        <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error Loading Statistics</h3>
              <div class="mt-2 text-sm text-red-700">{error()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading() && (
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-1/4 mb-4" />
            <div class="space-y-3">
              <div class="h-3 bg-gray-200 rounded" />
              <div class="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      )}

      {/* Statistics Display */}
      {statistics() && (
        <>
          {/* Key Metrics */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-500">Total Jobs</p>
                  <p class="text-2xl font-semibold text-gray-900">{formatNumber(statistics().totalJobs)}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-500">Completed</p>
                  <p class="text-2xl font-semibold text-gray-900">{formatNumber(statistics().completedJobs)}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-500">Failed</p>
                  <p class="text-2xl font-semibold text-gray-900">{formatNumber(statistics().failedJobs)}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div
                    class={`w-8 h-8 rounded-full flex items-center justify-center ${getSuccessRateBgColor(statistics().performanceMetrics.successRate)}`}
                  >
                    <svg
                      class={`w-4 h-4 ${getSuccessRateColor(statistics().performanceMetrics.successRate)}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-500">Success Rate</p>
                  <p
                    class={`text-2xl font-semibold ${getSuccessRateColor(statistics().performanceMetrics.successRate)}`}
                  >
                    {statistics().performanceMetrics.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Average Processing Time</span>
                  <span class="text-sm font-medium text-gray-900">
                    {formatDuration(statistics().performanceMetrics.averageProcessingTime)}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Average Quality Score</span>
                  <span class="text-sm font-medium text-gray-900">{statistics().averageQuality.toFixed(1)}/100</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Throughput</span>
                  <span class="text-sm font-medium text-gray-900">
                    {statistics().performanceMetrics.throughput.toFixed(1)} items/hour
                  </span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Data Statistics</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Total Results</span>
                  <span class="text-sm font-medium text-gray-900">{formatNumber(statistics().totalResults)}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Data Extracted</span>
                  <span class="text-sm font-medium text-gray-900">{formatBytes(statistics().dataExtractedBytes)}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Most Active Scraper</span>
                  <span class="text-sm font-medium text-gray-900">{statistics().mostActiveScraper}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Categories */}
          {statistics().topCategories.length > 0 && (
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
              <div class="space-y-3">
                <For each={statistics().topCategories}>
                  {category => (
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <span class="text-sm font-medium text-gray-900 capitalize">{category.category}</span>
                        <span class="text-sm text-gray-500">{category.count} items</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <div class="w-20 bg-gray-200 rounded-full h-2">
                          <div class="bg-blue-600 h-2 rounded-full" style={{ width: `${category.percentage}%` }} />
                        </div>
                        <span class="text-sm text-gray-500 w-12 text-right">{category.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
