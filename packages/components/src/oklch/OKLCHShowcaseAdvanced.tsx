/**
 * OKLCH Showcase Advanced Components
 * Advanced features and theme components for the OKLCH showcase
 */

import { Component } from "solid-js";
import {
  ThemeComparison,
  CustomTagGenerator,
  OKLCHAdvancedFeatures as AdvancedFeatures
} from "./";
import type { OKLCHState } from "./useOKLCHState";
import type { OKLCHColor } from "reynard-color-media";

interface TagColorData {
  theme: string;
  color: OKLCHColor;
}

interface TagData {
  tag: string;
  colors: TagColorData[];
}

interface AdvancedComponentsProps {
  state: OKLCHState;
  computedValues: {
    availableThemes: string[];
    themeTagColors: () => TagData[];
  };
}

export const AdvancedComponents: Component<AdvancedComponentsProps> = (props) => {
  return (
    <>
      <ThemeComparison
        availableThemes={props.computedValues.availableThemes}
        selectedTheme={props.state.selectedTheme()}
        themeTagColors={props.computedValues.themeTagColors()}
        onThemeChange={(theme) => {
          props.state.setSelectedTheme(theme as "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut");
          props.state.themeContext.setTheme(theme as "light" | "dark" | "gray" | "banana" | "strawberry" | "peanut");
        }}
      />

      <CustomTagGenerator
        availableThemes={props.computedValues.availableThemes}
        customTag={props.state.customTag()}
        tagIntensity={props.state.tagIntensity()}
        onTagChange={props.state.setCustomTag}
        onIntensityChange={props.state.setTagIntensity}
      />

      <AdvancedFeatures
        showAdvanced={props.state.showAdvanced()}
        onToggleAdvanced={() => props.state.setShowAdvanced(!props.state.showAdvanced())}
      />
    </>
  );
};

export { AdvancedComponents as OKLCHShowcaseAdvanced };
