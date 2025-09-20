/**
 * Color Wheel Component
 * Animated color wheel with dynamic palette
 */

import { Component, For, createEffect } from "solid-js";

interface ColorWheelProps {
  animatedPalette: string[];
  animationFrame: number;
}

export const ColorWheel: Component<ColorWheelProps> = props => {
  let centerOrbRef: HTMLDivElement | undefined;

  // Helper function to set CSS custom properties
  const setCSSProperty = (element: HTMLElement, property: string, value: string) => {
    element.style.setProperty(property, value);
  };

  // Update center orb
  createEffect(() => {
    if (centerOrbRef) {
      setCSSProperty(centerOrbRef, "--dynamic-palette", props.animatedPalette.join(", "));
    }
  });

  return (
    <div class="color-wheel-section">
      <h2>Animated Color Wheel</h2>
      <div class="wheel-container">
        <div class="color-wheel">
          <For each={props.animatedPalette}>
            {(color, index) => (
              <div
                class="wheel-segment"
                data-background-color={color}
                data-segment-index={index()}
                data-rotation={index() * 30}
              />
            )}
          </For>
        </div>
        <div class="wheel-center">
          <div ref={centerOrbRef} class="center-orb" data-palette-colors={props.animatedPalette.join(",")} />
        </div>
      </div>
    </div>
  );
};
