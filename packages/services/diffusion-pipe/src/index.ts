/**
 * 🦊 Reynard Diffusion-Pipe Service
 *
 * Comprehensive API client and service integration for diffusion-pipe training
 * with real-time WebSocket support, authentication, and error handling.
 */

// Core API client
export { DiffusionPipeClient } from "./client/DiffusionPipeClient";
export type { DiffusionPipeConfig } from "./client/DiffusionPipeConfig";

// WebSocket client for real-time updates
export { DiffusionPipeWebSocket } from "./websocket/DiffusionPipeWebSocket";
export { TrainingProgressStream } from "./websocket/TrainingProgressStream";

// Type definitions
export type {
  TrainingRequest,
  TrainingStatus,
  TrainingMetrics,
  ModelInfo,
  CheckpointInfo,
  ChromaTrainingConfig,
  DatasetConfig,
  DiffusionPipeConfig as DiffusionPipeConfigType,
} from "./types";

// Utilities
export { createDiffusionPipeClient } from "./client/createDiffusionPipeClient";
export { createTrainingProgressStream } from "./websocket/createTrainingProgressStream";

// Error handling
export { DiffusionPipeError, TrainingError } from "./errors";

// Constants
export { DIFFUSION_PIPE_ENDPOINTS, TRAINING_STATUS } from "./constants";
