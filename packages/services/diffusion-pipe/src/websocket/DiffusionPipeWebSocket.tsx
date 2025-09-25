/**
 * 🦊 Diffusion-Pipe WebSocket Client
 *
 * Real-time WebSocket client for diffusion-pipe training updates
 * with automatic reconnection, heartbeat, and message handling.
 */

import { createSignal, createEffect, onCleanup, createContext, useContext } from "solid-js";
import { WebSocketMessage, TrainingProgressMessage, TrainingLogMessage, TrainingMetricsMessage } from "../types";
import { WebSocketConnectionError, TimeoutError } from "../errors";
import { WEBSOCKET_MESSAGE_TYPES, TIMEOUTS } from "../constants";

export interface WebSocketConfig {
  url: string;
  timeout?: number;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  protocols?: string[];
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastMessage: WebSocketMessage | null;
}

/**
 * WebSocket client for diffusion-pipe real-time updates
 */
export class DiffusionPipeWebSocket {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private reconnectTimeout: number | null = null;
  private heartbeatInterval: number | null = null;
  private messageHandlers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private stateHandlers: Set<(state: WebSocketState) => void> = new Set();

  // Reactive state
  private connected = createSignal(false);
  private connecting = createSignal(false);
  private error = createSignal<string | null>(null);
  private reconnectAttempts = createSignal(0);
  private lastMessage = createSignal<WebSocketMessage | null>(null);

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      timeout: config.timeout || TIMEOUTS.WEBSOCKET_CONNECTION,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 2000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      protocols: config.protocols || [],
    };

    // Set up cleanup
    onCleanup(() => {
      this.disconnect();
    });
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.setConnecting(true);
    this.setError(null);

    try {
      await this.establishConnection();
      this.setConnected(true);
      this.setConnecting(false);
      this.setReconnectAttempts(0);
      this.startHeartbeat();
      this.notifyStateChange();
    } catch (error) {
      this.setConnecting(false);
      this.setError(error instanceof Error ? error.message : "Connection failed");
      this.notifyStateChange();
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.clearHeartbeat();
    this.clearReconnectTimeout();

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.setConnected(false);
    this.setConnecting(false);
    this.notifyStateChange();
  }

  /**
   * Send message to WebSocket
   */
  send(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketConnectionError(this.config.url, "WebSocket is not connected");
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      throw new WebSocketConnectionError(this.config.url, "Failed to send message", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Subscribe to specific message types
   */
  onMessage(type: string, handler: (message: WebSocketMessage) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(handler: (state: WebSocketState) => void): () => void {
    this.stateHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  /**
   * Get current state
   */
  getState(): WebSocketState {
    return {
      connected: this.connected[0](),
      connecting: this.connecting[0](),
      error: this.error[0](),
      reconnectAttempts: this.reconnectAttempts[0](),
      lastMessage: this.lastMessage[0](),
    };
  }

  /**
   * Get reactive state signals
   */
  getReactiveState() {
    return {
      connected: this.connected[0],
      connecting: this.connecting[0],
      error: this.error[0],
      reconnectAttempts: this.reconnectAttempts[0],
      lastMessage: this.lastMessage[0],
    };
  }

  /**
   * Establish WebSocket connection
   */
  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new TimeoutError("WebSocket connection", this.config.timeout));
      }, this.config.timeout);

      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onclose = event => {
          clearTimeout(timeout);
          this.handleDisconnect(event);
        };

        this.ws.onerror = event => {
          clearTimeout(timeout);
          reject(new WebSocketConnectionError(this.config.url, "WebSocket connection error", { event }));
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    this.setLastMessage(message);

    // Notify specific message type handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error("Error in message handler:", error);
        }
      });
    }

    // Notify general message handlers
    const generalHandlers = this.messageHandlers.get("*");
    if (generalHandlers) {
      generalHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error("Error in general message handler:", error);
        }
      });
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnect(event: CloseEvent): void {
    this.setConnected(false);
    this.setConnecting(false);

    // Don't reconnect if it was a clean close
    if (event.code === 1000) {
      this.notifyStateChange();
      return;
    }

    // Attempt reconnection
    const currentAttempts = this.reconnectAttempts[0]();
    if (currentAttempts < this.config.maxReconnectAttempts) {
      this.setReconnectAttempts(currentAttempts + 1);
      this.scheduleReconnect();
    } else {
      this.setError("Max reconnection attempts reached");
      this.notifyStateChange();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimeout();

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect().catch(error => {
        console.error("Reconnection failed:", error);
      });
    }, this.config.reconnectDelay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.clearHeartbeat();

    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Clear heartbeat interval
   */
  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Clear reconnect timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Notify state change handlers
   */
  private notifyStateChange(): void {
    const state = this.getState();
    this.stateHandlers.forEach(handler => {
      try {
        handler(state);
      } catch (error) {
        console.error("Error in state change handler:", error);
      }
    });
  }

  // Reactive state setters
  private setConnected(connected: boolean): void {
    this.connected[1](connected);
  }

  private setConnecting(connecting: boolean): void {
    this.connecting[1](connecting);
  }

  private setError(error: string | null): void {
    this.error[1](error);
  }

  private setReconnectAttempts(attempts: number): void {
    this.reconnectAttempts[1](attempts);
  }

  private setLastMessage(message: WebSocketMessage | null): void {
    this.lastMessage[1](message);
  }
}

/**
 * Create WebSocket client with configuration
 */
export function createDiffusionPipeWebSocket(config: WebSocketConfig): DiffusionPipeWebSocket {
  return new DiffusionPipeWebSocket(config);
}

/**
 * WebSocket context for React-like usage
 */
const WebSocketContext = createContext<DiffusionPipeWebSocket | null>(null);

export function WebSocketProvider(props: { client: DiffusionPipeWebSocket; children: any }) {
  return <WebSocketContext.Provider value={props.client}>{props.children}</WebSocketContext.Provider>;
}

export function useWebSocket(): DiffusionPipeWebSocket {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
