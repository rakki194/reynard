/**
 * 🦊 Training Progress Stream
 *
 * Specialized stream for training progress updates with
 * real-time metrics, logs, and status tracking.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { DiffusionPipeWebSocket } from "./DiffusionPipeWebSocket";
import {
  TrainingStatus,
  TrainingMetrics,
  WebSocketMessage,
  TrainingProgressMessage,
  TrainingLogMessage,
  TrainingMetricsMessage,
} from "../types";
import { WEBSOCKET_MESSAGE_TYPES } from "../constants";

export interface TrainingProgressStreamConfig {
  trainingId: string;
  websocket: DiffusionPipeWebSocket;
  autoConnect?: boolean;
}

export interface TrainingProgressState {
  status: TrainingStatus | null;
  metrics: TrainingMetrics[];
  logs: string[];
  isConnected: boolean;
  error: string | null;
}

/**
 * Training progress stream for real-time updates
 */
export class TrainingProgressStream {
  private config: TrainingProgressStreamConfig;
  private websocket: DiffusionPipeWebSocket;
  private unsubscribeFunctions: (() => void)[] = [];

  // Reactive state
  private status = createSignal<TrainingStatus | null>(null);
  private metrics = createSignal<TrainingMetrics[]>([]);
  private logs = createSignal<string[]>([]);
  private isConnected = createSignal(false);
  private error = createSignal<string | null>(null);

  constructor(config: TrainingProgressStreamConfig) {
    this.config = config;
    this.websocket = config.websocket;

    this.setupMessageHandlers();

    if (config.autoConnect !== false) {
      this.connect();
    }

    onCleanup(() => {
      this.disconnect();
    });
  }

  /**
   * Connect to the stream
   */
  async connect(): Promise<void> {
    try {
      await this.websocket.connect();
      this.setIsConnected(true);
      this.setError(null);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : "Connection failed");
      throw error;
    }
  }

  /**
   * Disconnect from the stream
   */
  disconnect(): void {
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
    this.websocket.disconnect();
    this.setIsConnected(false);
  }

  /**
   * Get current state
   */
  getState(): TrainingProgressState {
    return {
      status: this.status[0](),
      metrics: this.metrics[0](),
      logs: this.logs[0](),
      isConnected: this.isConnected[0](),
      error: this.error[0](),
    };
  }

  /**
   * Get reactive state signals
   */
  getReactiveState() {
    return {
      status: this.status[0],
      metrics: this.metrics[0],
      logs: this.logs[0],
      isConnected: this.isConnected[0],
      error: this.error[0],
    };
  }

  /**
   * Subscribe to status updates
   */
  onStatusUpdate(handler: (status: TrainingStatus) => void): () => void {
    return this.websocket.onMessage(WEBSOCKET_MESSAGE_TYPES.TRAINING_PROGRESS, message => {
      if (message.type === WEBSOCKET_MESSAGE_TYPES.TRAINING_PROGRESS) {
        const progressMessage = message as TrainingProgressMessage;
        if (progressMessage.training_id === this.config.trainingId) {
          handler(progressMessage.status);
        }
      }
    });
  }

  /**
   * Subscribe to metrics updates
   */
  onMetricsUpdate(handler: (metrics: TrainingMetrics) => void): () => void {
    return this.websocket.onMessage(WEBSOCKET_MESSAGE_TYPES.TRAINING_METRICS, message => {
      if (message.type === WEBSOCKET_MESSAGE_TYPES.TRAINING_METRICS) {
        const metricsMessage = message as TrainingMetricsMessage;
        if (metricsMessage.training_id === this.config.trainingId) {
          handler(metricsMessage.metrics);
        }
      }
    });
  }

  /**
   * Subscribe to log updates
   */
  onLogUpdate(handler: (log: string) => void): () => void {
    return this.websocket.onMessage(WEBSOCKET_MESSAGE_TYPES.TRAINING_LOG, message => {
      if (message.type === WEBSOCKET_MESSAGE_TYPES.TRAINING_LOG) {
        const logMessage = message as TrainingLogMessage;
        if (logMessage.training_id === this.config.trainingId) {
          handler(logMessage.message);
        }
      }
    });
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    return this.websocket.onStateChange(state => {
      handler(state.connected);
    });
  }

  /**
   * Set up message handlers
   */
  private setupMessageHandlers(): void {
    // Handle training progress updates
    const unsubscribeProgress = this.websocket.onMessage(WEBSOCKET_MESSAGE_TYPES.TRAINING_PROGRESS, message => {
      if (message.type === WEBSOCKET_MESSAGE_TYPES.TRAINING_PROGRESS) {
        const progressMessage = message as TrainingProgressMessage;
        if (progressMessage.training_id === this.config.trainingId) {
          this.setStatus(progressMessage.status);
        }
      }
    });

    // Handle training metrics updates
    const unsubscribeMetrics = this.websocket.onMessage(WEBSOCKET_MESSAGE_TYPES.TRAINING_METRICS, message => {
      if (message.type === WEBSOCKET_MESSAGE_TYPES.TRAINING_METRICS) {
        const metricsMessage = message as TrainingMetricsMessage;
        if (metricsMessage.training_id === this.config.trainingId) {
          this.addMetrics(metricsMessage.metrics);
        }
      }
    });

    // Handle training log updates
    const unsubscribeLogs = this.websocket.onMessage(WEBSOCKET_MESSAGE_TYPES.TRAINING_LOG, message => {
      if (message.type === WEBSOCKET_MESSAGE_TYPES.TRAINING_LOG) {
        const logMessage = message as TrainingLogMessage;
        if (logMessage.training_id === this.config.trainingId) {
          this.addLog(logMessage.message);
        }
      }
    });

    // Handle connection state changes
    const unsubscribeState = this.websocket.onStateChange(state => {
      this.setIsConnected(state.connected);
      if (state.error) {
        this.setError(state.error);
      }
    });

    this.unsubscribeFunctions = [unsubscribeProgress, unsubscribeMetrics, unsubscribeLogs, unsubscribeState];
  }

  /**
   * Add new metrics to the list
   */
  private addMetrics(newMetrics: TrainingMetrics): void {
    const currentMetrics = this.metrics[0]();
    const updatedMetrics = [...currentMetrics, newMetrics];

    // Keep only the last 1000 metrics to prevent memory issues
    if (updatedMetrics.length > 1000) {
      updatedMetrics.splice(0, updatedMetrics.length - 1000);
    }

    this.setMetrics(updatedMetrics);
  }

  /**
   * Add new log entry
   */
  private addLog(logMessage: string): void {
    const currentLogs = this.logs[0]();
    const updatedLogs = [...currentLogs, logMessage];

    // Keep only the last 1000 log entries to prevent memory issues
    if (updatedLogs.length > 1000) {
      updatedLogs.splice(0, updatedLogs.length - 1000);
    }

    this.setLogs(updatedLogs);
  }

  // Reactive state setters
  private setStatus(status: TrainingStatus): void {
    this.status[1](status);
  }

  private setMetrics(metrics: TrainingMetrics[]): void {
    this.metrics[1](metrics);
  }

  private setLogs(logs: string[]): void {
    this.logs[1](logs);
  }

  private setIsConnected(connected: boolean): void {
    this.isConnected[1](connected);
  }

  private setError(error: string | null): void {
    this.error[1](error);
  }
}

/**
 * Create training progress stream
 */
export function createTrainingProgressStream(config: TrainingProgressStreamConfig): TrainingProgressStream {
  return new TrainingProgressStream(config);
}

/**
 * Hook for using training progress stream in components
 */
export function useTrainingProgressStream(config: TrainingProgressStreamConfig) {
  const stream = createTrainingProgressStream(config);
  const state = stream.getReactiveState();

  onCleanup(() => {
    stream.disconnect();
  });

  return {
    stream,
    ...state,
  };
}
