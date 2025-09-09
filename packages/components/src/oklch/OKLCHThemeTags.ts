/**
 * OKLCH Theme Tag Colors
 * Generates theme-specific tag colors using the themes package
 */

import { createMemo, type Accessor } from "solid-js";
import { createTagColorGenerator } from "reynard-color-media";
import { getAvailableThemes, type ThemeName } from "reynard-themes";

export interface ThemeTagsState {
  tagIntensity: Accessor<number>;
}

export const createThemeTags = (state: ThemeTagsState) => {
  // Sample tags for demonstration
  const sampleTags = [
    "javascript",
    "typescript",
    "react",
    "solidjs",
    "oklch",
    "design-system",
    "accessibility",
    "performance",
    "modern",
    "innovative",
    "beautiful",
    "functional",
  ];

  // Get available themes from the themes package
  const availableThemes = getAvailableThemes().map(
    (theme) => theme.name as ThemeName,
  );

  // Generate theme-specific tag colors
  const themeTagColors = createMemo(() => {
    return sampleTags.map((tag) => ({
      tag,
      colors: availableThemes.map((theme) => {
        const generator = createTagColorGenerator();
        return {
          theme,
          color: generator.getTagColor(theme, tag, state.tagIntensity()),
        };
      }),
    }));
  });

  return {
    sampleTags,
    availableThemes,
    themeTagColors,
  };
};
