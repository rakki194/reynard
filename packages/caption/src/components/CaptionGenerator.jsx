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
import { createEffect } from "solid-js";
import { useCaptionGeneratorBackend, useCaptionGeneratorHandlers, useCaptionGeneratorState } from "../composables";
import "./CaptionGenerator.css";
import { CaptionGeneratorView } from "./CaptionGeneratorView";
export const CaptionGenerator = props => {
    // Initialize composables
    const state = useCaptionGeneratorState();
    let backend;
    let handlers;
    // Track reactive props and recreate backend and handlers when they change
    createEffect(() => {
        backend = useCaptionGeneratorBackend(state, props.backendConfig);
        handlers = useCaptionGeneratorHandlers(state, backend.manager, props.onCaptionGenerated, props.onGenerationError);
    });
    let fileInputRef;
    return (<CaptionGeneratorView state={state} handlers={handlers} class={props.className} fileInputRef={fileInputRef}/>);
};
