/**
 * Caption Generator View Component
 *
 * The view layer for the caption generator, separated to keep
 * the main component under the 140-line limit.
 */

import { Component } from "solid-js";
import { ModelSelection, ImageUpload } from "./CaptionGeneratorComponents";
import { CaptionGeneratorControls } from "./CaptionGeneratorControls";
import { CaptionGeneratorResults } from "./CaptionGeneratorResults";
import type { CaptionGeneratorState, CaptionGeneratorHandlers } from "../composables";

export interface CaptionGeneratorViewProps {
  state: CaptionGeneratorState;
  handlers: CaptionGeneratorHandlers;
  class?: string;
  fileInputRef: HTMLInputElement | undefined;
}

export const CaptionGeneratorView: Component<CaptionGeneratorViewProps> = props => {
  return (
    <div class={`caption-generator ${props.class || ""}`}>
      <div class="generator-header">
        <h3 class="generator-title">Caption Generator</h3>
        <p class="generator-description">Generate captions and tags for your images using AI models</p>
      </div>

      <div class="generator-content">
        <ModelSelection
          generators={props.state.availableGenerators()}
          selectedModel={props.state.selectedModel()}
          onModelSelect={props.state.setSelectedModel}
        />

        <ImageUpload
          imagePreview={props.state.imagePreview()}
          imageFile={props.state.imageFile()}
          isDragOver={props.state.isDragOver()}
          onFileSelect={props.handlers.handleFileSelect}
          onDragOver={props.handlers.handleDragOver}
          onDragLeave={props.handlers.handleDragLeave}
          onDrop={props.handlers.handleDrop}
          onFileInputClick={() => props.fileInputRef?.click()}
          fileInputRef={props.fileInputRef}
        />

        <CaptionGeneratorControls state={props.state} handlers={props.handlers} />

        <CaptionGeneratorResults state={props.state} />
      </div>
    </div>
  );
};
