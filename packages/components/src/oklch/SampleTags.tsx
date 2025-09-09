/**
 * Sample Tags Component
 * Displays a collection of sample tags with dynamic colors
 */

import { Component, For, createMemo } from "solid-js";
import { useTagColors, useTheme } from "reynard-themes";
import "./TagComponents.css";

export const SampleTags: Component = () => {
  const themeContext = useTheme();
  const tagColors = useTagColors();

  const sampleTags = [
    "react",
    "solidjs",
    "typescript",
    "oklch",
    "design-system",
    "accessibility",
  ];

  // Create reactive tag styles that update when theme changes
  const tagStyles = createMemo(() => {
    const currentTheme = themeContext.theme;
    console.log(`Computing tag styles for theme: ${currentTheme}`);
    return sampleTags.map((tag) => ({
      tag,
      style: tagColors.getTagStyle(tag),
    }));
  });

  return (
    <div class="sample-tags">
      <h4>Sample Tags</h4>

      <div class="tag-list">
        <For each={tagStyles()}>
          {(tagData) => {
            // Debug logging
            console.log(`Tag: ${tagData.tag}, Style:`, tagData.style);

            return (
              <div
                class="tag"
                ref={(el) => {
                  if (el) {
                    el.style.setProperty("--tag-bg", tagData.style["--tag-bg"]);
                    el.style.setProperty(
                      "--tag-color",
                      tagData.style["--tag-color"],
                    );
                  }
                }}
              >
                {tagData.tag}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
