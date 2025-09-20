/**
 * ProgressTracker Component
 *
 * Real-time progress tracking for scraping jobs with detailed statistics.
 */
import { createSignal } from "solid-js";
import { useScrapingProgress } from "../composables/useScrapingProgress";
export function ProgressTracker(props) {
    const { jobId, onProgressUpdate, className = "" } = props;
    const [isExpanded, setIsExpanded] = createSignal(false);
    const { progress, isConnected, error } = useScrapingProgress({
        onProgressUpdate,
    });
    const currentProgress = () => progress()[jobId];
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };
    const formatSpeed = (bytesPerSecond) => {
        return `${formatBytes(bytesPerSecond)}/s`;
    };
    const formatTime = (seconds) => {
        if (seconds < 60)
            return `${Math.round(seconds)}s`;
        if (seconds < 3600)
            return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h`;
    };
    const getProgressColor = (progress) => {
        if (progress < 30)
            return "bg-red-500";
        if (progress < 70)
            return "bg-yellow-500";
        return "bg-green-500";
    };
    const getConnectionStatus = () => {
        if (error())
            return { color: "text-red-600", text: "Error", icon: "❌" };
        if (isConnected())
            return { color: "text-green-600", text: "Connected", icon: "🟢" };
        return { color: "text-yellow-600", text: "Connecting...", icon: "🟡" };
    };
    return (<div class={`progress-tracker ${className}`}>
      {/* Connection Status */}
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700">Connection Status:</span>
          <span class={`text-sm font-medium ${getConnectionStatus().color}`}>
            {getConnectionStatus().icon} {getConnectionStatus().text}
          </span>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded())} class="text-sm text-blue-600 hover:text-blue-800">
          {isExpanded() ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Error Display */}
      {error() && (<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Connection Error</h3>
              <div class="mt-2 text-sm text-red-700">{error()}</div>
            </div>
          </div>
        </div>)}

      {/* Progress Display */}
      {currentProgress() ? (<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Main Progress Bar */}
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Overall Progress</span>
              <span class="text-sm font-medium text-gray-900">{currentProgress().progress}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class={`h-3 rounded-full transition-all duration-500 ${getProgressColor(currentProgress().progress)}`} style={{ width: `${currentProgress().progress}%` }}/>
            </div>
          </div>

          {/* Current Status */}
          <div class="mb-6">
            <div class="flex items-center space-x-2 mb-2">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-medium text-gray-700">Current Status</span>
            </div>
            <p class="text-sm text-gray-900">{currentProgress().message || "Processing..."}</p>
          </div>

          {/* Current URL */}
          {currentProgress().currentUrl && (<div class="mb-6">
              <div class="flex items-center space-x-2 mb-2">
                <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-medium text-gray-700">Current URL</span>
              </div>
              <p class="text-sm text-gray-900 break-all">{currentProgress().currentUrl}</p>
            </div>)}

          {/* Expanded Details */}
          {isExpanded() && (<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Items Progress */}
              <div>
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Items</span>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Extracted:</span>
                    <span class="font-medium text-gray-900">{currentProgress().extractedItems}</span>
                  </div>
                  {currentProgress().totalItems && (<div class="flex justify-between text-sm">
                      <span class="text-gray-600">Total:</span>
                      <span class="font-medium text-gray-900">{currentProgress().totalItems}</span>
                    </div>)}
                </div>
              </div>

              {/* Speed and Time */}
              <div>
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.414L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Performance</span>
                </div>
                <div class="space-y-2">
                  {currentProgress().speed && (<div class="flex justify-between text-sm">
                      <span class="text-gray-600">Speed:</span>
                      <span class="font-medium text-gray-900">{formatSpeed(currentProgress().speed)}</span>
                    </div>)}
                  {currentProgress().estimatedTime && (<div class="flex justify-between text-sm">
                      <span class="text-gray-600">ETA:</span>
                      <span class="font-medium text-gray-900">{formatTime(currentProgress().estimatedTime)}</span>
                    </div>)}
                </div>
              </div>
            </div>)}

          {/* Last Updated */}
          <div class="mt-6 pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500">
              Last updated:{" "}
              {new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(currentProgress().timestamp)}
            </p>
          </div>
        </div>) : (<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No progress data</h3>
            <p class="mt-1 text-sm text-gray-500">
              {isConnected() ? "Waiting for job to start..." : "Connecting to progress stream..."}
            </p>
          </div>
        </div>)}
    </div>);
}
