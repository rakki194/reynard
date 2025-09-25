/**
 * 🦊 Training Progress Stream Factory
 *
 * Factory functions to create training progress streams
 * with proper configuration and WebSocket setup.
 */

import { TrainingProgressStream } from "./TrainingProgressStream";
import { DiffusionPipeWebSocket } from "./DiffusionPipeWebSocket";
import { createDiffusionPipeWebSocket } from "./DiffusionPipeWebSocket";
import { TrainingProgressStreamConfig } from "./TrainingProgressStream";

/**
 * Create a training progress stream with default WebSocket configuration
 */
export function createTrainingProgressStream(trainingId: string, websocketUrl?: string): TrainingProgressStream {
  const wsUrl = websocketUrl || "ws://localhost:8000/ws/diffusion-pipe";
  const websocket = createDiffusionPipeWebSocket({
    url: wsUrl,
    timeout: 10000,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000,
    heartbeatInterval: 30000,
  });

  return new TrainingProgressStream({
    trainingId,
    websocket,
    autoConnect: true,
  });
}

/**
 * Create a training progress stream with custom WebSocket
 */
export function createTrainingProgressStreamWithWebSocket(
  trainingId: string,
  websocket: DiffusionPipeWebSocket
): TrainingProgressStream {
  return new TrainingProgressStream({
    trainingId,
    websocket,
    autoConnect: true,
  });
}

/**
 * Create a training progress stream with custom configuration
 */
export function createTrainingProgressStreamWithConfig(config: TrainingProgressStreamConfig): TrainingProgressStream {
  return new TrainingProgressStream(config);
}
