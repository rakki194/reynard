/**
 * Multi-Theme Gallery - Reynard Framework Theming Showcase
 * Demonstrates advanced theming capabilities and component variations
 */

import { Component, createSignal, For } from "solid-js";
import {
  ThemeProvider,
  NotificationsProvider,
  createTheme,
  createNotifications,
  useTheme,
  useNotifications,
} from "@reynard/core";
import { ThemeCard } from "./components/ThemeCard";
import { ComponentShowcase } from "./components/ComponentShowcase";
import { ThemeComparison } from "./components/ThemeComparison";
import "./styles.css";

const ThemeGallery: Component = () => {
  const [activeView, setActiveView] = createSignal<
    "gallery" | "showcase" | "comparison"
  >("gallery");
  const { theme, themes, setTheme } = useTheme();
  const { notify } = useNotifications();

  const handleThemeSelect = (themeName: string) => {
    setTheme(themeName as any);
    notify(`Switched to ${themeName} theme`, "success");
  };

  const getThemeDescription = (themeName: string) => {
    const descriptions: Record<string, string> = {
      light: "Clean and bright for daytime productivity",
      dark: "Easy on the eyes for focused work",
      banana: "Warm and cheerful like a sunny day",
      strawberry: "Vibrant and energetic pink vibes",
      peanut: "Earthy and cozy autumn feels",
    };
    return descriptions[themeName] || "A beautiful theme";
  };

  return (
    <div class="theme-gallery">
      <header class="gallery-header">
        <div class="header-content">
          <h1>🎨 Reynard Theme Gallery</h1>
          <p>Explore the beautiful theming system with live previews</p>

          <nav class="view-selector">
            <button
              class={`view-btn ${activeView() === "gallery" ? "active" : ""}`}
              onClick={() => setActiveView("gallery")}
            >
              🖼️ Gallery
            </button>
            <button
              class={`view-btn ${activeView() === "showcase" ? "active" : ""}`}
              onClick={() => setActiveView("showcase")}
            >
              🧩 Components
            </button>
            <button
              class={`view-btn ${activeView() === "comparison" ? "active" : ""}`}
              onClick={() => setActiveView("comparison")}
            >
              ⚖️ Compare
            </button>
          </nav>
        </div>
      </header>

      <main class="gallery-main">
        {activeView() === "gallery" && (
          <div class="themes-grid">
            <For each={themes}>
              {(themeName) => (
                <ThemeCard
                  name={themeName}
                  description={getThemeDescription(themeName)}
                  isActive={theme() === themeName}
                  onSelect={() => handleThemeSelect(themeName)}
                />
              )}
            </For>
          </div>
        )}

        {activeView() === "showcase" && <ComponentShowcase />}

        {activeView() === "comparison" && <ThemeComparison />}
      </main>

      <footer class="gallery-footer">
        <p>
          Current theme: <strong>{theme()}</strong> •{themes.length} themes
          available • Built with Reynard framework
        </p>
      </footer>
    </div>
  );
};

const App: Component = () => {
  const themeModule = createTheme();
  const notificationsModule = createNotifications();

  return (
    <ThemeProvider value={themeModule}>
      <NotificationsProvider value={notificationsModule}>
        <ThemeGallery />
      </NotificationsProvider>
    </ThemeProvider>
  );
};

export default App;
