/**
 * ScrapingJobManager Component
 *
 * Comprehensive job management interface for scraping operations.
 * Provides real-time job monitoring, creation, and control.
 */

import { createSignal } from "solid-js";
import { useScrapingJobs } from "../composables/useScrapingJobs";
import type { ScrapingJob, ScrapingType } from "../types";

export interface ScrapingJobManagerProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onJobSelect?: (job: ScrapingJob) => void;
  onJobComplete?: (job: ScrapingJob) => void;
  className?: string;
}

export function ScrapingJobManager(props: ScrapingJobManagerProps) {
  const { autoRefresh = true, refreshInterval = 5000, onJobSelect, onJobComplete, className = "" } = props;

  const [selectedJobId, setSelectedJobId] = createSignal<string | null>(null);
  const [newJobUrl, setNewJobUrl] = createSignal("");
  const [newJobType, setNewJobType] = createSignal<ScrapingType>("general");

  const { jobs, activeJobs, completedJobs, failedJobs, isLoading, error, createJob, cancelJob, retryJob, deleteJob } =
    useScrapingJobs({
      autoRefresh,
      refreshInterval,
      onJobComplete,
    });

  const handleCreateJob = async () => {
    if (!newJobUrl().trim()) return;

    try {
      const job = await createJob({
        url: newJobUrl().trim(),
        type: newJobType(),
      });

      setNewJobUrl("");
      setSelectedJobId(job.id);
      onJobSelect?.(job);
    } catch (err) {
      console.error("Failed to create job:", err);
    }
  };

  const handleJobSelect = (job: ScrapingJob) => {
    setSelectedJobId(job.id);
    onJobSelect?.(job);
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelJob(jobId);
    } catch (err) {
      console.error("Failed to cancel job:", err);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await retryJob(jobId);
    } catch (err) {
      console.error("Failed to retry job:", err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      if (selectedJobId() === jobId) {
        setSelectedJobId(null);
      }
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "running":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "cancelled":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div class={`scraping-job-manager ${className}`}>
      {/* Header */}
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Scraping Jobs</h2>
        <p class="text-gray-600">Manage and monitor your content scraping operations</p>
      </div>

      {/* Create New Job */}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Job</h3>
        <div class="flex gap-4">
          <div class="flex-1">
            <label for="job-url" class="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              id="job-url"
              type="url"
              value={newJobUrl()}
              onInput={e => setNewJobUrl(e.currentTarget.value)}
              placeholder="https://example.com/article"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="w-48">
            <label for="job-type" class="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              id="job-type"
              value={newJobType()}
              onChange={e => setNewJobType(e.currentTarget.value as ScrapingType)}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="general">General</option>
              <option value="hackernews">HackerNews</option>
              <option value="github">GitHub</option>
              <option value="stackoverflow">StackOverflow</option>
              <option value="twitter">Twitter</option>
              <option value="wikipedia">Wikipedia</option>
              <option value="wikifur">WikiFur</option>
              <option value="e621_wiki">E621 Wiki</option>
              <option value="arstechnica">Ars Technica</option>
              <option value="techcrunch">TechCrunch</option>
              <option value="wired">Wired</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              onClick={handleCreateJob}
              disabled={!newJobUrl().trim() || isLoading()}
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading() ? "Creating..." : "Create Job"}
            </button>
          </div>
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
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <div class="mt-2 text-sm text-red-700">{error()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Job Statistics */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
              <p class="text-2xl font-semibold text-gray-900">{jobs().length}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500">Active</p>
              <p class="text-2xl font-semibold text-gray-900">{activeJobs().length}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
              <p class="text-2xl font-semibold text-gray-900">{completedJobs().length}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
              <p class="text-2xl font-semibold text-gray-900">{failedJobs().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Job History</h3>
        </div>
        <div class="divide-y divide-gray-200">
          {jobs().length === 0 ? (
            <div class="px-6 py-12 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No jobs yet</h3>
              <p class="mt-1 text-sm text-gray-500">Get started by creating your first scraping job.</p>
            </div>
          ) : (
            jobs().map(job => (
              <div
                class={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                  selectedJobId() === job.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
                onClick={() => handleJobSelect(job)}
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-3">
                      <span
                        class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                      <span class="text-sm text-gray-500">{job.type}</span>
                    </div>
                    <div class="mt-1">
                      <p class="text-sm font-medium text-gray-900 truncate">{job.url}</p>
                      <p class="text-sm text-gray-500">
                        Created {formatDate(job.createdAt)}
                        {job.completedAt && ` • Completed ${formatDate(job.completedAt)}`}
                      </p>
                    </div>
                    {job.progress > 0 && (
                      <div class="mt-2">
                        <div class="flex items-center">
                          <div class="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span class="ml-2 text-sm text-gray-500">{job.progress}%</span>
                        </div>
                      </div>
                    )}
                    {job.error && (
                      <div class="mt-2">
                        <p class="text-sm text-red-600">{job.error}</p>
                      </div>
                    )}
                  </div>
                  <div class="flex items-center space-x-2">
                    {(job.status === "pending" || job.status === "running") && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleCancelJob(job.id);
                        }}
                        class="text-gray-400 hover:text-red-600"
                        title="Cancel job"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    {job.status === "failed" && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleRetryJob(job.id);
                        }}
                        class="text-gray-400 hover:text-blue-600"
                        title="Retry job"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteJob(job.id);
                      }}
                      class="text-gray-400 hover:text-red-600"
                      title="Delete job"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
