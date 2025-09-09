/**
 * Reynard Starter App
 * Modern showcase of the Reynard framework's capabilities
 */

import { Component, createSignal, createEffect } from "solid-js";
import { NotificationsProvider, createNotifications } from "reynard-core";
import { ReynardProvider } from "reynard-themes";
import {
  AppHeader,
  HeroSection,
  InteractiveDashboard,
  IconGallery,
  ThemeShowcase,
  OKLCHColorDemo,
  ComponentPlayground,
  AppFooter,
  NotificationToast,
} from "reynard-components";
import { OKLCHShowcasePage } from "./pages/OKLCHShowcasePage";
import { ChartsShowcasePage } from "./pages/ChartsShowcasePage";
import { ThreeDShowcasePage } from "./pages/ThreeDShowcasePage";
import "./styles/app.css";
import "./styles/oklch-demo.css";
import "./styles/oklch-showcase.css";
import "./styles/charts-showcase.css";
import "./styles/threed-showcase.css";

const AppContent: Component = () => {
  const [currentPage, setCurrentPage] = createSignal("home");

  // Handle hash-based routing
  createEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setCurrentPage(hash || "home");
    };

    // Set initial page
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  });

  return (
    <div class="app">
      {currentPage() === "oklch-showcase" ? (
        <OKLCHShowcasePage />
      ) : currentPage() === "charts-showcase" ? (
        <ChartsShowcasePage />
      ) : currentPage() === "threed-showcase" ? (
        <ThreeDShowcasePage />
      ) : (
        <>
          <AppHeader />
          <main class="app-main">
            <section id="hero">
              <HeroSection />
            </section>
            <section id="dashboard">
              <InteractiveDashboard />
            </section>
            <section id="icons">
              <IconGallery />
            </section>
            <section id="themes">
              <ThemeShowcase />
            </section>
            <section id="oklch-demo">
              <OKLCHColorDemo />
            </section>
            <section id="playground">
              <ComponentPlayground />
            </section>
          </main>
          <AppFooter />
        </>
      )}
    </div>
  );
};

const App: Component = () => {
  const notificationsModule = createNotifications();

  return (
    <ReynardProvider>
      <NotificationsProvider value={notificationsModule}>
        <NotificationToast />
        <AppContent />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
