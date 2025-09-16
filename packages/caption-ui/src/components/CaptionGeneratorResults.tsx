/**
 * Caption Generator Results Component
 *
 * Results display for the caption generator.
 */

import type { CaptionGeneratorState } from "reynard-caption-core";
import { Component, Show } from "solid-js";
import { GenerationResults } from "./CaptionGeneratorComponents";

export interface CaptionGeneratorResultsProps {
  state: CaptionGeneratorState;
}

export const CaptionGeneratorResults: Component<CaptionGeneratorResultsProps> = props => {
  return (
    <Show when={props.state.result()}>
      <GenerationResults
        result={props.state.result()!}
        selectedModel={props.state.selectedModel()}
        captionData={null}
      />
    </Show>
  );
};
