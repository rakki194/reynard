/**
 * ScrapingDashboard Component
 *
 * Complete scraping management dashboard with all features integrated.
 */

import { For, createSignal } from "solid-js";
import type { ScrapingJob } from "../types";
import { ConfigurationPanel } from "./ConfigurationPanel";
import { ContentQualityDisplay } from "./ContentQualityDisplay";
import { GalleryDownloadManager } from "./GalleryDownloadManager";
import { ProgressTracker } from "./ProgressTracker";
import { ScrapingJobManager } from "./ScrapingJobManager";
import { ScrapingStatistics } from "./ScrapingStatistics";

export interface ScrapingDashboardProps {
  className?: string;
}

export function ScrapingDashboard(props: ScrapingDashboardProps) {
  const { className = "" } = props;

  const [activeTab, setActiveTab] = createSignal<"jobs" | "progress" | "quality" | "statistics" | "config" | "gallery">(
    "jobs"
  );
  const [selectedJob, setSelectedJob] = createSignal<ScrapingJob | null>(null);
  const [selectedContent, setSelectedContent] = createSignal<string>("");

  const tabs = [
    { id: "jobs", label: "Jobs", icon: "📋" },
    { id: "progress", label: "Progress", icon: "📊" },
    { id: "quality", label: "Quality", icon: "⭐" },
    { id: "gallery", label: "Gallery Downloads", icon: "🖼️" },
    { id: "statistics", label: "Statistics", icon: "📈" },
    { id: "config", label: "Configuration", icon: "⚙️" },
  ] as const;

  const handleJobSelect = (job: ScrapingJob) => {
    setSelectedJob(job);
    if (activeTab() === "progress" || activeTab() === "quality") {
      // Keep current tab
    } else {
      setActiveTab("progress");
    }
  };

  const handleJobComplete = (job: ScrapingJob) => {
    setSelectedJob(job);
    // Extract content from job results for quality assessment
    if (job.results && job.results.length > 0) {
      const content = job.results.map(result => result.content).join("\n\n");
      setSelectedContent(content);
    }
  };

  return (
    <div class={`scraping-dashboard ${className}`}>
      {/* Header */}
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Scraping Dashboard</h1>
              <p class="text-gray-600">Comprehensive content extraction and management system</p>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-green-500 rounded-full" />
              <span class="text-sm text-gray-600">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div class="bg-white border-b border-gray-200">
        <div class="px-6">
          <nav class="flex space-x-8">
            <For each={tabs}>
              {tab => (
                <button
                  onClick={() => setActiveTab(tab.id)}
                  class={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab() === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span class="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              )}
            </For>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div class="flex-1 overflow-auto">
        <div class="p-6">
          {/* Jobs Tab */}
          {activeTab() === "jobs" && (
            <ScrapingJobManager onJobSelect={handleJobSelect} onJobComplete={handleJobComplete} />
          )}

          {/* Progress Tab */}
          {activeTab() === "progress" && (
            <div class="space-y-6">
              {selectedJob() ? (
                <>
                  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Job Progress</h3>
                    <p class="text-sm text-gray-600 mb-4">
                      Monitoring progress for: <span class="font-medium">{selectedJob()!.url}</span>
                    </p>
                    <ProgressTracker jobId={selectedJob()!.id} />
                  </div>
                </>
              ) : (
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                  <div class="text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No job selected</h3>
                    <p class="mt-1 text-sm text-gray-500">Select a job from the Jobs tab to monitor its progress.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quality Tab */}
          {activeTab() === "quality" && (
            <div class="space-y-6">
              <ContentQualityDisplay
                content={selectedContent()}
                quality={selectedJob()?.results?.[0]?.quality}
                onQualityUpdate={quality => {
                  console.log("Quality updated:", quality);
                }}
              />
            </div>
          )}

          {/* Gallery Downloads Tab */}
          {activeTab() === "gallery" && (
            <div class="space-y-6">
              <GalleryDownloadManager
                onDownloadComplete={download => {
                  console.log("Gallery download completed:", download);
                }}
                onDownloadError={(download, error) => {
                  console.error("Gallery download error:", error, download);
                }}
              />
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab() === "statistics" && <ScrapingStatistics />}

          {/* Configuration Tab */}
          {activeTab() === "config" && (
            <ConfigurationPanel
              onConfigUpdate={configs => {
                console.log("Configuration updated:", configs);
              }}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div class="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">Reynard Scraping System v1.0.0</div>
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>🦊 Built with strategic precision</span>
            <span>🦦 Tested with otter thoroughness</span>
            <span>🐺 Secured with wolf determination</span>
          </div>
        </div>
      </div>
    </div>
  );
}
