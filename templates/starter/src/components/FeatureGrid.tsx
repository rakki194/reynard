/**
 * FeatureGrid Component
 * Displays the main framework features in a grid layout
 */

import { Component, createSignal } from "solid-js";
import { useNotifications } from "reynard-core";
import { useTheme } from "reynard-themes";
import { FeatureCard } from "./FeatureCard";
import { NotificationDemo } from "./NotificationDemo";
import { Counter } from "./Counter";

export const FeatureGrid: Component = () => {
  const { theme } = useTheme();
  const { notify } = useNotifications();
  const [count, setCount] = createSignal(0);

  const handleWelcome = () => {
    notify(`Welcome to Reynard! Current theme: ${theme}`, "success");
  };

  return (
    <div class="feature-grid">
      <FeatureCard
        icon="palette"
        title="Theme System"
        description="8 built-in themes with reactive state management"
      >
        <p>
          Current theme: <strong>{theme}</strong>
        </p>
      </FeatureCard>

      <FeatureCard
        icon="alert"
        title="Notifications"
        description="Toast notifications with auto-dismiss and grouping"
      >
        <NotificationDemo />
      </FeatureCard>

      <FeatureCard
        icon="puzzle-piece"
        title="Modular Architecture"
        description="Zero-dependency modules under 100 lines each"
      >
        <Counter count={count()} setCount={setCount} />
      </FeatureCard>

      <FeatureCard
        icon="rocket"
        title="Performance"
        description="Optimized builds with lazy loading and tree shaking"
      >
        <button class="button" onClick={handleWelcome}>
          Test Performance
        </button>
      </FeatureCard>
    </div>
  );
};

