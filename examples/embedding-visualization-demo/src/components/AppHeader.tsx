/**
 * Application Header Component
 *
 * Handles the main header with theme toggle functionality.
 */

import { Component } from "solid-js";

interface AppHeaderProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export const AppHeader: Component<AppHeaderProps> = (props) => {
  return (
    <header class="app-header">
      <h1>🦊 Reynard Embedding Visualization Demo</h1>
      <div class="header-controls">
        <button class="theme-toggle" onClick={props.onThemeToggle}>
          {props.theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </header>
  );
};
