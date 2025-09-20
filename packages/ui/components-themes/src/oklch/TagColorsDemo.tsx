/**
 * Tag Colors Demo Component
 * Demonstrates dynamic tag color generation
 */

import { Component, createSignal } from "solid-js";
import { TagInputSection } from "./TagInputSection";
import { TagDisplay } from "./TagDisplay";
import { SampleTags } from "./SampleTags";
import "./TagComponents.css";

export const TagColorsDemo: Component = () => {
  const [tagInput, setTagInput] = createSignal("react");
  const [intensity, setIntensity] = createSignal(1.0);

  return (
    <div class="tag-colors-demo">
      <h3>Dynamic Tag Colors</h3>

      <TagInputSection
        tagInput={tagInput}
        setTagInput={setTagInput}
        intensity={intensity}
        setIntensity={setIntensity}
      />

      <TagDisplay tagName={tagInput} intensity={intensity} />

      <SampleTags />
    </div>
  );
};
