/**
 * AppHeader Component
 * Modern header with navigation and theme selector
 */

import { Component, createSignal, For, createEffect, createMemo } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { useTheme, getAvailableThemes } from "reynard-themes";
import { useNotifications } from "reynard-core";
import type { ThemeName } from "reynard-themes";

export const AppHeader: Component = () => {
  // Use createMemo to defer context access and handle errors gracefully
  const themeContext = createMemo(() => {
    try {
      return useTheme();
    } catch (error) {
      console.error("AppHeader: Theme context not available", error);
      // Return a fallback theme context
      return {
        theme: "light" as ThemeName,
        setTheme: (theme: ThemeName) => {
          console.warn("Theme context not available, cannot set theme:", theme);
        },
        getTagStyle: () => ({}),
        isDark: false,
        isHighContrast: false
      };
    }
  });
  
  const notifications = createMemo(() => {
    try {
      return useNotifications();
    } catch (error) {
      console.error("AppHeader: Notifications context not available", error);
      return {
        notify: (message: string, type?: string) => {
          console.warn("Notifications context not available:", message, type);
        }
      };
    }
  });
  
  const notify = createMemo(() => notifications().notify);
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  
  const availableThemes = getAvailableThemes();

  // Debug logging to track theme changes
  createEffect(() => {
    console.log("AppHeader - Current theme:", themeContext().theme);
    console.log("AppHeader - Available themes:", availableThemes);
  });

  const handleThemeChange = (themeName: string) => {
    themeContext().setTheme(themeName as ThemeName);
    notify()(`Switched to ${themeName} theme!`, "info");
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "oklch-showcase" || sectionId === "charts-showcase" || sectionId === "threed-showcase") {
      // Navigate to dedicated showcase pages
      window.location.hash = sectionId;
      setIsMenuOpen(false);
    } else {
      // Scroll to section on current page
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <header class="app-header">
      <div class="header-content">
        <div class="header-brand">
          <div class="brand-logo">
            {fluentIconsPackage.getIcon("fox") && (
              <div
                class="logo-icon"
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("fox")?.outerHTML}
              />
            )}
          </div>
          <div class="brand-text">
            <h1 class="brand-title">Reynard</h1>
            <span class="brand-subtitle">Starter Template</span>
          </div>
        </div>

        <nav class="header-nav">
          <button 
            class="nav-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen())}
            aria-label="Toggle navigation menu"
          >
            {fluentIconsPackage.getIcon(isMenuOpen() ? "dismiss" : "menu") && (
              <span
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon(isMenuOpen() ? "dismiss" : "menu")?.outerHTML}
              />
            )}
          </button>
          
          <div class={`nav-menu ${isMenuOpen() ? 'open' : ''}`}>
            <button class="nav-link" onClick={() => scrollToSection("hero")}>
              Home
            </button>
            <button class="nav-link" onClick={() => scrollToSection("dashboard")}>
              Dashboard
            </button>
            <button class="nav-link" onClick={() => scrollToSection("icons")}>
              Icons
            </button>
            <button class="nav-link" onClick={() => scrollToSection("themes")}>
              Themes
            </button>
            <button class="nav-link" onClick={() => scrollToSection("oklch-demo")}>
              OKLCH Colors
            </button>
            <button class="nav-link" onClick={() => scrollToSection("oklch-showcase")}>
              OKLCH Showcase
            </button>
            <button class="nav-link" onClick={() => scrollToSection("charts-showcase")}>
              Charts Showcase
            </button>
            <button class="nav-link" onClick={() => scrollToSection("threed-showcase")}>
              3D Showcase
            </button>
            <button class="nav-link" onClick={() => scrollToSection("playground")}>
              Playground
            </button>
          </div>
        </nav>

        <div class="header-actions">
          <div class="theme-quick-select">
            <select
              value={themeContext().theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              class="theme-select"
              title="Quick theme switch"
            >
              <For each={availableThemes}>
                {(themeConfig) => (
                  <option value={themeConfig.name}>{themeConfig.displayName}</option>
                )}
              </For>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

