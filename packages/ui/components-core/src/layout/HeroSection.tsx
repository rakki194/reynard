/**
 * Hero Section Component
 * Modern hero section showcasing Reynard's capabilities
 */

import { Component, createSignal, createEffect, For, createMemo } from "solid-js";
import { useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";
import { useNotifications } from "reynard-core";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const HeroSection: Component = () => {
  // Use createMemo to defer context access and handle errors gracefully
  const themeContext = createMemo(() => {
    try {
      return useTheme();
    } catch (error) {
      console.error("HeroSection: Theme context not available", error);
      // Return a fallback theme context
      return {
        theme: "light" as ThemeName,
        setTheme: (theme: ThemeName) => {
          console.warn("Theme context not available, cannot set theme:", theme);
        },
        getTagStyle: () => ({}),
        isDark: false,
        isHighContrast: false,
      };
    }
  });

  const notifications = createMemo(() => {
    try {
      return useNotifications();
    } catch (error) {
      console.error("HeroSection: Notifications context not available", error);
      return {
        notify: (message: string, type?: string) => {
          console.warn("Notifications context not available:", message, type);
        },
      };
    }
  });

  const notify = createMemo(() => notifications().notify);
  const [currentDemo, setCurrentDemo] = createSignal(0);

  const availableThemes = getAvailableThemes();

  const demos = [
    {
      icon: "dashboard",
      title: "Interactive Dashboard",
      description: "Real-time data visualization",
    },
    {
      icon: "chart",
      title: "Analytics",
      description: "Comprehensive metrics and insights",
    },
    {
      icon: "3d",
      title: "3D Visualization",
      description: "Immersive spatial experiences",
    },
    {
      icon: "flow",
      title: "Workflow Builder",
      description: "Visual process automation",
    },
  ];

  // Auto-rotate demos
  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % demos.length);
    }, 3000);

    return () => clearInterval(interval);
  });

  const handleGetStarted = () => {
    notify()("Welcome to Reynard! Let's build something amazing together! 🦊", "success");
  };

  const handleThemePreview = (themeName: string) => {
    console.log("HeroSection - Switching theme from", themeContext().theme, "to", themeName);
    themeContext().setTheme(themeName as ThemeName);
    notify()(`Switched to ${themeName} theme!`, "info");
  };

  // Debug logging to track theme changes
  createEffect(() => {
    console.log("HeroSection - Current theme:", themeContext().theme);
    console.log("HeroSection - Available themes:", availableThemes);
  });

  // Helper function to check if a theme is active
  const isActiveTheme = (themeName: string) => {
    const isActive = themeContext().theme === themeName;
    console.log(`HeroSection - isActiveTheme(${themeName}):`, isActive, "current theme:", themeContext().theme);
    return isActive;
  };

  return (
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="hero-logo">
              {fluentIconsPackage.getIcon("fox") && (
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("fox")?.outerHTML}
                />
              )}
            </span>
            Reynard Framework
          </h1>
          <p class="hero-subtitle">
            A cunning SolidJS framework for modern web applications. Built with modularity, performance, and developer
            experience in mind.
          </p>
          <div class="hero-actions">
            <button class="button button--primary" onClick={handleGetStarted}>
              {fluentIconsPackage.getIcon("rocket") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("rocket")?.outerHTML}
                />
              )}
              Get Started
            </button>
            <button class="button button--secondary">
              {fluentIconsPackage.getIcon("open") && (
                <span
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("open")?.outerHTML}
                />
              )}
              View Docs
            </button>
          </div>
        </div>

        <div class="hero-demo">
          <div class="demo-preview">
            <div class="demo-header">
              <div class="demo-dots">
                <span class="dot" />
                <span class="dot" />
                <span class="dot" />
              </div>
              <div class="demo-title">{demos[currentDemo()].title}</div>
            </div>
            <div class="demo-content">
              <div class="demo-icon">
                {fluentIconsPackage.getIcon(demos[currentDemo()].icon) && (
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon(demos[currentDemo()].icon)?.outerHTML}
                  />
                )}
              </div>
              <p class="demo-description">{demos[currentDemo()].description}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-themes">
        <h3>Try Different Themes</h3>
        <div class="theme-preview-grid">
          <For each={availableThemes}>
            {themeConfig => (
              <button
                class={`theme-preview ${isActiveTheme(themeConfig.name) ? "active" : ""}`}
                onClick={() => handleThemePreview(themeConfig.name)}
                title={`Switch to ${themeConfig.displayName}`}
              >
                <div class="theme-preview-colors">
                  <div class="color-swatch" style={`background: ${themeConfig.colors.primary}`} />
                  <div class="color-swatch" style={`background: ${themeConfig.colors.accent}`} />
                  <div class="color-swatch" style={`background: ${themeConfig.colors.background}`} />
                  <div class="color-swatch" style={`background: ${themeConfig.colors.surface}`} />
                </div>
                <span class="theme-preview-name">{themeConfig.displayName}</span>
              </button>
            )}
          </For>
        </div>
      </div>
    </section>
  );
};
