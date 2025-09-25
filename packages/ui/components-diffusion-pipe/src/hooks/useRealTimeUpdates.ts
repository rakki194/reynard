/**
 * 🦊 Real-time Updates Hook
 *
 * Hook for managing real-time WebSocket updates
 * following Reynard's composable patterns.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface RealTimeUpdateData {
  type: "training_update" | "metrics_update" | "log_update" | "status_change";
  trainingId: string;
  timestamp: string;
  data: any;
}

export interface UseRealTimeUpdatesOptions {
  onUpdate?: (data: RealTimeUpdateData) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface UseRealTimeUpdatesReturn {
  isConnected: () => boolean;
  isConnecting: () => boolean;
  error: () => string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: any) => void;
}

export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}): UseRealTimeUpdatesReturn => {
  const [isConnected, setIsConnected] = createSignal(false);
  const [isConnecting, setIsConnecting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = createSignal(0);

  let websocket: WebSocket | undefined;
  let reconnectTimeout: NodeJS.Timeout | undefined;
  let heartbeatInterval: NodeJS.Timeout | undefined;

  const maxReconnectAttempts = options.maxReconnectAttempts ?? 5;
  const reconnectInterval = options.reconnectInterval ?? 5000;

  // Connect to WebSocket
  const connect = async (): Promise<void> => {
    if (isConnected() || isConnecting()) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // This would typically connect to the WebSocket endpoint
      // websocket = new WebSocket('ws://localhost:8000/ws/diffusion-pipe');

      // Mock WebSocket connection for now
      websocket = new WebSocket("ws://localhost:8000/ws/diffusion-pipe/mock");

      websocket.onopen = () => {
        console.log("Real-time updates WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        setError(null);
        options.onConnect?.();

        // Start heartbeat
        startHeartbeat();
      };

      websocket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "heartbeat") {
            // Respond to heartbeat
            sendMessage({ type: "heartbeat_response", timestamp: new Date().toISOString() });
            return;
          }

          // Handle different types of updates
          const updateData: RealTimeUpdateData = {
            type: data.type,
            trainingId: data.trainingId,
            timestamp: data.timestamp || new Date().toISOString(),
            data: data.data || data,
          };

          options.onUpdate?.(updateData);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
          setError("Failed to parse update message");
        }
      };

      websocket.onerror = err => {
        console.error("Real-time updates WebSocket error:", err);
        setError("WebSocket connection error");
        options.onError?.("WebSocket connection error");
      };

      websocket.onclose = event => {
        console.log("Real-time updates WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        stopHeartbeat();
        options.onDisconnect?.();

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts() < maxReconnectAttempts) {
          scheduleReconnect();
        } else if (reconnectAttempts() >= maxReconnectAttempts) {
          setError("Max reconnection attempts reached");
          options.onError?.("Max reconnection attempts reached");
        }
      };
    } catch (err) {
      console.error("Failed to connect to real-time updates WebSocket:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to real-time updates";
      setError(errorMessage);
      options.onError?.(errorMessage);
      setIsConnecting(false);
    }
  };

  // Disconnect WebSocket
  const disconnect = () => {
    if (websocket) {
      websocket.close(1000, "User disconnected");
      websocket = undefined;
    }
    stopHeartbeat();
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = undefined;
    }
  };

  // Send message through WebSocket
  const sendMessage = (message: any) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      try {
        websocket.send(JSON.stringify(message));
      } catch (err) {
        console.error("Failed to send WebSocket message:", err);
        setError("Failed to send message");
      }
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  };

  // Start heartbeat to keep connection alive
  const startHeartbeat = () => {
    heartbeatInterval = setInterval(() => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        sendMessage({ type: "heartbeat", timestamp: new Date().toISOString() });
      }
    }, 30000); // Send heartbeat every 30 seconds
  };

  // Stop heartbeat
  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = undefined;
    }
  };

  // Schedule reconnection
  const scheduleReconnect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    setReconnectAttempts(prev => prev + 1);

    reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttempts()}/${maxReconnectAttempts})...`);
      connect();
    }, reconnectInterval);
  };

  // Auto-connect on mount
  createEffect(() => {
    connect();
  });

  // Cleanup on unmount
  onCleanup(() => {
    disconnect();
  });

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
  };
};
