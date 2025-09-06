/**
 * Reynard Starter App
 * Demonstrates the core features of the Reynard framework
 */

import { Component, createSignal } from "solid-js";
import {
  ThemeProvider,
  NotificationsProvider,
  createTheme,
  createNotifications,
  useTheme,
  useNotifications,
} from "reynard-core";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ThemeSelector } from "./components/ThemeSelector";
import { NotificationDemo } from "./components/NotificationDemo";
import { NotificationToast } from "./components/NotificationToast";
import { Counter } from "./components/Counter";
import "./styles/app.css";

const AppContent: Component = () => {
  const { theme } = useTheme();
  const { notify } = useNotifications();
  const [count, setCount] = createSignal(0);

  const handleWelcome = () => {
    notify(`Welcome to Reynard! Current theme: ${theme()}`, "success");
  };

  return (
    <div class="app">
      <header class="app-header">
        <h1>
          <span class="reynard-logo">
            {fluentIconsPackage.getIcon("yipyap") && (
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("yipyap")?.outerHTML}
              />
            )}
          </span>
          Reynard Starter
        </h1>
        <p>A cunning SolidJS framework for modern web applications</p>
        <ThemeSelector />
      </header>

      <main class="app-main">
        <section class="demo-section">
          <h2>Framework Features</h2>
          <div class="feature-grid">
            <div class="feature-card">
              <h3>
                <span class="feature-icon">
                  {fluentIconsPackage.getIcon("palette") && (
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={
                        fluentIconsPackage.getIcon("palette")?.outerHTML
                      }
                    />
                  )}
                </span>
                Theme System
              </h3>
              <p>8 built-in themes with reactive state management</p>
              <p>
                Current theme: <strong>{theme()}</strong>
              </p>
            </div>

            <div class="feature-card">
              <h3>
                <span class="feature-icon">
                  {fluentIconsPackage.getIcon("alert") && (
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon("alert")?.outerHTML}
                    />
                  )}
                </span>
                Notifications
              </h3>
              <p>Toast notifications with auto-dismiss and grouping</p>
              <NotificationDemo />
            </div>

            <div class="feature-card">
              <h3>
                <span class="feature-icon">
                  {fluentIconsPackage.getIcon("puzzle-piece") && (
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={
                        fluentIconsPackage.getIcon("puzzle-piece")?.outerHTML
                      }
                    />
                  )}
                </span>
                Modular Architecture
              </h3>
              <p>Zero-dependency modules under 100 lines each</p>
              <Counter count={count()} setCount={setCount} />
            </div>

            <div class="feature-card">
              <h3>
                <span class="feature-icon">
                  {fluentIconsPackage.getIcon("rocket") && (
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={
                        fluentIconsPackage.getIcon("rocket")?.outerHTML
                      }
                    />
                  )}
                </span>
                Performance
              </h3>
              <p>Optimized builds with lazy loading and tree shaking</p>
              <button class="button" onClick={handleWelcome}>
                Test Performance
              </button>
            </div>
          </div>
        </section>

        <section class="demo-section">
          <h2>Getting Started</h2>
          <div class="code-example">
            <pre>
              <code>{`// Create a new Reynard app
npx reynard-create-app my-app
cd my-app
npm run dev`}</code>
            </pre>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <p>Built with ❤️ using Reynard framework</p>
        <p>
          <a
            href="https://github.com/yourusername/reynard"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
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
        <NotificationToast />
        <AppContent />
      </NotificationsProvider>
    </ThemeProvider>
  );
};

export default App;
