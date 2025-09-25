/**
 * Reynard Error Demo - Main Application Component
 * A comprehensive error boundary demonstration with backend integration
 */

import { Component, createSignal, Show, createEffect, For } from "solid-js";
import { NotificationsProvider, createNotifications } from "reynard-core";
import { ErrorBoundary, useErrorReporting } from "reynard-error-boundaries";
import { ReynardProvider, useTheme, getAvailableThemes, type ThemeName } from "reynard-themes";

// Icon props interface
interface IconProps {
  size?: number;
  class?: string;
  style?: string;
  [key: string]: unknown;
}

// Simple icon components for demo
const Bug = (props: IconProps) => <span {...props}>🐛</span>;
const Shield = (props: IconProps) => <span {...props}>🛡️</span>;
const Settings = (props: IconProps) => <span {...props}>⚙️</span>;
const CheckmarkCircle = (props: IconProps) => <span {...props}>✅</span>;
const Warning = (props: IconProps) => <span {...props}>⚠️</span>;
const Info = (props: IconProps) => <span {...props}>ℹ️</span>;
const ArrowClockwise = (props: IconProps) => <span {...props}>🔄</span>;
const Database = (props: IconProps) => <span {...props}>🗄️</span>;
const Zap = (props: IconProps) => <span {...props}>⚡</span>;

type DemoMode = "overview" | "errors" | "recovery" | "analytics";

const DemoContent: Component = () => {
  const { theme, setTheme } = useTheme();
  const availableThemes = getAvailableThemes();
  const [demoMode, setDemoMode] = createSignal<DemoMode>("overview");
  const [backendStatus, setBackendStatus] = createSignal<"connected" | "disconnected" | "checking">("checking");
  const [analytics, setAnalytics] = createSignal<{
    total_errors?: number;
    recovery_attempts?: number;
    [key: string]: unknown;
  } | null>(null);

  // Error reporting setup
  const { reportError } = useErrorReporting({
    enabled: true,
    endpoint: "/api/reports/error",
    batchSize: 5,
    flushInterval: 10000,
    includeStackTrace: true,
    includeUserContext: true,
    filters: [],
  });

  // Check backend status
  createEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          setBackendStatus("connected");
          // Load initial analytics
          loadAnalytics();
        } else {
          setBackendStatus("disconnected");
        }
      } catch (error) {
        setBackendStatus("disconnected");
        console.error("Backend connection failed:", error);
      }
    };
    checkBackend();
  });

  const loadAnalytics = async () => {
    try {
      const [errorResponse, recoveryResponse] = await Promise.all([
        fetch("/api/analytics/errors"),
        fetch("/api/analytics/recovery"),
      ]);

      if (errorResponse.ok && recoveryResponse.ok) {
        const errorData = await errorResponse.json();
        const recoveryData = await recoveryResponse.json();
        setAnalytics({ ...errorData, ...recoveryData });
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  const resetDemo = async () => {
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      await loadAnalytics();
    } catch (error) {
      console.error("Failed to reset demo:", error);
    }
  };

  return (
    <div class="app">
      <header class="app-header">
        <div class="header-content">
          <div class="header-title">
            <Bug size={32} />
            <h1>Reynard Error Boundary Demo</h1>
          </div>
          <p>Comprehensive error handling demonstration with recovery strategies and analytics</p>
          <div class="header-controls">
            <div class="theme-info">
              <Settings size={16} />
              <span>Theme: {theme}</span>
            </div>
            <div class="theme-info">
              <Database size={16} />
              <span>Backend: {backendStatus()}</span>
            </div>
            <div class="theme-info">
              <select
                value={theme}
                onChange={e => setTheme((e.target as HTMLSelectElement).value as ThemeName)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  padding: "0.25rem",
                  "border-radius": "4px",
                }}
                title="Select theme"
              >
                <For each={availableThemes}>
                  {themeOption => <option value={themeOption.name}>{themeOption.displayName}</option>}
                </For>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main class="app-main">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error("Root error boundary caught error:", error, errorInfo);
            reportError(error, {
              component: "App",
              route: demoMode(),
              timestamp: Date.now(),
            });
          }}
        >
          {() => (
            <>
              {/* Navigation */}
              <div class="demo-actions" style={{ "margin-bottom": "2rem", "justify-content": "center" }}>
                <button
                  class={`btn ${demoMode() === "overview" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setDemoMode("overview")}
                >
                  <Info size={16} />
                  Overview
                </button>
                <button
                  class={`btn ${demoMode() === "errors" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setDemoMode("errors")}
                >
                  <Bug size={16} />
                  Error Demos
                </button>
                <button
                  class={`btn ${demoMode() === "recovery" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setDemoMode("recovery")}
                >
                  <ArrowClockwise size={16} />
                  Recovery
                </button>
                <button
                  class={`btn ${demoMode() === "analytics" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setDemoMode("analytics")}
                >
                  <Database size={16} />
                  Analytics
                </button>
                <button class="btn btn-warning" onClick={resetDemo}>
                  <ArrowClockwise size={16} />
                  Reset Demo
                </button>
              </div>

              {/* Demo Content */}
              <Show
                when={demoMode() === "overview"}
                fallback={
                  <Show
                    when={demoMode() === "errors"}
                    fallback={
                      <Show
                        when={demoMode() === "recovery"}
                        fallback={
                          <Show when={demoMode() === "analytics"}>
                            <div class="error-demo-container">
                              <h2>Analytics Dashboard</h2>
                              <p>Error analytics and recovery statistics will be displayed here.</p>
                              <Show when={analytics()}>
                                <div class="analytics-grid">
                                  <div class="analytics-card">
                                    <h4>Total Errors</h4>
                                    <div class="value">{analytics()?.total_errors || 0}</div>
                                  </div>
                                  <div class="analytics-card">
                                    <h4>Recovery Attempts</h4>
                                    <div class="value">{analytics()?.recovery_attempts || 0}</div>
                                  </div>
                                </div>
                              </Show>
                            </div>
                          </Show>
                        }
                      >
                        <div class="error-demo-container">
                          <h2>Recovery Strategy Demonstrations</h2>
                          <p>Test various recovery strategies and see how they handle different error scenarios.</p>
                          <div class="demo-actions">
                            <button class="btn btn-primary">Test Retry Strategy</button>
                            <button class="btn btn-secondary">Test Reset Strategy</button>
                            <button class="btn btn-warning">Test Fallback Strategy</button>
                          </div>
                        </div>
                      </Show>
                    }
                  >
                    <div class="error-demo-container">
                      <h2>Error Boundary Demonstrations</h2>
                      <p>Test various error scenarios and see how the error boundary system handles them.</p>
                      <div class="demo-actions">
                        <button class="btn btn-primary">Simulate Network Error</button>
                        <button class="btn btn-warning">Simulate Timeout Error</button>
                        <button class="btn btn-danger">Simulate Critical Error</button>
                      </div>
                    </div>
                  </Show>
                }
              >
                <div class="demo-grid">
                  <div class="demo-card">
                    <h3>
                      <Bug size={24} />
                      Error Boundaries
                    </h3>
                    <p>
                      Comprehensive error boundary system with automatic error classification, severity assessment, and
                      recovery strategies.
                    </p>
                    <div class="demo-actions">
                      <button class="btn btn-primary" onClick={() => setDemoMode("errors")}>
                        <Bug size={16} />
                        Try Error Demos
                      </button>
                    </div>
                  </div>

                  <div class="demo-card">
                    <h3>
                      <ArrowClockwise size={24} />
                      Recovery Strategies
                    </h3>
                    <p>
                      Built-in recovery mechanisms including retry, reset, fallback UI, redirect, and reload strategies
                      with priority-based execution.
                    </p>
                    <div class="demo-actions">
                      <button class="btn btn-primary" onClick={() => setDemoMode("recovery")}>
                        <ArrowClockwise size={16} />
                        Test Recovery
                      </button>
                    </div>
                  </div>

                  <div class="demo-card">
                    <h3>
                      <Database size={24} />
                      Error Analytics
                    </h3>
                    <p>
                      Real-time error reporting, analytics, and monitoring with filtering, batching, and external
                      service integration.
                    </p>
                    <div class="demo-actions">
                      <button class="btn btn-primary" onClick={() => setDemoMode("analytics")}>
                        <Database size={16} />
                        View Analytics
                      </button>
                    </div>
                  </div>

                  <div class="demo-card">
                    <h3>
                      <Shield size={24} />
                      Error Classification
                    </h3>
                    <p>
                      Automatic error categorization by type (network, rendering, validation, auth, permission,
                      resource, timeout) and severity levels.
                    </p>
                    <div class="demo-actions">
                      <button class="btn btn-info" onClick={() => setDemoMode("errors")}>
                        <Shield size={16} />
                        See Classification
                      </button>
                    </div>
                  </div>

                  <div class="demo-card">
                    <h3>
                      <Zap size={24} />
                      Performance
                    </h3>
                    <p>
                      Optimized error handling with minimal performance impact, efficient recovery strategies, and smart
                      error reporting.
                    </p>
                    <div class="demo-actions">
                      <button class="btn btn-success" onClick={() => setDemoMode("analytics")}>
                        <Zap size={16} />
                        View Performance
                      </button>
                    </div>
                  </div>

                  <div class="demo-card">
                    <h3>
                      <Settings size={24} />
                      Configuration
                    </h3>
                    <p>
                      Highly configurable error boundaries with custom recovery strategies, error reporting endpoints,
                      and user-defined error handling.
                    </p>
                    <div class="demo-actions">
                      <button class="btn btn-secondary" onClick={() => setDemoMode("recovery")}>
                        <Settings size={16} />
                        Configure
                      </button>
                    </div>
                  </div>
                </div>

                {/* Backend Status */}
                <Show when={backendStatus() === "connected"}>
                  <div class="status-message status-success">
                    <CheckmarkCircle size={20} />
                    <span>Backend connected successfully. All error simulation endpoints are available.</span>
                  </div>
                </Show>

                <Show when={backendStatus() === "disconnected"}>
                  <div class="status-message status-error">
                    <Warning size={20} />
                    <span>
                      Backend disconnected. Error simulation features will not work. Make sure to start the backend
                      server.
                    </span>
                  </div>
                </Show>

                <Show when={backendStatus() === "checking"}>
                  <div class="status-message status-info">
                    <Info size={20} />
                    <span>Checking backend connection...</span>
                  </div>
                </Show>
              </Show>
            </>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
};

const App: Component = () => {
  const notificationsModule = createNotifications();

  return (
    <ReynardProvider>
      <NotificationsProvider value={notificationsModule}>
        <DemoContent />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
