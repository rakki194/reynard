/**
 * OKLCH Showcase Sections
 * Orchestrates the different sections of the OKLCH showcase
 */

import { Component } from "solid-js";
import { CoreComponents } from "./OKLCHShowcaseCore";
import { AdvancedComponents } from "./OKLCHShowcaseAdvanced";
import { DemoComponents } from "./OKLCHShowcaseDemo";
import type { OKLCHState } from "./useOKLCHState";

interface ShowcaseSectionsProps {
  state: OKLCHState;
  computedValues: {
    availableThemes: string[];
    colorVariations: () => any;
    animatedPalette: () => any;
    themeTagColors: () => any;
    gradientDemos: () => any;
  };
  animationFrame: () => number;
}

export const ShowcaseSections: Component<ShowcaseSectionsProps> = (props) => {
  const { state, computedValues, animationFrame } = props;

  return (
    <>
      <DemoComponents
        computedValues={computedValues}
        animationFrame={animationFrame}
      />

      <CoreComponents
        state={state}
        computedValues={computedValues}
        animationFrame={animationFrame}
      />

      <AdvancedComponents
        state={state}
        computedValues={computedValues}
      />
    </>
  );
};

export { ShowcaseSections as OKLCHShowcaseSections };
