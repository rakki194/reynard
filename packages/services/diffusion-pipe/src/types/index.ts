/**
 * 🦊 Diffusion-Pipe Type Definitions
 *
 * Comprehensive type definitions for diffusion-pipe training operations,
 * following Reynard's Pydantic2 validation patterns.
 */

// Base training configuration
export interface DiffusionPipeConfig {
  output_dir: string;
  dataset: string;
  epochs: number;
  micro_batch_size_per_gpu: number;
  pipeline_stages: number;
  gradient_accumulation_steps: number;
  gradient_clipping: number;
  warmup_steps: number;
  model: ModelConfig;
  adapter: AdapterConfig;
  optimizer: OptimizerConfig;
  monitoring?: MonitoringConfig;
}

// Model configuration
export interface ModelConfig {
  type:
    | "chroma"
    | "sdxl"
    | "flux"
    | "ltx-video"
    | "hunyuan-video"
    | "cosmos"
    | "lumina"
    | "wan2.1"
    | "hidream"
    | "sd3"
    | "cosmos-predict2";
  diffusers_path: string;
  transformer_path?: string;
  dtype: "bfloat16" | "float16" | "float32";
  transformer_dtype?: "float8" | "bfloat16" | "float16" | "float32";
  flux_shift?: boolean;
}

// Adapter configuration (LoRA)
export interface AdapterConfig {
  type: "lora";
  rank: number;
  dtype: "bfloat16" | "float16" | "float32";
}

// Optimizer configuration
export interface OptimizerConfig {
  type: "adamw_optimi" | "adamw" | "sgd";
  lr: number;
  betas?: [number, number];
  weight_decay?: number;
  eps?: number;
}

// Monitoring configuration
export interface MonitoringConfig {
  enable_wandb?: boolean;
  wandb_api_key?: string;
  wandb_tracker_name?: string;
  wandb_run_name?: string;
}

// Training request
export interface TrainingRequest {
  config: DiffusionPipeConfig;
  profile_name?: string;
  force_restart?: boolean;
}

// Training status
export interface TrainingStatus {
  id: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  current_epoch: number;
  total_epochs: number;
  current_step: number;
  total_steps: number;
  start_time: string;
  end_time?: string;
  error_message?: string;
  metrics?: TrainingMetrics;
}

// Training metrics
export interface TrainingMetrics {
  loss: number;
  learning_rate: number;
  gpu_memory_usage: number;
  cpu_usage: number;
  throughput: number;
  timestamp: string;
}

// Model information
export interface ModelInfo {
  type: string;
  name: string;
  description: string;
  supported_resolutions: number[];
  default_config: Partial<DiffusionPipeConfig>;
  capabilities: string[];
}

// Checkpoint information
export interface CheckpointInfo {
  id: string;
  training_id: string;
  epoch: number;
  step: number;
  file_path: string;
  file_size: number;
  created_at: string;
  metrics: TrainingMetrics;
}

// Chroma-specific training configuration
export interface ChromaTrainingConfig extends DiffusionPipeConfig {
  model: ModelConfig & {
    type: "chroma";
    transformer_path: string;
    transformer_dtype: "float8" | "bfloat16";
    flux_shift: true;
  };
  adapter: AdapterConfig & {
    rank: 32;
  };
  optimizer: OptimizerConfig & {
    type: "adamw_optimi";
    lr: 2.5e-4;
    betas: [0.9, 0.99];
    weight_decay: 0.01;
    eps: 1e-8;
  };
}

// Dataset configuration
export interface DatasetConfig {
  resolutions: number[];
  enable_ar_bucket?: boolean;
  min_ar?: number;
  max_ar?: number;
  num_ar_buckets?: number;
  frame_buckets?: number[];
  shuffle_tags?: boolean;
  directories: DatasetDirectory[];
}

// Dataset directory
export interface DatasetDirectory {
  path: string;
  caption_prefix?: string;
  num_repeats?: number;
}

// Training profile
export interface TrainingProfile {
  name: string;
  description: string;
  config: DiffusionPipeConfig;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

// WebSocket message types
export interface TrainingProgressMessage {
  type: "training_progress";
  training_id: string;
  status: TrainingStatus;
}

export interface TrainingLogMessage {
  type: "training_log";
  training_id: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  timestamp: string;
}

export interface TrainingMetricsMessage {
  type: "training_metrics";
  training_id: string;
  metrics: TrainingMetrics;
}

export type WebSocketMessage = TrainingProgressMessage | TrainingLogMessage | TrainingMetricsMessage;

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}
