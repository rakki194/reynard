/**
 * Hero Section Component
 * Main hero section with animated color orb
 */

import { Component, createEffect } from "solid-js";

interface HeroSectionProps {
  colorVariations: {
    base: string;
    complementary: string;
  };
  animationFrame: number;
}

export const HeroSection: Component<HeroSectionProps> = (props) => {
  let colorOrbRef: HTMLDivElement | undefined;

  // Helper function to set CSS custom properties
  const setCSSProperty = (
    element: HTMLElement,
    property: string,
    value: string,
  ) => {
    element.style.setProperty(property, value);
  };

  // Update color orb styles when values change
  createEffect(() => {
    if (colorOrbRef) {
      setCSSProperty(colorOrbRef, "--base-color", props.colorVariations.base);
      setCSSProperty(
        colorOrbRef,
        "--complementary-color",
        props.colorVariations.complementary,
      );
      setCSSProperty(
        colorOrbRef,
        "--rotation",
        `${props.animationFrame * 2}deg`,
      );
      setCSSProperty(
        colorOrbRef,
        "--scale",
        (1 + Math.sin(props.animationFrame * 0.1) * 0.1).toString(),
      );
    }
  });

  return (
    <div class="showcase-hero">
      <div class="hero-content">
        <h1 class="hero-title">OKLCH Color Showcase</h1>
        <p class="hero-subtitle">
          Experience the power of perceptually uniform color space with
          Reynard's advanced OKLCH implementation. Watch as colors dance with
          mathematical precision and visual harmony.
        </p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">8</span>
            <span class="stat-label">Themes</span>
          </div>
          <div class="stat">
            <span class="stat-number">∞</span>
            <span class="stat-label">Colors</span>
          </div>
          <div class="stat">
            <span class="stat-number">100%</span>
            <span class="stat-label">Perceptual</span>
          </div>
        </div>
      </div>
      <div class="hero-visualization">
        <div ref={colorOrbRef} class="color-orb" />
      </div>
    </div>
  );
};
