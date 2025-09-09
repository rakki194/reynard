/**
 * Reynard Algorithm Benchmark Demo - AABB Collision Detection & Performance
 * Showcasing the power of our algorithms package with interactive physics demos
 */

import {
  Component,
  createSignal,
  createContext,
  useContext,
  ParentComponent,
} from "solid-js";
import { ReynardProvider, useTheme } from "reynard-themes";
import {
  NotificationsProvider,
  useNotifications,
  createNotifications,
} from "reynard-core";
import { DemoSelector } from "./components/DemoSelector";
import { ThemeToggle } from "./components/ThemeToggle";
import { DemoContainer } from "./components/DemoContainer";
import { DemoInfo } from "./components/DemoInfo";

// Demo types
export type DemoType =
  | "aabb-collision"
  | "spatial-optimization"
  | "performance-benchmark"
  | "interactive-physics"
  | "none";

interface DemoContextType {
  currentDemo: () => DemoType;
  setCurrentDemo: (demo: DemoType) => void;
  demoStats: () => any;
  setDemoStats: (stats: any) => void;
}

const DemoContext = createContext<DemoContextType>();

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
};

const DemoProvider: ParentComponent<{ value: DemoContextType }> = (props) => {
  return (
    <DemoContext.Provider value={props.value}>
      {props.children}
    </DemoContext.Provider>
  );
};

const DemoApp: Component = () => {
  const [currentDemo, setCurrentDemo] = createSignal<DemoType>("none");
  const [demoStats, setDemoStats] = createSignal({});
  const _themeContext = useTheme();
  const { notify } = useNotifications();

  const demoContext: DemoContextType = {
    currentDemo,
    setCurrentDemo,
    demoStats,
    setDemoStats,
  };

  const handleDemoSelect = (demo: DemoType) => {
    setCurrentDemo(demo);
    setDemoStats({});
    notify(`🦦 Starting ${demo.replace("-", " ")} demo!`, "success");
  };

  const handleStatsUpdate = (stats: any) => {
    setDemoStats(stats);
  };

  return (
    <DemoProvider value={demoContext}>
      <div class="app">
        <header class="app-header">
          <div class="header-content">
            <h1>
              <span class="reynard-logo">🦦</span>
              Reynard Algorithm Bench
            </h1>
            <p>AABB Collision Detection & Performance Optimization Demos</p>
            <div class="header-controls">
              <ThemeToggle />
              <div class="stats-display">
                <span class="stats-label">Performance:</span>
                <span class="stats-value">{JSON.stringify(demoStats())}</span>
              </div>
            </div>
          </div>
        </header>

        <main class="app-main">
          {currentDemo() === "none" ? (
            <div class="demo-selection">
              <DemoSelector onDemoSelect={handleDemoSelect} />
              <DemoInfo />
            </div>
          ) : (
            <DemoContainer
              demo={currentDemo()}
              onStatsUpdate={handleStatsUpdate}
              onBackToMenu={() => setCurrentDemo("none")}
            />
          )}
        </main>

        <footer class="app-footer">
          <p>
            Built with 🦊 Reynard Framework •
            <a
              href="https://github.com/your-org/reynard"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </DemoProvider>
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
