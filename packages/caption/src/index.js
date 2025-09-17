/**
 * Reynard Caption Package
 *
 * Caption generation and text editing components for Reynard applications.
 *
 * Note: Audio, video, image, and multimodal components have been moved to
 * dedicated packages:
 * - Audio components: reynard-audio
 * - Video components: reynard-video
 * - Image components: reynard-image
 * - Multimodal components: reynard-multimodal
 * - Model management: reynard-model-management
 */
// Main exports
export { TagBubble } from "./components/TagBubble.js";
export { CaptionInput } from "./components/CaptionInput.js";
export { JSONEditor } from "./components/JSONEditor.jsx";
export { TOMLEditor } from "./components/TOMLEditor.js";
export { TagManagement } from "./components/TagManagement.js";
export { TagAutocomplete } from "./components/TagAutocomplete.js";
export { CaptionGenerator } from "./components/CaptionGenerator.js";
// Type exports
export * from "./types/index.js";
// Utility exports
export * from "./utils/index.js";
// Composable exports
export * from "./composables/index.js";
// Re-export everything for convenience
export * from "./components/index.js";
