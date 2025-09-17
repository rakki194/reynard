/**
 * OKLCH Color Showcase
 * A comprehensive demonstration of Reynard's OKLCH color capabilities
 * Showcasing perceptual uniformity, theme generation, and advanced color manipulation
 */

import { Component } from "solid-js";
import { createOKLCHShowcaseLogic, type OKLCHShowcaseState } from "./OKLCHShowcaseLogic";
import { useAnimation } from "./useAnimation";
import { useOKLCHState } from "./useOKLCHState";
import { OKLCHShowcaseRenderer } from "./OKLCHShowcaseRenderer";

export const OKLCHShowcase: Component = () => {
  // State management
  const state = useOKLCHState();

  // Animation state
  const animationFrame = useAnimation(state.animationSpeed);

  // Create showcase state object
  const showcaseState: OKLCHShowcaseState = {
    selectedHue: state.selectedHue,
    selectedLightness: state.selectedLightness,
    selectedChroma: state.selectedChroma,
    animationFrame,
    animationSpeed: state.animationSpeed,
    customTag: state.customTag,
    tagIntensity: state.tagIntensity,
  };

  // Get computed values from logic module
  const computedValues = createOKLCHShowcaseLogic(showcaseState);

  return <OKLCHShowcaseRenderer state={state} showcaseState={showcaseState} computedValues={computedValues} />;
};
