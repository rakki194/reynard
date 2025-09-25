/**
 * Gallery WebSocket Composable
 *
 * Provides real-time communication with the gallery service backend
 * for progress updates, status changes, and live notifications.
 */
import { createSignal, createEffect, onCleanup } from "solid-js";
import { ConnectionManager } from "reynard-connection";

export interface DownloadEvent {
  type: "progress" | "status" | "error" | "complete";
  downloadId: string;
  data: any;
  timestamp: Date;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface UseGalleryWebSocketReturn {
  isConnected: () => boolean;
  isConnecting: () => boolean;
  error: () => string | null;
  events: () => DownloadEvent[];
  sendMessage: (message: any) => void;
  subscribe: (downloadId: string) => void;
  unsubscribe: (downloadId: string) => void;
  clearEvents: () => void;
  reconnect: () => void;
}

export const useGalleryWebSocket = (config: WebSocketConfig): UseGalleryWebSocketReturn => {
  const [isConnected, setIsConnected] = createSignal(false);
  const [isConnecting, setIsConnecting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [events, setEvents] = createSignal<DownloadEvent[]>([]);

  let connectionRef: ConnectionManager | null = null;
  const subscriptionsRef = new Set<string>();
  let reconnectTimeoutRef: NodeJS.Timeout | null = null;
  let heartbeatTimeoutRef: NodeJS.Timeout | null = null;
  let reconnectAttemptsRef = 0;

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef) {
      clearTimeout(reconnectTimeoutRef);
      reconnectTimeoutRef = null;
    }
  };

  const clearHeartbeatTimeout = () => {
    if (heartbeatTimeoutRef) {
      clearTimeout(heartbeatTimeoutRef);
      heartbeatTimeoutRef = null;
    }
  };

  const startHeartbeat = () => {
    clearHeartbeatTimeout();
    heartbeatTimeoutRef = setTimeout(() => {
      if (connectionRef && isConnected()) {
        connectionRef.send({ type: "ping" });
        startHeartbeat();
      }
    }, config.heartbeatInterval || 30000);
  };

  const handleMessage = (message: any) => {
    try {
      const event: DownloadEvent = {
        type: message.type,
        downloadId: message.downloadId,
        data: message.data,
        timestamp: new Date(message.timestamp || Date.now()),
      };

      setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    } catch (err) {
      console.error("Failed to parse WebSocket message:", err);
    }
  };

  const connect = async () => {
    if (isConnecting() || isConnected()) return;

    setIsConnecting(true);
    setError(null);

    try {
      const connection = new ConnectionManager({
        url: config.url,
        protocols: ["gallery-dl"],
        onMessage: handleMessage,
        onOpen: () => {
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          reconnectAttemptsRef = 0;
          startHeartbeat();
        },
        onClose: () => {
          setIsConnected(false);
          setIsConnecting(false);
          clearHeartbeatTimeout();

          // Attempt to reconnect
          if (reconnectAttemptsRef < (config.maxReconnectAttempts || 5)) {
            reconnectAttemptsRef++;
            reconnectTimeoutRef = setTimeout(() => {
              connect();
            }, config.reconnectInterval || 5000);
          } else {
            setError("Max reconnection attempts reached");
          }
        },
        onError: (err: any) => {
          setError(err.message || "WebSocket connection error");
          setIsConnecting(false);
        },
      });

      connectionRef = connection;
      await connection.connect();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    clearReconnectTimeout();
    clearHeartbeatTimeout();

    if (connectionRef) {
      connectionRef.disconnect();
      connectionRef = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  };

  const sendMessage = (message: any) => {
    if (connectionRef && isConnected()) {
      connectionRef.send(message);
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  };

  const subscribe = (downloadId: string) => {
    subscriptionsRef.add(downloadId);
    sendMessage({
      type: "subscribe",
      downloadId,
    });
  };

  const unsubscribe = (downloadId: string) => {
    subscriptionsRef.delete(downloadId);
    sendMessage({
      type: "unsubscribe",
      downloadId,
    });
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const reconnect = () => {
    disconnect();
    reconnectAttemptsRef = 0;
    connect();
  };

  // Auto-connect on mount
  createEffect(() => {
    connect();

    onCleanup(() => {
      disconnect();
    });
  });

  // Cleanup on unmount
  onCleanup(() => {
    clearReconnectTimeout();
    clearHeartbeatTimeout();
  });

  return {
    isConnected,
    isConnecting,
    error,
    events,
    sendMessage,
    subscribe,
    unsubscribe,
    clearEvents,
    reconnect,
  };
};
