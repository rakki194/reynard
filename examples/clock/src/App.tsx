/**
 * Reynard Clock App - Main Application Component
 * A comprehensive clock, timer, alarm, and countdown application
 */

import {
  Component,
  createSignal,
  Show,
} from "solid-js";
import {
  ThemeProvider,
  NotificationsProvider,
  createTheme,
  createNotifications,
  useTheme,
} from "@reynard/core";
import { Clock } from "./components/Clock";
import { Timer } from "./components/Timer";
import { Alarm } from "./components/Alarm";
import { Countdown } from "./components/Countdown";
import { ThemeToggle } from "./components/ThemeToggle";

type TabType = "clock" | "timer" | "alarm" | "countdown";

const ClockApp: Component = () => {
  const [activeTab, setActiveTab] = createSignal<TabType>("clock");
  const { theme } = useTheme();

  const tabs = [
    { id: "clock" as TabType, label: "Clock", icon: "🕐" },
    { id: "timer" as TabType, label: "Timer", icon: "⏱️" },
    { id: "alarm" as TabType, label: "Alarm", icon: "⏰" },
    { id: "countdown" as TabType, label: "Countdown", icon: "⏳" },
  ];

  const renderActiveTab = () => {
    switch (activeTab()) {
      case "clock":
        return <Clock />;
      case "timer":
        return <Timer />;
      case "alarm":
        return <Alarm />;
      case "countdown":
        return <Countdown />;
      default:
        return <Clock />;
    }
  };

  return (
    <div class="app">
      <header class="app-header">
        <h1>🦊 Reynard Clock App</h1>
        <p>Clock, Timer, Alarm & Countdown - Built with Reynard Framework</p>
        <div class="header-controls">
          <div class="theme-info">
            Current theme: {theme()}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main class="app-main">
        <div class="tab-navigation">
          {tabs.map((tab) => (
            <button
              class={`tab-button ${activeTab() === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span class="icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <Show when={activeTab()}>
          {renderActiveTab()}
        </Show>
      </main>
    </div>
  );
};

const App: Component = () => {
  const themeModule = createTheme();
  const notificationsModule = createNotifications();

  return (
    <ThemeProvider value={themeModule}>
      <NotificationsProvider value={notificationsModule}>
        <ClockApp />
      </NotificationsProvider>
    </ThemeProvider>
  );
};

export default App;
