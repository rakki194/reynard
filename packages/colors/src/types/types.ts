/**
 * Type definitions for color and media utilities
 */

/**
 * OKLCH color representation
 * OKLCH provides perceptually uniform color space suitable for theming
 */
export interface OKLCHColor {
  /** Lightness percentage (0-100) */
  l: number;
  /** Chroma (0-0.4 typically) */
  c: number;
  /** Hue (0-360) */
  h: number;
}

/**
 * Theme names for color generation
 */
export type ThemeName =
  | "dark"
  | "light"
  | "gray"
  | "banana"
  | "strawberry"
  | "peanut";

/**
 * Represents a content modality (image, video, text, audio, etc.)
 */
export interface Modality {
  /** Unique identifier for the modality */
  id: string;
  /** Human-readable name */
  name: string;
  /** Icon identifier for the modality */
  icon: string;
  /** Description of the modality */
  description: string;
  /** Whether this modality is currently enabled */
  enabled: boolean;
  /** File extensions supported by this modality */
  fileExtensions: string[];
  /** Functionalities that work with this modality */
  supportedFunctionalities: string[];
  /** Component to render for this modality */
  component: any;
  /** Validation function for files */
  validateFile: (file: File) => boolean;
  /** Get supported file types */
  getSupportedFileTypes: () => string[];
}

/**
 * Props passed to modality components
 */
export interface ModalityProps {
  /** The modality instance */
  modality: Modality;
  /** Whether the modality is active */
  isActive: boolean;
  /** Function to activate this modality */
  activate: () => void;
  /** Function to deactivate this modality */
  deactivate: () => void;
  /** Current path */
  path: string;
  /** Additional props */
  [key: string]: any;
}

/**
 * Predefined modality IDs
 */
export const MODALITY_IDS = {
  IMAGE: "image",
  VIDEO: "video",
  TEXT: "text",
  AUDIO: "audio",
  CODE: "code",
  LORA: "lora",
} as const;

/**
 * Predefined functionality IDs
 */
export const FUNCTIONALITY_IDS = {
  SCRIPT_EDITING: "script-editing",
  CODE_EDITOR: "code-editor",
  LORA_ANALYSIS: "lora-analysis",
  BATCH_PROCESSING: "batch-processing",
  DATA_ANALYSIS: "data-analysis",
  EXPORT: "export",
  IMPORT: "import",
  RAG: "rag",
} as const;

/**
 * Type for modality ID
 */
export type ModalityId = (typeof MODALITY_IDS)[keyof typeof MODALITY_IDS];

/**
 * Type for functionality ID
 */
export type FunctionalityId =
  (typeof FUNCTIONALITY_IDS)[keyof typeof FUNCTIONALITY_IDS];

// Media item interfaces have been moved to their respective packages:
// - AudioItem -> reynard-audio
// - VideoItem -> reynard-video
// - ImageItem -> reynard-image
