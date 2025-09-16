/**
 * OKLCH Showcase Core Components
 * Core interactive components for the OKLCH showcase
 */

import { Component } from "solid-js";
import { ColorControls, ColorPreview, ColorWheel, GradientDemo } from "./";
import type { OKLCHState } from "./useOKLCHState";

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

interface CoreComponentsProps {
  state: OKLCHState;
  computedValues: {
    colorVariations: () => ColorVariations;
    animatedPalette: () => string[];
    gradientDemos: () => GradientDemoItem[];
  };
  animationFrame: () => number;
}

export const CoreComponents: Component<CoreComponentsProps> = (props) => {
  return (
    <>
      <ColorControls
        selectedHue={props.state.selectedHue()}
        selectedLightness={props.state.selectedLightness()}
        selectedChroma={props.state.selectedChroma()}
        animationSpeed={props.state.animationSpeed()}
        onHueChange={props.state.setSelectedHue}
        onLightnessChange={props.state.setSelectedLightness}
        onChromaChange={props.state.setSelectedChroma}
        onSpeedChange={props.state.setAnimationSpeed}
      />

      <ColorPreview
        colorVariations={props.computedValues.colorVariations()}
        selectedLightness={props.state.selectedLightness()}
        selectedChroma={props.state.selectedChroma()}
        selectedHue={props.state.selectedHue()}
      />

      <ColorWheel
        animatedPalette={props.computedValues.animatedPalette()}
        animationFrame={props.animationFrame()}
      />

      <GradientDemo gradientDemos={props.computedValues.gradientDemos()} />
    </>
  );
};

export { CoreComponents as OKLCHShowcaseCore };
