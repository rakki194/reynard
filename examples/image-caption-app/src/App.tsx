/**
 * Image Caption App - Reynard Framework Example
 * Demonstrates AI-powered caption generation with comprehensive Reynard features
 */

import { Component, createResource } from "solid-js";
import { ReynardProvider, useTheme } from "reynard-themes";
import {
  NotificationsProvider,
  useNotifications,
  createNotificationsModule,
} from "reynard-core";
import { ThemeToggle } from "./components/ThemeToggle";
import { LanguageSelector } from "./components/LanguageSelector";
import { AppContent } from "./components/AppContent";
import { useAppState } from "./composables/useAppState";
import { useWorkflow } from "./composables/useWorkflow";
import { useAppHandlers } from "./composables/useAppHandlers";
import { AppLogicService } from "./services/appLogic";
import "reynard-themes/reynard-themes.css";
import "./styles.css";

const App: Component = () => {
  const appState = useAppState();
  const workflow = useWorkflow();
  const themeContext = useTheme();
  const { notify } = useNotifications();

  const appLogic = new AppLogicService(appState.backendUrl());
  const handlers = useAppHandlers(appState, workflow, appLogic, notify);

  // Initialize backend connection
  const initializeBackend = async () => {
    try {
      const success = await appLogic.initializeBackend();
      if (success) {
        await handlers.updateSystemStats();
        notify("Connected to Reynard backend successfully!", "success");
      } else {
        throw new Error("Backend connection failed");
      }
    } catch (error) {
      notify("Failed to connect to backend - using offline mode", "error");
      console.error("Backend connection failed:", error);
    }
  };

  // Initialize on mount
  createResource(() => initializeBackend());

  return (
    <div class="app">
      <header class="app-header">
        <div class="header-content">
          <h1>🦊 Image Caption App</h1>
          <p>AI-powered caption generation with Reynard framework</p>
          <div class="header-controls">
            <div class="theme-info">Current theme: {themeContext.theme}</div>
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <AppContent appState={appState} workflow={workflow} handlers={handlers} />
    </div>
  );
};

const AppWithProviders: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <App />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default AppWithProviders;
