/**
 * Gallery-dl Demo App - Reynard Framework Example
 * Demonstrates gallery-dl integration with comprehensive download management
 */

import { Card } from "reynard-components-core";
import "reynard-components-core/styles";
import { NotificationsProvider, createNotificationsModule, useNotifications } from "reynard-core";
import { ReynardProvider, useTheme } from "reynard-themes";
import "reynard-themes/themes.css";
import { Component, createSignal, onMount } from "solid-js";
import { DownloadManager } from "./components/DownloadManager";
import { ProgressTracker } from "./components/ProgressTracker";
import { HistoryViewer } from "./components/HistoryViewer";
import { GalleryService } from "reynard-gallery-dl";
import type { GalleryServiceConfig, ProgressState, DownloadResult } from "reynard-gallery-dl";

const GalleryDlApp: Component = () => {
  const [galleryService, setGalleryService] = createSignal<GalleryService | null>(null);
  const [activeDownloads, setActiveDownloads] = createSignal<Map<string, ProgressState>>(new Map());
  const [downloadHistory, setDownloadHistory] = createSignal<DownloadResult[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  
  const { theme } = useTheme();
  const { notify } = useNotifications();

  // Initialize gallery service
  onMount(() => {
    const config: GalleryServiceConfig = {
      name: "gallery-dl-demo",
      baseUrl: "http://localhost:8000",
      timeout: 30000,
    };
    
    const service = new GalleryService(config);
    setGalleryService(service);
    
    // Check service health
    service.getServiceHealth().then((health: any) => {
      if (health.status === "healthy") {
        notify("Gallery-dl service connected successfully", "success");
      } else {
        notify("Gallery-dl service is not healthy", "warning");
      }
    }).catch((err: any) => {
      console.error("Failed to connect to gallery-dl service:", err);
      notify("Failed to connect to gallery-dl service", "error");
    });
  });

  const handleDownload = async (url: string) => {
    const service = galleryService();
    if (!service) {
      setError("Gallery service not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate URL first
      const validation = await service.validateUrl(url);
      if (!validation.isValid) {
        setError(`Invalid URL: ${validation.error}`);
        notify(`Invalid URL: ${validation.error}`, "error");
        return;
      }

      // Start download
      const result = await service.downloadGallery(url, {
        outputDirectory: "./downloads",
        maxConcurrent: 3,
        retries: 3,
        timeout: 300,
      });

      if (result.success) {
        notify(`Download started successfully for ${url}`, "success");
        // Add to active downloads
        const downloadId = result.data?.download_id || `download_${Date.now()}`;
        setActiveDownloads(prev => {
          const newMap = new Map(prev);
          newMap.set(downloadId, {
            percentage: 0,
            status: "pending",
            message: "Starting download...",
          });
          return newMap;
        });
      } else {
        setError(result.error?.message || "Download failed");
        notify(`Download failed: ${result.error?.message}`, "error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      notify(`Download error: ${errorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDownload = async (downloadId: string) => {
    const service = galleryService();
    if (!service) {
      setError("Gallery service not initialized");
      return;
    }

    try {
      // Remove from active downloads
      setActiveDownloads(prev => {
        const newMap = new Map(prev);
        newMap.delete(downloadId);
        return newMap;
      });
      
      notify("Download cancelled", "info");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      notify(`Failed to cancel download: ${errorMessage}`, "error");
    }
  };

  const handleDownloadComplete = (downloadId: string, result: DownloadResult) => {
    // Remove from active downloads
    setActiveDownloads(prev => {
      const newMap = new Map(prev);
      newMap.delete(downloadId);
      return newMap;
    });

    // Add to history
    setDownloadHistory(prev => [result, ...prev]);
    notify("Download completed successfully", "success");
  };

  return (
    <div class="app">
      <header class="app-header">
        <Card variant="elevated" padding="lg" class="header-card">
          <h1>
            <span class="reynard-logo">🦊</span>
            Gallery-dl Demo
          </h1>
          <p>Download galleries from various platforms using gallery-dl integration</p>
          <div class="header-controls">
            <div class="theme-info">Current theme: {theme}</div>
          </div>
        </Card>
      </header>

      <main class="app-main">
        {error() && (
          <div class="error-message">
            {error()}
          </div>
        )}

        <section class="download-section">
          <h2 class="section-title">Start Download</h2>
          <Card variant="default" padding="lg">
            <DownloadManager
              onDownload={handleDownload}
              isLoading={isLoading()}
              service={galleryService()}
            />
          </Card>
        </section>

        <section class="progress-section">
          <h2 class="section-title">Active Downloads</h2>
          <Card variant="default" padding="lg">
            <ProgressTracker
              downloads={activeDownloads()}
              onCancel={handleCancelDownload}
              onComplete={handleDownloadComplete}
            />
          </Card>
        </section>

        <section class="history-section">
          <h2 class="section-title">Download History</h2>
          <Card variant="default" padding="lg">
            <HistoryViewer
              history={downloadHistory()}
              onRetry={handleDownload}
            />
          </Card>
        </section>
      </main>

      <footer class="app-footer">
        <Card variant="outlined" padding="sm" class="footer-card">
          <p>Gallery-dl Demo - Powered by Reynard Framework 🦊</p>
        </Card>
      </footer>
    </div>
  );
};

const App: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <GalleryDlApp />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;