/**
 * Caption Generator Results Component
 *
 * Results display for the caption generator.
 */
import { Show } from "solid-js";
import { GenerationResults } from "./CaptionGeneratorComponents";
export const CaptionGeneratorResults = (props) => {
    return (<Show when={props.state.result()}>
      <GenerationResults result={props.state.result()} selectedModel={props.state.selectedModel()} captionData={null}/>
    </Show>);
};
