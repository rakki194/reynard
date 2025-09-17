/**
 * Task and result interfaces for Reynard annotation system
 *
 * This module re-exports the core interfaces for caption generation
 * tasks and their results from ai-shared to ensure consistency.
 */

// Re-export types from ai-shared to maintain consistency
export type { CaptionTask, CaptionResult, CaptionType } from "reynard-ai-shared";

// Re-export the enum for backward compatibility
export { CaptionType } from "reynard-ai-shared";
