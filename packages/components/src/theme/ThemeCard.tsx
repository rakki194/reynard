/**
 * Theme Card Component
 * Individual theme preview card with interactive preview
 */

import { Component, createEffect, createUniqueId } from "solid-js";
import { type ThemeConfig } from "reynard-themes";
import "./theme-showcase.css";

interface ThemeCardProps {
  themeConfig: ThemeConfig;
  isActive: boolean;
  isPreviewing: boolean;
  onThemeChange: (themeName: string) => void;
  onPreviewTheme: (themeName: string) => void;
  onStopPreview: () => void;
}

const ThemePreview: Component = () => (
  <div class="theme-preview">
    <div class="theme-preview-header">
      <div class="theme-dots">
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </div>
      <span class="theme-preview-title">Preview</span>
    </div>
    <div class="theme-preview-content">
      <div class="theme-color-strip">
        <div class="color-bar" />
        <div class="color-bar" />
        <div class="color-bar" />
        <div class="color-bar" />
      </div>
      <div class="theme-preview-elements">
        <div class="preview-button">Button</div>
        <div class="preview-card">
          <div class="preview-text">Sample text</div>
        </div>
      </div>
    </div>
  </div>
);

const ThemeInfo: Component<{ themeConfig: ThemeConfig }> = (props) => (
  <div class="theme-info">
    <h4 class="theme-name">{props.themeConfig.displayName}</h4>
    <p class="theme-description">{props.themeConfig.description}</p>
  </div>
);

export const ThemeCard: Component<ThemeCardProps> = (props) => {
  const cardId = createUniqueId();
  const cardElementId = `theme-card-${cardId}`;

  createEffect(() => {
    const cardElement = document.getElementById(cardElementId);
    if (cardElement) {
      cardElement.style.setProperty(
        "--preview-primary-color",
        props.themeConfig.colors.primary,
      );
      cardElement.style.setProperty(
        "--preview-accent-color",
        props.themeConfig.colors.accent,
      );
      cardElement.style.setProperty(
        "--preview-background-color",
        props.themeConfig.colors.background,
      );
      cardElement.style.setProperty(
        "--preview-surface-color",
        props.themeConfig.colors.surface,
      );
      cardElement.style.setProperty(
        "--preview-text-color",
        props.themeConfig.colors.text,
      );
      cardElement.style.setProperty(
        "--preview-border-color",
        props.themeConfig.colors.border,
      );
      cardElement.style.setProperty(
        "--preview-dot-color",
        props.themeConfig.colors.text,
      );
      cardElement.style.setProperty(
        "--preview-bg",
        props.themeConfig.colors.background,
      );
    }
  });

  return (
    <div
      id={cardElementId}
      class={`theme-card ${props.isActive ? "active" : ""} ${props.isPreviewing ? "previewing" : ""}`}
      onClick={() => props.onThemeChange(props.themeConfig.name)}
      onMouseEnter={() => props.onPreviewTheme(props.themeConfig.name)}
      onMouseLeave={() => props.onStopPreview()}
    >
      <ThemePreview />
      <ThemeInfo themeConfig={props.themeConfig} />
    </div>
  );
};
