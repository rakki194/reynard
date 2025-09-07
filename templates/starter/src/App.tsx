/**
 * Reynard Starter App
 * Demonstrates the core features of the Reynard framework
 */

import { Component } from "solid-js";
import {
  NotificationsProvider,
  createNotifications,
} from "reynard-core";
import { ReynardProvider } from "reynard-themes";
import "reynard-themes/themes.css";
import { AppHeader } from "./components/AppHeader";
import { FeatureGrid } from "./components/FeatureGrid";
import { GettingStarted } from "./components/GettingStarted";
import { AppFooter } from "./components/AppFooter";
import { NotificationToast } from "./components/NotificationToast";
import "./styles/app.css";

const AppContent: Component = () => {
  return (
    <div class="app">
      <AppHeader />
      <main class="app-main">
        <section class="demo-section">
          <h2>Framework Features</h2>
          <FeatureGrid />
        </section>
        <GettingStarted />
      </main>
      <AppFooter />
    </div>
  );
};

const App: Component = () => {
  const notificationsModule = createNotifications();
  console.log("App - Creating ReynardProvider");

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
