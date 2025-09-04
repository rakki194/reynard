/**
 * ThemeCard Component
 * Individual theme preview card with color swatches
 */

import { Component } from "solid-js";

interface ThemeCardProps {
  name: string;
  description: string;
  isActive: boolean;
  onSelect: () => void;
}

export const ThemeCard: Component<ThemeCardProps> = (props) => {
  const getThemeEmoji = () => {
    switch (props.name) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "banana":
        return "🍌";
      case "strawberry":
        return "🍓";
      case "peanut":
        return "🥜";
      default:
        return "🎨";
    }
  };

  const getThemeColors = () => {
    // These are the colors from each theme for preview
    const colors: Record<string, string[]> = {
      light: [
        "hsl(270deg 60% 60%)",
        "hsl(220deg 20% 95%)",
        "hsl(240deg 15% 12%)",
      ],
      dark: [
        "hsl(270deg 60% 70%)",
        "hsl(220deg 15% 8%)",
        "hsl(220deg 20% 95%)",
      ],
      banana: [
        "hsl(45deg 100% 45%)",
        "hsl(50deg 40% 95%)",
        "hsl(30deg 15% 15%)",
      ],
      strawberry: [
        "hsl(350deg 70% 55%)",
        "hsl(350deg 30% 95%)",
        "hsl(350deg 15% 15%)",
      ],
      peanut: [
        "hsl(30deg 60% 50%)",
        "hsl(35deg 25% 93%)",
        "hsl(25deg 15% 15%)",
      ],
    };
    return colors[props.name] || ["#666", "#eee", "#333"];
  };

  return (
    <div
      class={`theme-card ${props.isActive ? "active" : ""}`}
      onClick={props.onSelect}
    >
      <div class="theme-header">
        <span class="theme-emoji">{getThemeEmoji()}</span>
        <h3 class="theme-name">{props.name}</h3>
        {props.isActive && <span class="active-badge">Active</span>}
      </div>

      <p class="theme-description">{props.description}</p>

      <div class="color-swatches">
        {getThemeColors().map((color, index) => (
          <div
            class="color-swatch"
            style={{ "background-color": color }}
            title={`Color ${index + 1}`}
          ></div>
        ))}
      </div>

      <div class="theme-preview">
        <div class="preview-button">Button</div>
        <div class="preview-input">Input field</div>
        <div class="preview-text">Sample text</div>
      </div>

      <button class="select-button" disabled={props.isActive}>
        {props.isActive ? "Current Theme" : "Select Theme"}
      </button>
    </div>
  );
};


