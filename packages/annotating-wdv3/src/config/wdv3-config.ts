/**
 * WDv3 Configuration
 *
 * Configuration schema and defaults for the WDv3 generator.
 * This package now only provides configuration - actual generation
 * is handled by the FastAPI backend.
 */

export const WDV3_CONFIG_SCHEMA = {
  type: "object",
  properties: {
    threshold: {
      type: "number",
      minimum: 0,
      maximum: 1,
      default: 0.35,
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
      default: 30,
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
    include_style_tags: {
      type: "boolean",
      default: true,
      description: "Include art style tags",
    },
  },
  additionalProperties: false,
};

export const WDV3_DEFAULT_CONFIG = {
  threshold: 0.35,
  force_cpu: false,
  batch_size: 1,
  max_tags: 30,
  include_ratings: true,
  include_character_tags: true,
  include_artist_tags: true,
  include_style_tags: true,
};

export const WDV3_METADATA = {
  name: "wdv3",
  description:
    "WDv3 - Danbooru-style tagging model for anime and manga artwork",
  version: "1.0.0",
  caption_type: "tags",
  model_category: "lightweight",
  model_path: "SmilingWolf/wd-v1-4-vit-tagger-v2",
  model_size: "~500MB",
  supported_formats: ["jpg", "jpeg", "png", "webp"],
  max_resolution: "1024x1024",
  average_processing_time: "0.3-1.5 seconds",
  memory_usage: "~1.5GB VRAM",
  specialized_for: ["anime", "manga", "danbooru_style"],
  accuracy: "90%+ for anime content",
};

export const WDV3_FEATURES = [
  "anime_specialized",
  "danbooru_style",
  "high_accuracy",
  "gpu_acceleration",
  "batch_processing",
  "configurable_threshold",
  "rating_detection",
  "character_recognition",
  "artist_recognition",
  "style_recognition",
];
