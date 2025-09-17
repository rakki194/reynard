/**
 * Tag Input Section Component
 * Handles tag name input and intensity control
 */

import { Component, Accessor, Setter } from "solid-js";
import { Slider } from "reynard-components-core/primitives";
import "./TagComponents.css";

interface TagInputSectionProps {
  tagInput: Accessor<string>;
  setTagInput: Setter<string>;
  intensity: Accessor<number>;
  setIntensity: Setter<number>;
}

export const TagInputSection: Component<TagInputSectionProps> = (props) => {
  return (
    <div class="tag-input-section">
      <input
        type="text"
        placeholder="Enter tag name"
        value={props.tagInput()}
        onInput={(e) => props.setTagInput(e.target.value)}
      />
      <Slider
        min={0.1}
        max={2.0}
        step={0.1}
        value={props.intensity()}
        onChange={props.setIntensity}
        aria-label="Color intensity"
      />
      <span>Intensity: {props.intensity()}</span>
    </div>
  );
};
