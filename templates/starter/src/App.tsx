/**
 * Reynard Starter App
 * Modern showcase of the Reynard framework's capabilities
 */

import { Component } from "solid-js";
import {
  NotificationsProvider,
  createNotifications,
} from "reynard-core";
import { ReynardProvider } from "reynard-themes";
import { AppHeader } from "./components/AppHeader";
import { HeroSection } from "./components/HeroSection";
import { InteractiveDashboard } from "./components/InteractiveDashboard";
import { IconGallery } from "./components/IconGallery";
import { ThemeShowcase } from "./components/theme-showcase/ThemeShowcase";
import { OKLCHColorDemo } from "./components/OKLCHColorDemo";
import { ComponentPlayground } from "./components/ComponentPlayground";
import { AppFooter } from "./components/AppFooter";
import { NotificationToast } from "./components/NotificationToast";
import "./styles/app.css";
import "./styles/oklch-demo.css";

const AppContent: Component = () => {
  return (
    <div class="app">
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
