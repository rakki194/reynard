/**
 * Gallery WebSocket Composable
 *
 * Provides real-time WebSocket connection for gallery download progress updates.
 * Handles connection management, subscription to downloads, and message processing.
 */

import { createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface ProgressUpdate {
  download_id: string;
  url: string;
  status: string;
  percentage: number;
  current_file?: string;
  total_files: number;
  downloaded_files: number;
  total_bytes: number;
  downloaded_bytes: number;
  speed: number;
  estimated_time?: number;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface DownloadEvent {
  download_id: string;
  url: string;
  timestamp: string;
  result?: any;
  error?: string;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  subscribedDownloads: Set<string>;
}

export interface WebSocketActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: (downloadId: string) => void;
  unsubscribe: (downloadId: string) => void;
  sendMessage: (message: any) => void;
  ping: () => void;
}

export function useGalleryWebSocket(baseUrl: string = "") {
  const [state, setState] = createStore<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    subscribedDownloads: new Set(),
  });

  const [progressUpdates, setProgressUpdates] = createSignal<Map<string, ProgressUpdate>>(new Map());
  const [downloadEvents, setDownloadEvents] = createSignal<Map<string, DownloadEvent[]>>(new Map());

  let ws: WebSocket | null = null;
  let reconnectTimeout: number | null = null;
  let pingInterval: number | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // Start with 1 second

  const connect = async (): Promise<void> => {
    if (ws?.readyState === WebSocket.OPEN || state.connecting) {
      return;
    }

    setState("connecting", true);
    setState("error", null);

    try {
      const wsUrl = `${baseUrl.replace(/^http/, "ws")}/api/gallery/ws`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Gallery WebSocket connected");
        setState("connected", true);
        setState("connecting", false);
        setState("error", null);
        reconnectAttempts = 0;

        // Start ping interval
        pingInterval = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            sendMessage({ type: "ping" });
          }
        }, 30000); // Ping every 30 seconds

        // Re-subscribe to downloads
        state.subscribedDownloads.forEach(downloadId => {
          sendMessage({ type: "subscribe", download_id: downloadId });
        });
      };

      ws.onmessage = event => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = event => {
        console.log("Gallery WebSocket disconnected:", event.code, event.reason);
        setState("connected", false);
        setState("connecting", false);

        // Clear ping interval
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      ws.onerror = error => {
        console.error("Gallery WebSocket error:", error);
        setState("error", "WebSocket connection error");
        setState("connecting", false);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setState("error", "Failed to create WebSocket connection");
      setState("connecting", false);
    }
  };

  const disconnect = (): void => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }

    if (ws) {
      ws.close(1000, "User disconnect");
      ws = null;
    }

    setState("connected", false);
    setState("connecting", false);
    setState("subscribedDownloads", new Set());
  };

  const scheduleReconnect = (): void => {
    if (reconnectTimeout) {
      return;
    }

    const delay = reconnectDelay * Math.pow(2, reconnectAttempts); // Exponential backoff
    reconnectAttempts++;

    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${reconnectAttempts})`);

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connect();
    }, delay);
  };

  const handleMessage = (message: WebSocketMessage): void => {
    switch (message.type) {
      case "progress_update":
        handleProgressUpdate(message.data);
        break;
      case "download_started":
        handleDownloadStarted(message.data);
        break;
      case "download_completed":
        handleDownloadCompleted(message.data);
        break;
      case "download_error":
        handleDownloadError(message.data);
        break;
      case "download_cancelled":
        handleDownloadCancelled(message.data);
        break;
      case "subscribed":
        console.log(`Subscribed to download: ${message.data.download_id}`);
        break;
      case "unsubscribed":
        console.log(`Unsubscribed from download: ${message.data.download_id}`);
        break;
      case "pong":
        // Handle pong response
        break;
      case "error":
        console.error("WebSocket error message:", message.data.message);
        setState("error", message.data.message);
        break;
      default:
        console.log("Unknown WebSocket message type:", message.type);
    }
  };

  const handleProgressUpdate = (data: ProgressUpdate): void => {
    setProgressUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(data.download_id, data);
      return newMap;
    });
  };

  const handleDownloadStarted = (data: DownloadEvent): void => {
    setDownloadEvents(prev => {
      const newMap = new Map(prev);
      const events = newMap.get(data.download_id) || [];
      events.push({ ...data, type: "started" });
      newMap.set(data.download_id, events);
      return newMap;
    });
  };

  const handleDownloadCompleted = (data: DownloadEvent): void => {
    setDownloadEvents(prev => {
      const newMap = new Map(prev);
      const events = newMap.get(data.download_id) || [];
      events.push({ ...data, type: "completed" });
      newMap.set(data.download_id, events);
      return newMap;
    });
  };

  const handleDownloadError = (data: DownloadEvent): void => {
    setDownloadEvents(prev => {
      const newMap = new Map(prev);
      const events = newMap.get(data.download_id) || [];
      events.push({ ...data, type: "error" });
      newMap.set(data.download_id, events);
      return newMap;
    });
  };

  const handleDownloadCancelled = (data: DownloadEvent): void => {
    setDownloadEvents(prev => {
      const newMap = new Map(prev);
      const events = newMap.get(data.download_id) || [];
      events.push({ ...data, type: "cancelled" });
      newMap.set(data.download_id, events);
      return newMap;
    });
  };

  const subscribe = (downloadId: string): void => {
    if (!state.subscribedDownloads.has(downloadId)) {
      setState("subscribedDownloads", prev => new Set(prev).add(downloadId));
      sendMessage({ type: "subscribe", download_id: downloadId });
    }
  };

  const unsubscribe = (downloadId: string): void => {
    if (state.subscribedDownloads.has(downloadId)) {
      setState("subscribedDownloads", prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadId);
        return newSet;
      });
      sendMessage({ type: "unsubscribe", download_id: downloadId });
    }
  };

  const sendMessage = (message: any): void => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, cannot send message:", message);
    }
  };

  const ping = (): void => {
    sendMessage({ type: "ping" });
  };

  // Auto-connect on mount
  onMount(() => {
    connect();
  });

  // Cleanup on unmount
  onCleanup(() => {
    disconnect();
  });

  // Get progress for a specific download
  const getProgress = (downloadId: string): ProgressUpdate | undefined => {
    return progressUpdates().get(downloadId);
  };

  // Get events for a specific download
  const getEvents = (downloadId: string): DownloadEvent[] => {
    return downloadEvents().get(downloadId) || [];
  };

  // Get all active downloads
  const getActiveDownloads = (): ProgressUpdate[] => {
    return Array.from(progressUpdates().values()).filter(
      progress => progress.status === "downloading" || progress.status === "queued"
    );
  };

  return {
    // State
    connected: () => state.connected,
    connecting: () => state.connecting,
    error: () => state.error,
    subscribedDownloads: () => state.subscribedDownloads,

    // Data
    progressUpdates,
    downloadEvents,

    // Actions
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage,
    ping,

    // Utilities
    getProgress,
    getEvents,
    getActiveDownloads,
  };
}
