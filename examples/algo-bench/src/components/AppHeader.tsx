/**
 * App Header Component - Displays the main application header with controls
 */

import { Component } from "solid-js";
import { ThemeToggle } from "./ThemeToggle";

interface DemoStats {
  [key: string]: unknown;
}

interface AppHeaderProps {
  demoStats: () => DemoStats;
}

export const AppHeader: Component<AppHeaderProps> = props => {
  return (
    <header class="app-header">
      <div class="header-content">
        <h1>
          <span class="reynard-logo">🦦</span>
          Reynard Algorithm Bench
        </h1>
        <p>AABB Collision Detection & Performance Optimization Demos</p>
        <div class="header-controls">
          <ThemeToggle />
          <div class="stats-display">
            <span class="stats-label">Performance:</span>
            <span class="stats-value">{JSON.stringify(props.demoStats())}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
