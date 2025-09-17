/**
 * Advanced Usage Example
 *
 * Demonstrates advanced features and custom integrations.
 */
import { ConfigurationPanel, ContentQualityDisplay, ProgressTracker, ScrapingJobManager, ScrapingStatistics, useContentQuality, useScrapingJobs, useScrapingStatistics, } from "reynard-scraping";
import { For, createSignal } from "solid-js";
export function AdvancedScrapingExample() {
    const [selectedJob, setSelectedJob] = createSignal(null);
    const [customContent, setCustomContent] = createSignal("");
    const [notifications, setNotifications] = createSignal([]);
    // Custom job management with notifications
    const { createJob, jobs, isLoading } = useScrapingJobs({
        onJobComplete: job => {
            setNotifications(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    message: `Job completed: ${job.url}`,
                    type: "success",
                },
            ]);
            setSelectedJob(job);
        },
        onJobError: (job, error) => {
            setNotifications(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    message: `Job failed: ${error}`,
                    type: "error",
                },
            ]);
        },
    });
    // Custom quality assessment
    const { assessQuality } = useContentQuality({
        onQualityUpdate: quality => {
            console.log("Quality assessment completed:", quality);
        },
    });
    // Statistics monitoring
    const { statistics } = useScrapingStatistics({
        autoRefresh: true,
        refreshInterval: 10000,
    });
    const handleCustomScrape = async (url, type) => {
        try {
            const job = await createJob({ url, type });
            setSelectedJob(job);
            setNotifications(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    message: `Started scraping: ${url}`,
                    type: "info",
                },
            ]);
        }
        catch (error) {
            setNotifications(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    message: `Failed to start job: ${error}`,
                    type: "error",
                },
            ]);
        }
    };
    const handleAssessCustomContent = async () => {
        if (!customContent().trim())
            return;
        try {
            await assessQuality(customContent());
            setNotifications(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    message: "Quality assessment completed",
                    type: "success",
                },
            ]);
        }
        catch (error) {
            setNotifications(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    message: `Quality assessment failed: ${error}`,
                    type: "error",
                },
            ]);
        }
    };
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    return (<div class="min-h-screen bg-gray-100">
      {/* Notifications */}
      <div class="fixed top-4 right-4 z-50 space-y-2">
        <For each={notifications()}>
          {notification => (<div class={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${notification.type === "success"
                ? "border-l-4 border-green-400"
                : notification.type === "error"
                    ? "border-l-4 border-red-400"
                    : "border-l-4 border-blue-400"}`}>
              <div class="p-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    {notification.type === "success" && (<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>)}
                    {notification.type === "error" && (<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                      </svg>)}
                    {notification.type === "info" && (<svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                      </svg>)}
                  </div>
                  <div class="ml-3 w-0 flex-1 pt-0.5">
                    <p class="text-sm font-medium text-gray-900">{notification.message}</p>
                  </div>
                  <div class="ml-4 flex-shrink-0 flex">
                    <button onClick={() => removeNotification(notification.id)} class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>)}
        </For>
      </div>

      {/* Header */}
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Advanced Scraping Example</h1>
              <p class="mt-2 text-gray-600">Custom integrations and advanced features demonstration</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-500">
                {statistics() && (<span>
                    Total Jobs: {statistics().totalJobs} | Success Rate:{" "}
                    {statistics().performanceMetrics.successRate.toFixed(1)}%
                  </span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Job Management */}
          <div class="space-y-6">
            <ScrapingJobManager onJobSelect={setSelectedJob} onJobComplete={job => {
            setSelectedJob(job);
            setNotifications(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    message: `Job completed: ${job.url}`,
                    type: "success",
                },
            ]);
        }}/>
          </div>

          {/* Right Column - Progress and Quality */}
          <div class="space-y-6">
            {selectedJob() && (<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Job Progress</h3>
                <ProgressTracker jobId={selectedJob().id}/>
              </div>)}

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Custom Content Quality Assessment</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Content to Assess</label>
                  <textarea value={customContent()} onInput={e => setCustomContent(e.currentTarget.value)} rows={4} class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter content to assess quality..."/>
                </div>
                <button onClick={handleAssessCustomContent} disabled={!customContent().trim()} class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  Assess Quality
                </button>
              </div>
              <div class="mt-4">
                <ContentQualityDisplay content={customContent()}/>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Statistics and Configuration */}
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ScrapingStatistics />
          </div>
          <div>
            <ConfigurationPanel />
          </div>
        </div>
      </div>
    </div>);
}
