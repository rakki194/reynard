/**
 * JTP2 Configuration
 *
 * Configuration schema and defaults for the JTP2 generator.
 * This package now only provides configuration - actual generation
 * is handled by the FastAPI backend.
 */

export const JTP2_CONFIG_SCHEMA = {
  type: "object",
  properties: {
    threshold: {
      type: "number",
      minimum: 0,
      maximum: 1,
      default: 0.2,
      description: "Confidence threshold for tag inclusion",
    },
    force_cpu: {
      type: "boolean",
      default: false,
      description: "Force CPU usage instead of GPU",
    },
    batch_size: {
      type: "integer",
      minimum: 1,
      maximum: 32,
      default: 1,
      description: "Batch size for processing",
    },
    max_tags: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 20,
      description: "Maximum number of tags to return",
    },
    include_ratings: {
      type: "boolean",
      default: true,
      description: "Include rating tags (safe, questionable, explicit)",
    },
    include_character_tags: {
      type: "boolean",
      default: true,
      description: "Include character identification tags",
    },
    include_artist_tags: {
      type: "boolean",
      default: true,
      description: "Include artist identification tags",
    },
  },
  additionalProperties: false,
};

export const JTP2_DEFAULT_CONFIG = {
  threshold: 0.2,
  force_cpu: false,
  batch_size: 1,
  max_tags: 20,
  include_ratings: true,
  include_character_tags: true,
  include_artist_tags: true,
};

export const JTP2_METADATA = {
  name: "jtp2",
  description: "Joint Tagger Project PILOT2 - Specialized for furry artwork tagging",
  version: "1.0.0",
  caption_type: "tags",
  model_category: "lightweight",
  model_path: "RedRocket/JointTaggerProject/JTP_PILOT2",
  model_size: "~400MB",
  supported_formats: ["jpg", "jpeg", "png", "webp"],
  max_resolution: "1024x1024",
  average_processing_time: "0.5-2.0 seconds",
  memory_usage: "~2GB VRAM",
  specialized_for: ["furry", "anthro", "digital_art"],
  accuracy: "95%+ for furry content",
};

export const JTP2_FEATURES = [
  "furry_specialized",
  "high_accuracy",
  "gpu_acceleration",
  "batch_processing",
  "configurable_threshold",
  "rating_detection",
  "character_recognition",
  "artist_recognition",
];
