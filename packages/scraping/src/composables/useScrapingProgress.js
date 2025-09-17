/**
 * useScrapingProgress Composable
 * Tracks and manages scraping progress
 */
import { createEffect, createSignal, onCleanup } from "solid-js";
export function useScrapingProgress(options = {}) {
    const { onProgressUpdate, onJobComplete, onJobError } = options;
    const [progress, setProgress] = createSignal({});
    let ws = null;
    const connectWebSocket = () => {
        try {
            ws = new WebSocket(`ws://localhost:8000/api/scraping/events`);
            ws.onmessage = event => {
                try {
                    const scrapingEvent = JSON.parse(event.data);
                    handleScrapingEvent(scrapingEvent);
                }
                catch (err) {
                    console.error("Failed to parse scraping event:", err);
                }
            };
            ws.onclose = () => {
                setTimeout(connectWebSocket, 5000);
            };
            ws.onerror = err => {
                console.error("WebSocket error:", err);
            };
        }
        catch (err) {
            console.error("Failed to connect to WebSocket:", err);
        }
    };
    const handleScrapingEvent = (event) => {
        switch (event.type) {
            case ScrapingEventType.JOB_STARTED:
                setProgress(prev => ({
                    ...prev,
                    [event.jobId]: {
                        jobId: event.jobId,
                        progress: 0,
                        message: "Starting...",
                    },
                }));
                break;
            case ScrapingEventType.JOB_PROGRESS:
                const progressUpdate = {
                    jobId: event.jobId,
                    progress: event.data.progress,
                    currentFile: event.data.currentFile,
                    totalFiles: event.data.totalFiles,
                    downloadedFiles: event.data.downloadedFiles,
                    speed: event.data.speed,
                    estimatedTime: event.data.estimatedTime,
                    message: event.data.message,
                };
                setProgress(prev => ({
                    ...prev,
                    [event.jobId]: progressUpdate,
                }));
                onProgressUpdate?.(progressUpdate);
                break;
            case ScrapingEventType.JOB_COMPLETED:
                setProgress(prev => ({
                    ...prev,
                    [event.jobId]: {
                        ...prev[event.jobId],
                        progress: 100,
                        message: "Completed",
                    },
                }));
                onJobComplete?.(event.jobId);
                break;
            case ScrapingEventType.JOB_FAILED:
                setProgress(prev => ({
                    ...prev,
                    [event.jobId]: {
                        ...prev[event.jobId],
                        message: `Failed: ${event.data.error}`,
                    },
                }));
                onJobError?.(event.jobId, event.data.error);
                break;
        }
    };
    const getProgress = (jobId) => {
        return progress()[jobId];
    };
    const getOverallProgress = () => {
        const progressData = progress();
        const jobIds = Object.keys(progressData);
        if (jobIds.length === 0)
            return 0;
        const totalProgress = jobIds.reduce((sum, jobId) => {
            return sum + (progressData[jobId]?.progress || 0);
        }, 0);
        return totalProgress / jobIds.length;
    };
    const isJobActive = (jobId) => {
        const jobProgress = progress()[jobId];
        return jobProgress !== undefined && jobProgress.progress < 100;
    };
    const getActiveJobsCount = () => {
        const progressData = progress();
        return Object.values(progressData).filter(p => p.progress < 100 && !p.message?.includes("Failed")).length;
    };
    createEffect(() => {
        connectWebSocket();
        return () => {
            if (ws) {
                ws.close();
            }
        };
    });
    onCleanup(() => {
        if (ws) {
            ws.close();
        }
    });
    return {
        progress: progress(),
        getProgress,
        getOverallProgress,
        isJobActive,
        getActiveJobsCount,
    };
}
