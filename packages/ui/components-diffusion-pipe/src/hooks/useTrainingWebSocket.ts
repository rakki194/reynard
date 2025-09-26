/**
 * 🦊 Training WebSocket Composable
 *
 * Provides real-time communication with the diffusion-pipe training backend
 * for progress updates, metrics, logs, and status changes.
 * Following the reynard-connection patterns from useGalleryWebSocket.
 */
import { createSignal, createEffect, onCleanup } from "solid-js";
import { WebSocketConnection } from "reynard-connection";

export interface TrainingEvent {
  type: "progress" | "metrics" | "log" | "status" | "error" | "complete";
  trainingId: string;
  data: any;
  timestamp: Date;
}

export interface TrainingWebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface UseTrainingWebSocketReturn {
  isConnected: () => boolean;
  isConnecting: () => boolean;
  error: () => string | null;
  events: () => TrainingEvent[];
  sendMessage: (message: any) => void;
  subscribe: (trainingId: string) => void;
  unsubscribe: (trainingId: string) => void;
  clearEvents: () => void;
  reconnect: () => void;
}

export const useTrainingWebSocket = (config: TrainingWebSocketConfig): UseTrainingWebSocketReturn => {
  const [isConnected, setIsConnected] = createSignal(false);
  const [isConnecting, setIsConnecting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [events, setEvents] = createSignal<TrainingEvent[]>([]);

  let connectionRef: WebSocketConnection | null = null;
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
    heartbeatTimeoutRef = setTimeout(async () => {
      if (connectionRef && isConnected()) {
        await connectionRef.send({ type: "ping" });
        startHeartbeat();
      }
    }, config.heartbeatInterval || 30000);
  };

  const handleMessage = (message: any) => {
    try {
      const event: TrainingEvent = {
        type: message.type,
        trainingId: message.trainingId,
        data: message.data,
        timestamp: new Date(message.timestamp || Date.now()),
      };

      setEvents(prev => [event, ...prev.slice(0, 199)]); // Keep last 200 events
    } catch (err) {
      console.error("Failed to parse training WebSocket message:", err);
    }
  };

  const connect = async () => {
    if (isConnecting() || isConnected()) return;

    setIsConnecting(true);
    setError(null);

    try {
      const connection = new WebSocketConnection({
        name: "training-websocket",
        url: config.url,
        connectionType: "websocket" as any,
      });

      // Set up event handlers
      connection.onEvent((event: any) => {
        if (event.eventType === "message") {
          handleMessage(event.data);
        } else if (event.eventType === "open") {
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          reconnectAttemptsRef = 0;
          startHeartbeat();
        } else if (event.eventType === "close") {
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
        } else if (event.eventType === "error") {
          setError(event.data?.message || "Training WebSocket connection error");
          setIsConnecting(false);
        }
      });

      connectionRef = connection;
      await connection.connect();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    clearReconnectTimeout();
    clearHeartbeatTimeout();

    if (connectionRef) {
      await connectionRef.disconnect();
      connectionRef = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  };

  const sendMessage = async (message: any) => {
    if (connectionRef && isConnected()) {
      await connectionRef.send(message);
    } else {
      console.warn("Training WebSocket not connected, cannot send message");
    }
  };

  const subscribe = async (trainingId: string) => {
    subscriptionsRef.add(trainingId);
    await sendMessage({
      type: "subscribe",
      trainingId,
    });
  };

  const unsubscribe = async (trainingId: string) => {
    subscriptionsRef.delete(trainingId);
    await sendMessage({
      type: "unsubscribe",
      trainingId,
    });
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const reconnect = async () => {
    await disconnect();
    reconnectAttemptsRef = 0;
    await connect();
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
