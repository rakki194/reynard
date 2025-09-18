/**
 * Reynard Algorithm Benchmark Demo - AABB Collision Detection & Performance
 * Showcasing the power of our algorithms package with interactive physics demos
 */

import { Component, createSignal, createContext, useContext } from "solid-js";
import { ReynardProvider } from "reynard-themes";
import { NotificationsProvider, useNotifications, createNotifications } from "reynard-core";
import { AppHeader } from "./components/AppHeader";
import { AppMain } from "./components/AppMain";
import { AppFooter } from "./components/AppFooter";

// Demo types
export type DemoType =
  | "aabb-collision"
  | "spatial-optimization"
  | "performance-benchmark"
  | "interactive-physics"
  | "none";

interface DemoStats {
  [key: string]: unknown;
}

interface DemoContextType {
  currentDemo: () => DemoType;
  setCurrentDemo: (demo: DemoType) => void;
  demoStats: () => DemoStats;
  setDemoStats: (stats: DemoStats) => void;
}

const DemoContext = createContext<DemoContextType>();

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoContext.Provider");
  }
  return context;
};

const DemoApp: Component = () => {
  const [currentDemo, setCurrentDemo] = createSignal<DemoType>("none");
  const [demoStats, setDemoStats] = createSignal<DemoStats>({});
  const { notify } = useNotifications();

  const handleDemoSelect = (demo: DemoType) => {
    setCurrentDemo(demo);
    setDemoStats({});
    notify(`🦦 Starting ${demo.replace("-", " ")} demo!`, "success");
  };

  const handleStatsUpdate = (stats: unknown) => {
    setDemoStats(stats as DemoStats);
  };

  const demoContext: DemoContextType = {
    currentDemo,
    setCurrentDemo,
    demoStats,
    setDemoStats,
  };

  return (
    <DemoContext.Provider value={demoContext}>
      <div class="app">
        <AppHeader demoStats={demoStats} />
        <AppMain
          currentDemo={currentDemo}
          onDemoSelect={handleDemoSelect}
          onStatsUpdate={handleStatsUpdate}
          onBackToMenu={() => setCurrentDemo("none")}
        />
        <AppFooter />
      </div>
    </DemoContext.Provider>
  );
};

const App: Component = () => {
  const notificationsModule = createNotifications();

  return (
    <ReynardProvider defaultLocale="en" defaultTheme="light">
      <NotificationsProvider value={notificationsModule}>
        <DemoApp />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
