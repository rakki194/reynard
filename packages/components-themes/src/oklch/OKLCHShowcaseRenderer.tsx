/**
 * OKLCH Showcase Renderer
 * Simple wrapper for the OKLCH showcase sections
 */

import { Component } from "solid-js";
import { ShowcaseSections } from "./OKLCHShowcaseSections";
import type { OKLCHState } from "./useOKLCHState";
import type { OKLCHShowcaseState } from "./OKLCHShowcaseLogic";

interface ColorVariations {
  base: string;
  lighter: string;
  darker: string;
  moreSaturated: string;
  lessSaturated: string;
  complementary: string;
  triadic1: string;
  triadic2: string;
}

interface GradientDemoItem {
  name: string;
  gradient: string;
}

interface OKLCHShowcaseRendererProps {
  state: OKLCHState;
  showcaseState: OKLCHShowcaseState;
  computedValues: {
    availableThemes: string[];
    sampleTags: string[];
    currentOKLCH: () => string;
    colorVariations: () => ColorVariations;
    animatedPalette: () => string[];
    themeTagColors: () => {
      tag: string;
      colors: { theme: any; color: any }[];
    }[];
    gradientDemos: () => GradientDemoItem[];
  };
}

export const OKLCHShowcaseRenderer: Component<OKLCHShowcaseRendererProps> = (
  props,
) => {
  return (
    <section class="oklch-showcase">
      <ShowcaseSections
        state={props.state}
        computedValues={props.computedValues}
        animationFrame={props.showcaseState.animationFrame}
      />
    </section>
  );
};
