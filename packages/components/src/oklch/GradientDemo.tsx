/**
 * Gradient Demo Component
 * Shows OKLCH gradient examples
 */

import { Component, For, createEffect } from "solid-js";

interface GradientDemoItem {
  name: string;
  gradient: string;
}

interface GradientDemoProps {
  gradientDemos?: GradientDemoItem[];
}

export const GradientDemo: Component<GradientDemoProps> = (props) => {
  // Fallback gradients if no data is provided
  const defaultGradients: GradientDemoItem[] = [
    {
      name: "Primary → Accent",
      gradient: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 320))"
    },
    {
      name: "Success → Info", 
      gradient: "linear-gradient(45deg, oklch(0.6 0.15 140), oklch(0.7 0.12 240))"
    },
    {
      name: "Warning → Error",
      gradient: "linear-gradient(90deg, oklch(0.8 0.15 60), oklch(0.6 0.2 20))"
    }
  ];

  const gradients = () => props.gradientDemos || defaultGradients;

  // Apply gradients to elements using data attributes
  createEffect(() => {
    const gradientElements = document.querySelectorAll('[data-gradient]');
    gradientElements.forEach((element) => {
      const gradient = element.getAttribute('data-gradient');
      if (gradient) {
        (element as HTMLElement).style.background = gradient;
      }
    });
  });

  return (
    <div class="gradient-demo">
      <h3>OKLCH Gradients</h3>
      <div class="gradient-grid">
        <For each={gradients()}>
          {(gradient, index) => (
            <div 
              class="gradient-sample"
              data-gradient={gradient.gradient}
              data-index={index()}
            >
              {gradient.name}
            </div>
          )}
        </For>
      </div>
    </div>
  );
};