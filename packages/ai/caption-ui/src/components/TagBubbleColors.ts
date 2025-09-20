/**
 * TagBubbleColors Composable
 *
 * Handles color generation and CSS custom property management for TagBubble.
 */

import { createEffect, createMemo } from "solid-js";
import { createTagColorGenerator, type TagColorOptions } from "../utils/tagColors.js";

export interface TagBubbleColorsConfig {
  tag: string;
  intensity?: number;
  variant?: string;
  theme?: any;
  tagBubbleRef: HTMLDivElement | undefined;
}

export function createTagBubbleColors(config: TagBubbleColorsConfig) {
  const { tag, intensity, variant, theme, tagBubbleRef } = config;

  const tagColorGenerator = createTagColorGenerator();

  // Enhanced OKLCH color generation with options
  const tagColorOptions: TagColorOptions = {
    intensity: () => intensity || 1.0,
    variant: () => variant || "default",
    theme: () => theme,
  };

  const tagColor = createMemo(() =>
    tagColorGenerator.getColor(tag, {
      intensity: tagColorOptions.intensity(),
      variant: tagColorOptions.variant(),
      theme: tagColorOptions.theme(),
    })
  );

  // Set CSS custom properties for dynamic styling with OKLCH support
  createEffect(() => {
    if (tagBubbleRef) {
      const color = tagColor();
      tagBubbleRef.style.setProperty("--tag-background-color", color.background);
      tagBubbleRef.style.setProperty("--tag-text-color", color.text);
      tagBubbleRef.style.setProperty("--tag-border-color", color.border);

      // Enhanced OKLCH hover and active states
      if (color.hover) {
        tagBubbleRef.style.setProperty("--tag-hover-color", color.hover);
      }
      if (color.active) {
        tagBubbleRef.style.setProperty("--tag-active-color", color.active);
      }
      if (color.focus) {
        tagBubbleRef.style.setProperty("--tag-focus-color", color.focus);
      }
    }
  });

  return {
    tagColor,
  };
}
