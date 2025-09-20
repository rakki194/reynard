/**
 * Basic Usage Example
 *
 * Demonstrates how to use the Reynard Scraping package in a simple application.
 */

import { ScrapingDashboard } from "reynard-scraping";
import { createSignal } from "solid-js";

export function BasicScrapingExample() {
  const [isFullscreen, setIsFullscreen] = createSignal(false);

  return (
    <div class="min-h-screen bg-gray-100">
      {/* Header */}
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Reynard Scraping Example</h1>
              <p class="mt-2 text-gray-600">A comprehensive example of the scraping system in action</p>
            </div>
            <div class="flex items-center space-x-4">
              <button
                onClick={() => setIsFullscreen(!isFullscreen())}
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isFullscreen() ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`${isFullscreen() ? "fixed inset-0 z-50 bg-white" : ""}`}>
          <ScrapingDashboard />
        </div>
      </div>

      {/* Quick Start Guide */}
      {!isFullscreen() && (
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Start Guide</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <h3 class="font-medium text-gray-900">Create a Job</h3>
                </div>
                <p class="text-sm text-gray-600">
                  Go to the Jobs tab and enter a URL to scrape. Choose the appropriate scraper type for best results.
                </p>
              </div>
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <h3 class="font-medium text-gray-900">Monitor Progress</h3>
                </div>
                <p class="text-sm text-gray-600">
                  Watch real-time progress updates as the scraper extracts content from the target URL.
                </p>
              </div>
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <h3 class="font-medium text-gray-900">Review Quality</h3>
                </div>
                <p class="text-sm text-gray-600">
                  Check the quality assessment of extracted content and view detailed statistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
