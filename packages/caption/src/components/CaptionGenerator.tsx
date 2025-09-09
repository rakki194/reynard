/**
 * Caption Generator Component
 *
 * Interactive caption generation interface that integrates with the backend
 * annotation system. Provides model selection, image upload, and real-time
 * caption generation with progress tracking.
 *
 * Features:
 * - Model selection with availability checking
 * - Image upload with drag-and-drop support
 * - Real-time generation progress
 * - Multiple caption types (tags, detailed, general)
 * - Integration with existing BackendAnnotationManager
 */

import { Component, createEffect } from "solid-js";
import { type CaptionResult } from "reynard-annotating";
import { CaptionGeneratorView } from "./CaptionGeneratorView";
import { 
  useCaptionGeneratorState, 
  useCaptionGeneratorHandlers, 
  useCaptionGeneratorBackend 
} from "../composables";
import "./CaptionGenerator.css";

export interface CaptionGeneratorProps {
  /** Initial image path (optional) */
  initialImagePath?: string;
  /** Callback when caption is generated */
  onCaptionGenerated?: (result: CaptionResult) => void;
  /** Callback when generation fails */
  onGenerationError?: (error: Error) => void;
  /** Backend configuration */
  backendConfig?: {
    baseUrl: string;
    apiKey?: string;
  };
  /** Whether to show advanced options */
  showAdvanced?: boolean;
  /** Custom CSS class */
  className?: string;
}


export const CaptionGenerator: Component<CaptionGeneratorProps> = (props) => {
  // Initialize composables
  const state = useCaptionGeneratorState();
  
  let backend: ReturnType<typeof useCaptionGeneratorBackend>;
  let handlers: ReturnType<typeof useCaptionGeneratorHandlers>;
  
  // Track reactive props and recreate backend and handlers when they change
  createEffect(() => {
    backend = useCaptionGeneratorBackend(state, props.backendConfig);
    handlers = useCaptionGeneratorHandlers(
      state, 
      backend.manager, 
      props.onCaptionGenerated, 
      props.onGenerationError
    );
  });

  let fileInputRef: HTMLInputElement | undefined;

  return (
    <CaptionGeneratorView
      state={state}
      handlers={handlers!}
      class={props.className}
      fileInputRef={fileInputRef}
    />
  );
};
