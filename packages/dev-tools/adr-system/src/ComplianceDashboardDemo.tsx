/**
 * 🦊 Compliance Dashboard Demo
 *
 * Demo component showcasing the Compliance Dashboard integration
 * with the Reynard project architecture system.
 */

import { Component, createSignal, onMount } from "solid-js";
import { ComplianceDashboard } from "./ComplianceDashboard";
import { Button } from "reynard-primitives";
import { Card } from "reynard-primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";

export const ComplianceDashboardDemo: Component = () => {
  const [isRunning, setIsRunning] = createSignal(false);
  const [demoConfig, setDemoConfig] = createSignal({
    refreshInterval: 10000, // 10 seconds for demo
    showTrends: true,
    showTeamMetrics: true,
    alertThresholds: {
      compliance: 75, // Lower threshold for demo
      performance: 80,
      security: 85,
    },
    theme: "auto" as const,
  });

  const handleViolationAlert = (violation: any) => {
    console.log("🚨 Violation Alert:", violation);
    // In a real app, this would show a notification
  };

  const handleComplianceChange = (score: any) => {
    console.log("📊 Compliance Score Updated:", score);
    // In a real app, this would update analytics
  };

  const startDemo = () => {
    setIsRunning(true);
  };

  const stopDemo = () => {
    setIsRunning(false);
  };

  const toggleTheme = () => {
    setDemoConfig(prev => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
    }));
  };

  return (
    <div class="compliance-dashboard-demo">
      <div class="demo-header">
        <h1>
          {fluentIconsPackage.getIcon("shield-checkmark") && (
            <span class="demo-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("shield-checkmark")?.outerHTML}
              />
            </span>
          )}
          🦊 ADR Compliance Dashboard Demo
        </h1>
        <p>Interactive demonstration of the Reynard Architecture Compliance Dashboard</p>

        <div class="demo-controls">
          <Show when={!isRunning()}>
            <Button onClick={startDemo} variant="primary" size="lg">
              {fluentIconsPackage.getIcon("play") && (
                <span class="button-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("play")?.outerHTML}
                  />
                </span>
              )}
              Start Demo
            </Button>
          </Show>

          <Show when={isRunning()}>
            <Button onClick={stopDemo} variant="secondary" size="lg">
              {fluentIconsPackage.getIcon("stop") && (
                <span class="button-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("stop")?.outerHTML}
                  />
                </span>
              )}
              Stop Demo
            </Button>
          </Show>

          <Button onClick={toggleTheme} variant="tertiary" size="lg">
            {fluentIconsPackage.getIcon("dark-theme") && (
              <span class="button-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("dark-theme")?.outerHTML}
                />
              </span>
            )}
            Toggle Theme
          </Button>
        </div>
      </div>

      <Show when={isRunning()}>
        <div class="demo-content">
          <Card class="demo-info">
            <h3>🎯 Demo Configuration</h3>
            <div class="config-details">
              <div class="config-item">
                <span class="config-label">Refresh Interval:</span>
                <span class="config-value">{demoConfig().refreshInterval / 1000}s</span>
              </div>
              <div class="config-item">
                <span class="config-label">Show Trends:</span>
                <span class="config-value">{demoConfig().showTrends ? "Yes" : "No"}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Show Team Metrics:</span>
                <span class="config-value">{demoConfig().showTeamMetrics ? "Yes" : "No"}</span>
              </div>
              <div class="config-item">
                <span class="config-label">Theme:</span>
                <span class="config-value">{demoConfig().theme}</span>
              </div>
            </div>
          </Card>

          <div class="dashboard-container">
            <ComplianceDashboard
              codebasePath="/home/kade/runeset/reynard"
              adrPath="/home/kade/runeset/reynard/docs/architecture/decisions"
              config={demoConfig()}
              onViolationAlert={handleViolationAlert}
              onComplianceChange={handleComplianceChange}
            />
          </div>
        </div>
      </Show>

      <Show when={!isRunning()}>
        <div class="demo-placeholder">
          <Card class="placeholder-card">
            <div class="placeholder-content">
              {fluentIconsPackage.getIcon("shield-checkmark") && (
                <div class="placeholder-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={fluentIconsPackage.getIcon("shield-checkmark")?.outerHTML}
                  />
                </div>
              )}
              <h3>Ready to Start</h3>
              <p>Click "Start Demo" to launch the interactive Compliance Dashboard</p>
              <div class="placeholder-features">
                <div class="feature-item">
                  <span class="feature-icon">📊</span>
                  <span>Real-time compliance monitoring</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🎯</span>
                  <span>Interactive charts and metrics</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">👥</span>
                  <span>Team performance tracking</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">💡</span>
                  <span>Smart recommendations</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Show>
    </div>
  );
};

export default ComplianceDashboardDemo;
