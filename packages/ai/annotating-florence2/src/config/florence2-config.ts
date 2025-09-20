/**
 * Florence2 Configuration
 *
 * Configuration schema and defaults for the Florence2 generator.
 * This package now only provides configuration - actual generation
 * is handled by the FastAPI backend.
 */

export const FLORENCE2_CONFIG_SCHEMA = {
  type: "object",
  properties: {
    task: {
      type: "string",
      enum: ["caption", "dense_caption", "object_detection", "visual_question_answering"],
      default: "caption",
      description: "Task type for Florence2",
    },
    max_length: {
      type: "integer",
      minimum: 10,
      maximum: 300,
      default: 100,
      description: "Maximum caption length",
    },
    num_beams: {
      type: "integer",
      minimum: 1,
      maximum: 10,
      default: 3,
      description: "Number of beams for beam search",
    },
    temperature: {
      type: "number",
      minimum: 0.1,
      maximum: 2.0,
      default: 1.0,
      description: "Sampling temperature",
    },
    include_objects: {
      type: "boolean",
      default: true,
      description: "Include object detection in captions",
    },
    include_relationships: {
      type: "boolean",
      default: true,
      description: "Include object relationships",
    },
  },
  additionalProperties: false,
};

export const FLORENCE2_DEFAULT_CONFIG = {
  task: "caption",
  max_length: 100,
  num_beams: 3,
  temperature: 1.0,
  include_objects: true,
  include_relationships: true,
};

export const FLORENCE2_METADATA = {
  name: "florence2",
  description: "Florence2 - General purpose vision-language model for image understanding",
  version: "1.0.0",
  caption_type: "caption",
  model_category: "heavy",
  model_path: "microsoft/Florence-2-base",
  model_size: "~1.5GB",
  supported_formats: ["jpg", "jpeg", "png", "webp"],
  max_resolution: "1024x1024",
  average_processing_time: "2-5 seconds",
  memory_usage: "~3GB VRAM",
  specialized_for: ["general", "object_detection", "visual_qa"],
  accuracy: "85%+ for general content",
};

export const FLORENCE2_FEATURES = [
  "general_purpose",
  "object_detection",
  "visual_question_answering",
  "dense_captioning",
  "relationship_detection",
  "configurable_tasks",
  "beam_search",
  "temperature_control",
];
