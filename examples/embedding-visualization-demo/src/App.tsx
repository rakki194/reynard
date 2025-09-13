/**
 * Embedding Visualization Demo Application
 *
 * Demonstrates the comprehensive embedding visualization system
 * with all components and features.
 */

import { Component, createSignal } from "solid-js";
import {
  AppHeader,
  DemoDescription,
  DemoInfo,
  AppFooter,
  EmbeddingChart,
} from "./components";

export const App: Component = () => {
  const [theme, setTheme] = createSignal<"light" | "dark">("dark");

  const handleThemeToggle = () => {
    setTheme(theme() === "dark" ? "light" : "dark");
  };

  return (
    <div class={`app ${theme()}`}>
      <AppHeader theme={theme()} onThemeToggle={handleThemeToggle} />

      <main class="app-main">
        <DemoDescription />

        <div class="dashboard-container">
          <EmbeddingChart
            theme={theme()}
            width={1200}
            height={400}
            class="demo-dashboard"
          />
        </div>

        <DemoInfo />
      </main>

      <AppFooter />
    </div>
  );
};
