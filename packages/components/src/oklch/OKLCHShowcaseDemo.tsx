/**
 * OKLCH Showcase Demo Components
 * Demo and showcase components for the OKLCH showcase
 */

import { Component } from "solid-js";
import { GoldenSpiralColors, GoldenAngleDemo } from "../utils";
import { OKLCHHeroSection as HeroSection, TechnicalInfo } from ".";

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

interface DemoComponentsProps {
  computedValues: {
    colorVariations: () => ColorVariations;
  };
  animationFrame: () => number;
}

export const DemoComponents: Component<DemoComponentsProps> = (props) => {
  return (
    <>
      <HeroSection
        colorVariations={props.computedValues.colorVariations()}
        animationFrame={props.animationFrame()}
      />

      <TechnicalInfo />

      <GoldenAngleDemo />
      <GoldenSpiralColors />
    </>
  );
};

export { DemoComponents as OKLCHShowcaseDemo };
