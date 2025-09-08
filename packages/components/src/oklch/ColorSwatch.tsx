/**
 * Color Swatch Component
 * Reusable color display with dynamic background
 */

import { Component, createEffect } from "solid-js";

interface ColorSwatchProps {
  color: string;
  size: "small" | "large";
  ref?: (el: HTMLDivElement) => void;
}

export const ColorSwatch: Component<ColorSwatchProps> = (props) => {
  let swatchRef: HTMLDivElement | undefined;

  // Helper function to set CSS custom properties
  const setCSSProperty = (element: HTMLElement, property: string, value: string) => {
    element.style.setProperty(property, value);
  };

  // Update color when it changes
  createEffect(() => {
    if (swatchRef) {
      setCSSProperty(swatchRef, '--dynamic-bg-color', props.color);
    }
  });

  return (
    <div 
      ref={(el) => {
        swatchRef = el;
        props.ref?.(el);
      }}
      class={`color-swatch ${props.size}`}
      data-background-color={props.color}
    />
  );
};
