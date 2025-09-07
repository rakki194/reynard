/**
 * AppHeader Component
 * Displays the main application header with logo and theme selector
 */

import { Component } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ThemeSelector } from "./ThemeSelector";

export const AppHeader: Component = () => {
  return (
    <header class="app-header">
      <h1>
        <span class="reynard-logo">
          {fluentIconsPackage.getIcon("yipyap") && (
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("yipyap")?.outerHTML}
            />
          )}
        </span>
        Reynard Starter
      </h1>
      <p>A cunning SolidJS framework for modern web applications</p>
      <ThemeSelector />
    </header>
  );
};

