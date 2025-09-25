/**
 * 🦊 Diffusion-Pipe Constants
 *
 * API endpoints, status values, and configuration constants
 * for diffusion-pipe service integration.
 */

// API Endpoints
export const DIFFUSION_PIPE_ENDPOINTS = {
  // Training management
  TRAIN: "/api/diffusion-pipe/train",
  TRAININGS: "/api/diffusion-pipe/trainings",
  TRAINING_BY_ID: (id: string) => `/api/diffusion-pipe/trainings/${id}`,
  TRAINING_RESUME: (id: string) => `/api/diffusion-pipe/trainings/${id}/resume`,

  // Model management
  MODELS: "/api/diffusion-pipe/models",
  MODEL_BY_TYPE: (type: string) => `/api/diffusion-pipe/models/${type}`,

  // Configuration
  VALIDATE_CONFIG: "/api/diffusion-pipe/validate-config",
  TEMPLATES: "/api/diffusion-pipe/templates",

  // Monitoring
  METRICS: "/api/diffusion-pipe/metrics",
  LOGS: (trainingId: string) => `/api/diffusion-pipe/logs/${trainingId}`,
  HEALTH: "/api/diffusion-pipe/health",

  // WebSocket
  WEBSOCKET: "/ws/diffusion-pipe",
} as const;

// Training status values
export const TRAINING_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

// Model types
export const MODEL_TYPES = {
  CHROMA: "chroma",
  SDXL: "sdxl",
  FLUX: "flux",
  LTX_VIDEO: "ltx-video",
  HUNYUAN_VIDEO: "hunyuan-video",
  COSMOS: "cosmos",
  LUMINA: "lumina",
  WAN2_1: "wan2.1",
  HIDREAM: "hidream",
  SD3: "sd3",
  COSMOS_PREDICT2: "cosmos-predict2",
} as const;

// Adapter types
export const ADAPTER_TYPES = {
  LORA: "lora",
} as const;

// Optimizer types
export const OPTIMIZER_TYPES = {
  ADAMW_OPTIMI: "adamw_optimi",
  ADAMW: "adamw",
  SGD: "sgd",
} as const;

// Data types
export const DATA_TYPES = {
  BFLOAT16: "bfloat16",
  FLOAT16: "float16",
  FLOAT32: "float32",
  FLOAT8: "float8",
} as const;

// Default configurations
export const DEFAULT_CONFIGS = {
  CHROMA_E6AI_512: {
    output_dir: "/home/kade/runeset/diffusion-pipe/output/e6ai_512",
    dataset: "train/e6ai_dataset_512.toml",
    epochs: 1000,
    micro_batch_size_per_gpu: 4,
    pipeline_stages: 1,
    gradient_accumulation_steps: 1,
    gradient_clipping: 1.0,
    warmup_steps: 100,
    model: {
      type: "chroma" as const,
      diffusers_path: "/home/kade/flux_schnell_diffusers",
      transformer_path: "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v47.safetensors",
      dtype: "bfloat16" as const,
      transformer_dtype: "float8" as const,
      flux_shift: true,
    },
    adapter: {
      type: "lora" as const,
      rank: 32,
      dtype: "bfloat16" as const,
    },
    optimizer: {
      type: "adamw_optimi" as const,
      lr: 2.5e-4,
      betas: [0.9, 0.99] as [number, number],
      weight_decay: 0.01,
      eps: 1e-8,
    },
    monitoring: {
      enable_wandb: true,
      wandb_api_key: "cc8a8b5f5fa85dacd7e085ab244601cd63fb9925",
      wandb_tracker_name: "e6ai-lora",
      wandb_run_name: "e6ai-512-2",
    },
  },
  CHROMA_E6AI_1024: {
    output_dir: "/home/kade/runeset/diffusion-pipe/output/e6ai_1024",
    dataset: "train/e6ai_dataset_1024.toml",
    epochs: 1000,
    micro_batch_size_per_gpu: 1,
    pipeline_stages: 1,
    gradient_accumulation_steps: 1,
    gradient_clipping: 1.0,
    warmup_steps: 100,
    model: {
      type: "chroma" as const,
      diffusers_path: "/home/kade/flux_schnell_diffusers",
      transformer_path: "/home/kade/runeset/wolfy/models/unet/chroma-unlocked-v50.safetensors",
      dtype: "bfloat16" as const,
      transformer_dtype: "float8" as const,
      flux_shift: true,
    },
    adapter: {
      type: "lora" as const,
      rank: 32,
      dtype: "bfloat16" as const,
    },
    optimizer: {
      type: "adamw_optimi" as const,
      lr: 2.5e-4,
      betas: [0.9, 0.99] as [number, number],
      weight_decay: 0.01,
      eps: 1e-8,
    },
    monitoring: {
      enable_wandb: true,
      wandb_api_key: "cc8a8b5f5fa85dacd7e085ab244601cd63fb9925",
      wandb_tracker_name: "e6ai-lora",
      wandb_run_name: "e6ai-1024-7-quad-lr",
    },
  },
} as const;

// WebSocket message types
export const WEBSOCKET_MESSAGE_TYPES = {
  TRAINING_PROGRESS: "training_progress",
  TRAINING_LOG: "training_log",
  TRAINING_METRICS: "training_metrics",
} as const;

// Error codes
export const ERROR_CODES = {
  TRAINING_FAILED: "TRAINING_FAILED",
  CONFIG_INVALID: "CONFIG_INVALID",
  MODEL_NOT_FOUND: "MODEL_NOT_FOUND",
  DATASET_NOT_FOUND: "DATASET_NOT_FOUND",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  RATE_LIMITED: "RATE_LIMITED",
  WEBSOCKET_CONNECTION_FAILED: "WEBSOCKET_CONNECTION_FAILED",
} as const;

// Rate limiting
export const RATE_LIMITS = {
  TRAINING_START: 5, // 5 training starts per minute
  API_REQUESTS: 100, // 100 API requests per minute
  WEBSOCKET_CONNECTIONS: 10, // 10 WebSocket connections per user
} as const;

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  WEBSOCKET_CONNECTION: 10000, // 10 seconds
  TRAINING_START: 60000, // 1 minute
} as const;
