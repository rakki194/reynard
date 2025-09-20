/**
 * Custom Tag Generator Component
 * Interactive tag color generation with custom inputs
 */
import { For, createEffect } from "solid-js";
import { createTagColorGenerator, formatOKLCH } from "reynard-colors";
import { Slider } from "reynard-components-core/primitives";
// Helper function to set CSS custom properties
const setCSSProperty = (element, property, value) => {
    element.style.setProperty(property, value);
};
// Helper function to update tag colors
const updateTagColors = (themes, customTag, tagIntensity, generatedTagsRef) => {
    const generator = createTagColorGenerator();
    themes.forEach((theme, index) => {
        const ref = generatedTagsRef[index];
        if (ref) {
            const color = generator.getTagColor(theme, customTag, tagIntensity);
            setCSSProperty(ref, "--dynamic-bg-color", formatOKLCH(color));
            setCSSProperty(ref, "--dynamic-text-color", color.l > 50 ? "#000" : "#fff");
        }
    });
};
// Tag Input Controls Component
const TagInputControls = props => (<div class="tag-inputs">
    <input type="text" placeholder="Enter tag name" value={props.customTag} onInput={e => props.onTagChange(e.target.value)} class="tag-input"/>
    <div class="intensity-control">
      <label for="tag-intensity-slider">Intensity: {props.tagIntensity.toFixed(1)}</label>
      <Slider id="tag-intensity-slider" min={0.1} max={2.0} step={0.1} value={props.tagIntensity} onChange={props.onIntensityChange} class="intensity-slider" aria-label="Tag intensity control"/>
    </div>
  </div>);
// Generated Tags Display Component
const GeneratedTagsDisplay = props => (<div class="generated-tags">
    <For each={props.availableThemes}>
      {(theme, index) => {
        const generator = createTagColorGenerator();
        const color = generator.getTagColor(theme, props.customTag, props.tagIntensity);
        return (<div ref={el => (props.generatedTagsRef[index()] = el)} class="generated-tag" data-background-color={formatOKLCH(color)} data-text-color={color.l > 50 ? "#000" : "#fff"}>
            {props.customTag} ({theme})
          </div>);
    }}
    </For>
  </div>);
export const CustomTagGenerator = props => {
    const generatedTagsRef = [];
    // Update generated tags
    createEffect(() => {
        updateTagColors(props.availableThemes, props.customTag, props.tagIntensity, generatedTagsRef);
    });
    return (<div class="custom-tag-section">
      <h2>Custom Tag Color Generator</h2>
      <div class="tag-generator">
        <TagInputControls customTag={props.customTag} tagIntensity={props.tagIntensity} onTagChange={props.onTagChange} onIntensityChange={props.onIntensityChange}/>
        <GeneratedTagsDisplay availableThemes={props.availableThemes} customTag={props.customTag} tagIntensity={props.tagIntensity} generatedTagsRef={generatedTagsRef}/>
      </div>
    </div>);
};
