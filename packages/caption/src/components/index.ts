/**
 * Caption Components Barrel Export
 *
 * Provides clean API boundaries for caption-specific components.
 */

// Core Caption Components
export { CaptionGenerator } from "./CaptionGenerator";
export { CaptionGeneratorView } from "./CaptionGeneratorView";
export { CaptionGeneratorComponents } from "./CaptionGeneratorComponents";
export { CaptionGeneratorControls } from "./CaptionGeneratorControls";
export { CaptionGeneratorResults } from "./CaptionGeneratorResults";
export { CaptionInput } from "./CaptionInput";

// Text Components
export { TextEditor } from "./TextEditor";
export { TextFileCard } from "./TextFileCard";
export { TextFilesGrid } from "./TextFilesGrid";
export { TextFileUpload } from "./TextFileUpload";
export { TextGrid } from "./TextGrid";

// Tag Management Components
export { TagAutocomplete } from "./TagAutocomplete";
export { TagBubble } from "./TagBubble";
export { TagManagement } from "./TagManagement";

// JSON/TOML Editors
export { JSONEditor } from "./JSONEditor";
export { JSONEditorComponents } from "./JSONEditorComponents";
export { TOMLEditor } from "./TOMLEditor";

// Re-export types for convenience
export type {
  TextFile,
  TextMetadata,
  TextGridState,
  TextProcessingOptions,
  TextGridProps,
  TextFileCardProps,
  TextEditorProps,
} from "../types/TextTypes";
