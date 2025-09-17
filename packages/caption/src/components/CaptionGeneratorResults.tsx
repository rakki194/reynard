/**
 * Caption Generator Results Component
 *
 * Results display for the caption generator.
 */

import { Component, Show } from "solid-js";
import { GenerationResults } from "./CaptionGeneratorComponents";
import type { CaptionGeneratorState } from "../composables";

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
